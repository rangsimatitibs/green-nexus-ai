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

interface JarvisMaterial {
  jid: string;
  formula: string;
  spg_symbol?: string;
  formation_energy_peratom?: number;
  bandgap?: number;
  bulk_modulus?: number;
  shear_modulus?: number;
  density?: number;
  volume?: number;
  natoms?: number;
}

interface MaterialResult {
  found: boolean;
  source: string;
  material?: {
    name: string;
    category: string;
    chemical_formula: string | null;
    data_source: string;
    external_id: string;
    last_synced_at: string;
    properties: Record<string, string>;
  };
  cid?: number;
  jid?: string;
}

// Search PubChem database
async function searchPubChem(name: string): Promise<MaterialResult> {
  try {
    const encodedName = encodeURIComponent(name);
    const propertyUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodedName}/property/MolecularFormula,MolecularWeight,IUPACName,XLogP,TPSA,Complexity,HBondDonorCount,HBondAcceptorCount,RotatableBondCount/JSON`;
    
    console.log(`[PubChem] Querying: ${propertyUrl}`);
    
    const response = await fetch(propertyUrl);
    
    if (!response.ok) {
      if (response.status === 404) {
        console.log(`[PubChem] Material "${name}" not found`);
        return { found: false, source: 'pubchem' };
      }
      throw new Error(`PubChem API error: ${response.status}`);
    }

    const data = await response.json();
    const properties = data.PropertyTable?.Properties?.[0] as PubChemProperty;
    
    if (!properties) {
      return { found: false, source: 'pubchem' };
    }

    console.log(`[PubChem] Found CID: ${properties.CID}`);

    const materialProperties: Record<string, string> = {};
    if (properties.MolecularWeight) materialProperties['Molecular Weight'] = `${properties.MolecularWeight} g/mol`;
    if (properties.XLogP !== undefined) materialProperties['XLogP'] = String(properties.XLogP);
    if (properties.TPSA) materialProperties['Topological Polar Surface Area'] = `${properties.TPSA} Å²`;
    if (properties.Complexity) materialProperties['Complexity'] = String(properties.Complexity);
    if (properties.HBondDonorCount !== undefined) materialProperties['H-Bond Donor Count'] = String(properties.HBondDonorCount);
    if (properties.HBondAcceptorCount !== undefined) materialProperties['H-Bond Acceptor Count'] = String(properties.HBondAcceptorCount);
    if (properties.RotatableBondCount !== undefined) materialProperties['Rotatable Bond Count'] = String(properties.RotatableBondCount);

    return {
      found: true,
      source: 'pubchem',
      material: {
        name: properties.IUPACName || name,
        category: 'Chemical Compound',
        chemical_formula: properties.MolecularFormula || null,
        data_source: 'pubchem',
        external_id: String(properties.CID),
        last_synced_at: new Date().toISOString(),
        properties: materialProperties,
      },
      cid: properties.CID,
    };
  } catch (error) {
    console.error('[PubChem] Error:', error);
    return { found: false, source: 'pubchem' };
  }
}

// Search JARVIS NIST database
async function searchJarvis(name: string): Promise<MaterialResult[]> {
  try {
    // JARVIS API endpoint for searching materials
    const encodedName = encodeURIComponent(name);
    const jarvisUrl = `https://jarvis.nist.gov/jarvisdft/search?search=${encodedName}&limit=10`;
    
    console.log(`[JARVIS] Querying: ${jarvisUrl}`);
    
    const response = await fetch(jarvisUrl, {
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.log(`[JARVIS] API returned status: ${response.status}`);
      // Try alternative JARVIS API endpoint
      return await searchJarvisAlternative(name);
    }

    const data = await response.json();
    
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.log(`[JARVIS] No results for "${name}"`);
      return [];
    }

    console.log(`[JARVIS] Found ${data.length} results`);

    return data.map((item: JarvisMaterial) => ({
      found: true,
      source: 'jarvis',
      material: {
        name: item.formula || name,
        category: 'Crystalline Material',
        chemical_formula: item.formula || null,
        data_source: 'jarvis',
        external_id: item.jid || '',
        last_synced_at: new Date().toISOString(),
        properties: buildJarvisProperties(item),
      },
      jid: item.jid,
    }));
  } catch (error) {
    console.error('[JARVIS] Error:', error);
    return [];
  }
}

// Alternative JARVIS search using their REST API
async function searchJarvisAlternative(name: string): Promise<MaterialResult[]> {
  try {
    // Try the JARVIS REST API for materials data
    const jarvisApiUrl = `https://jarvis.nist.gov/jarvisdft/jarvisdft_api/get_data?search_text=${encodeURIComponent(name)}&count=10`;
    
    console.log(`[JARVIS-Alt] Querying: ${jarvisApiUrl}`);
    
    const response = await fetch(jarvisApiUrl, {
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.log(`[JARVIS-Alt] API returned status: ${response.status}`);
      return [];
    }

    const data = await response.json();
    
    if (!data || !data.data || !Array.isArray(data.data) || data.data.length === 0) {
      console.log(`[JARVIS-Alt] No results for "${name}"`);
      return [];
    }

    console.log(`[JARVIS-Alt] Found ${data.data.length} results`);

    return data.data.map((item: JarvisMaterial) => ({
      found: true,
      source: 'jarvis',
      material: {
        name: item.formula || name,
        category: 'Crystalline Material',
        chemical_formula: item.formula || null,
        data_source: 'jarvis',
        external_id: item.jid || '',
        last_synced_at: new Date().toISOString(),
        properties: buildJarvisProperties(item),
      },
      jid: item.jid,
    }));
  } catch (error) {
    console.error('[JARVIS-Alt] Error:', error);
    return [];
  }
}

function buildJarvisProperties(item: JarvisMaterial): Record<string, string> {
  const properties: Record<string, string> = {};
  
  if (item.spg_symbol) properties['Space Group'] = item.spg_symbol;
  if (item.formation_energy_peratom !== undefined) properties['Formation Energy'] = `${item.formation_energy_peratom.toFixed(4)} eV/atom`;
  if (item.bandgap !== undefined) properties['Band Gap'] = `${item.bandgap.toFixed(3)} eV`;
  if (item.bulk_modulus !== undefined) properties['Bulk Modulus'] = `${item.bulk_modulus.toFixed(2)} GPa`;
  if (item.shear_modulus !== undefined) properties['Shear Modulus'] = `${item.shear_modulus.toFixed(2)} GPa`;
  if (item.density !== undefined) properties['Density'] = `${item.density.toFixed(3)} g/cm³`;
  if (item.volume !== undefined) properties['Volume'] = `${item.volume.toFixed(3)} ų`;
  if (item.natoms !== undefined) properties['Number of Atoms'] = String(item.natoms);
  
  return properties;
}

// Store material in Supabase
async function storeMaterial(materialData: MaterialResult['material']): Promise<string | null> {
  if (!materialData) return null;
  
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if material already exists by external_id
    const { data: existingMaterial } = await supabase
      .from('materials')
      .select('id')
      .eq('external_id', materialData.external_id)
      .maybeSingle();

    let materialId: string;

    if (existingMaterial) {
      console.log(`Updating existing material: ${existingMaterial.id}`);
      await supabase
        .from('materials')
        .update({
          name: materialData.name,
          chemical_formula: materialData.chemical_formula,
          last_synced_at: materialData.last_synced_at,
        })
        .eq('id', existingMaterial.id);
      materialId = existingMaterial.id;
    } else {
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
        return null;
      }
      materialId = newMaterial.id;
    }

    // Upsert properties
    const propertyInserts = Object.entries(materialData.properties).map(([propName, propValue]) => ({
      material_id: materialId,
      property_name: propName,
      property_value: propValue,
      property_category: 'Physical',
    }));

    if (propertyInserts.length > 0) {
      await supabase
        .from('material_properties')
        .delete()
        .eq('material_id', materialId);

      await supabase
        .from('material_properties')
        .insert(propertyInserts);
    }

    console.log(`Successfully stored material ${materialId}`);
    return materialId;
  } catch (error) {
    console.error('Error storing material:', error);
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, storeResult = true, sources = ['pubchem', 'jarvis'] } = await req.json();
    
    if (!name || typeof name !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Material name is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Fetching data for material: ${name} from sources: ${sources.join(', ')}`);

    // Search all requested sources in parallel
    const searchPromises: Promise<MaterialResult | MaterialResult[]>[] = [];
    
    if (sources.includes('pubchem')) {
      searchPromises.push(searchPubChem(name));
    }
    if (sources.includes('jarvis')) {
      searchPromises.push(searchJarvis(name));
    }

    const searchResults = await Promise.all(searchPromises);
    
    // Flatten and filter results
    const allResults: MaterialResult[] = [];
    for (const result of searchResults) {
      if (Array.isArray(result)) {
        allResults.push(...result.filter(r => r.found));
      } else if (result.found) {
        allResults.push(result);
      }
    }

    console.log(`Total results found: ${allResults.length}`);

    if (allResults.length === 0) {
      return new Response(
        JSON.stringify({ 
          found: false, 
          message: `Material "${name}" not found in any database`,
          sources: sources,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Store results if requested
    if (storeResult) {
      for (const result of allResults) {
        if (result.material) {
          await storeMaterial(result.material);
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        found: true, 
        stored: storeResult,
        results: allResults.map(r => ({
          source: r.source,
          material: r.material,
          cid: r.cid,
          jid: r.jid,
        })),
        totalResults: allResults.length,
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
