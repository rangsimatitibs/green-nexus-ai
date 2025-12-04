import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PubChemProperty {
  CID: number;
  MolecularFormula?: string;
  MolecularWeight?: number;
  IUPACName?: string;
  XLogP?: number;
  TPSA?: number;
  Complexity?: number;
  HBondDonorCount?: number;
  HBondAcceptorCount?: number;
  RotatableBondCount?: number;
}

interface PubChemCompound {
  id: { id: { cid: number } };
  props?: Array<{
    urn: { label: string; name?: string };
    value: { sval?: string; fval?: number; ival?: number };
  }>;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, storeResult = true } = await req.json();
    
    if (!name || typeof name !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Material name is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Fetching data for material: ${name}`);

    // Query PubChem for compound properties
    const encodedName = encodeURIComponent(name);
    const propertyUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodedName}/property/MolecularFormula,MolecularWeight,IUPACName,XLogP,TPSA,Complexity,HBondDonorCount,HBondAcceptorCount,RotatableBondCount/JSON`;
    
    console.log(`Querying PubChem: ${propertyUrl}`);
    
    const propertyResponse = await fetch(propertyUrl);
    
    if (!propertyResponse.ok) {
      if (propertyResponse.status === 404) {
        console.log(`Material "${name}" not found in PubChem`);
        return new Response(
          JSON.stringify({ 
            found: false, 
            message: `Material "${name}" not found in PubChem database`,
            source: 'pubchem'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`PubChem API error: ${propertyResponse.status}`);
    }

    const propertyData = await propertyResponse.json();
    const properties = propertyData.PropertyTable?.Properties?.[0] as PubChemProperty;
    
    if (!properties) {
      return new Response(
        JSON.stringify({ found: false, message: 'No properties found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found PubChem CID: ${properties.CID}`);

    // Build properties, filtering out nulls
    const materialProperties: Record<string, string> = {};
    if (properties.MolecularWeight) materialProperties['Molecular Weight'] = `${properties.MolecularWeight} g/mol`;
    if (properties.XLogP !== undefined) materialProperties['XLogP'] = String(properties.XLogP);
    if (properties.TPSA) materialProperties['Topological Polar Surface Area'] = `${properties.TPSA} Å²`;
    if (properties.Complexity) materialProperties['Complexity'] = String(properties.Complexity);
    if (properties.HBondDonorCount !== undefined) materialProperties['H-Bond Donor Count'] = String(properties.HBondDonorCount);
    if (properties.HBondAcceptorCount !== undefined) materialProperties['H-Bond Acceptor Count'] = String(properties.HBondAcceptorCount);
    if (properties.RotatableBondCount !== undefined) materialProperties['Rotatable Bond Count'] = String(properties.RotatableBondCount);

    // Build material data
    const materialData = {
      name: properties.IUPACName || name,
      category: 'Chemical Compound',
      chemical_formula: properties.MolecularFormula || null,
      data_source: 'pubchem',
      external_id: String(properties.CID),
      last_synced_at: new Date().toISOString(),
      properties: materialProperties,
    };

    const filteredProperties = materialProperties;

    // Optionally store in database
    if (storeResult) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Check if material already exists by external_id
      const { data: existingMaterial } = await supabase
        .from('materials')
        .select('id')
        .eq('external_id', String(properties.CID))
        .maybeSingle();

      let materialId: string;

      if (existingMaterial) {
        // Update existing material
        console.log(`Updating existing material: ${existingMaterial.id}`);
        const { error: updateError } = await supabase
          .from('materials')
          .update({
            name: materialData.name,
            chemical_formula: materialData.chemical_formula,
            last_synced_at: materialData.last_synced_at,
          })
          .eq('id', existingMaterial.id);

        if (updateError) {
          console.error('Error updating material:', updateError);
        }
        materialId = existingMaterial.id;
      } else {
        // Insert new material
        console.log('Inserting new material');
        const { data: newMaterial, error: insertError } = await supabase
          .from('materials')
          .insert({
            name: materialData.name,
            category: materialData.category,
            chemical_formula: materialData.chemical_formula,
            data_source: materialData.data_source,
            external_id: materialData.external_id,
            last_synced_at: materialData.last_synced_at,
          })
          .select('id')
          .single();

        if (insertError) {
          console.error('Error inserting material:', insertError);
          // Return the data anyway, just not stored
          return new Response(
            JSON.stringify({ 
              found: true, 
              stored: false,
              material: materialData,
              source: 'pubchem',
              cid: properties.CID
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        materialId = newMaterial.id;
      }

      // Upsert properties
      const propertyInserts = Object.entries(filteredProperties).map(([propName, propValue]) => ({
        material_id: materialId,
        property_name: propName,
        property_value: propValue,
        property_category: 'Physical',
      }));

      if (propertyInserts.length > 0) {
        // Delete existing properties for this material first
        await supabase
          .from('material_properties')
          .delete()
          .eq('material_id', materialId);

        const { error: propError } = await supabase
          .from('material_properties')
          .insert(propertyInserts);

        if (propError) {
          console.error('Error inserting properties:', propError);
        }
      }

      console.log(`Successfully stored material ${materialId}`);
    }

    return new Response(
      JSON.stringify({ 
        found: true, 
        stored: storeResult,
        material: materialData,
        source: 'pubchem',
        cid: properties.CID
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error fetching material data:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
