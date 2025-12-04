import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface MaterialData {
  name: string;
  synonyms: string[];
  chemical_formula: string | null;
  category: string;
  properties: Array<{ name: string; value: string; source: string; source_url?: string }>;
  applications: Array<{ name: string; source: string }>;
  regulations: Array<{ name: string; source: string }>;
  sustainability: { score: number; breakdown: Record<string, number>; source: string } | null;
  suppliers: Array<{ company: string; country: string; source: string }>;
  ai_summary: string;
  sources_used: string[];
}

interface ExternalSource {
  name: string;
  properties: Record<string, string>;
  formula?: string;
  url?: string;
}

// Search local database including synonyms
async function searchLocalDatabase(supabase: any, query: string): Promise<any[]> {
  console.log(`[Local] Searching for: ${query}`);
  
  // First check synonyms
  const { data: synonymMatches } = await supabase
    .from('material_synonyms')
    .select('material_id')
    .ilike('synonym', `%${query}%`);
  
  const synonymMaterialIds = synonymMatches?.map((s: any) => s.material_id) || [];
  
  // Search materials by name, formula, or through synonyms
  const { data: materials, error } = await supabase.rpc('search_materials', {
    search_term: query,
    result_limit: 20
  });
  
  if (error) {
    console.error('[Local] Search error:', error);
    return [];
  }
  
  // Combine results and fetch full details
  const materialIds = new Set([
    ...(materials || []).map((m: any) => m.id),
    ...synonymMaterialIds
  ]);
  
  if (materialIds.size === 0) {
    console.log('[Local] No results found');
    return [];
  }
  
  // Fetch full material details
  const { data: fullMaterials } = await supabase
    .from('materials')
    .select('*')
    .in('id', Array.from(materialIds));
  
  if (!fullMaterials || fullMaterials.length === 0) return [];
  
  // Fetch related data for each material
  const results = await Promise.all(fullMaterials.map(async (material: any) => {
    const [propsRes, appsRes, regsRes, sustainRes, suppliersRes, synonymsRes] = await Promise.all([
      supabase.from('material_properties').select('*').eq('material_id', material.id),
      supabase.from('material_applications').select('*').eq('material_id', material.id),
      supabase.from('material_regulations').select('*').eq('material_id', material.id),
      supabase.from('material_sustainability').select('*').eq('material_id', material.id).maybeSingle(),
      supabase.from('suppliers').select('*').eq('material_id', material.id),
      supabase.from('material_synonyms').select('synonym').eq('material_id', material.id)
    ]);
    
    return {
      ...material,
      properties: propsRes.data || [],
      applications: appsRes.data || [],
      regulations: regsRes.data || [],
      sustainability: sustainRes.data,
      suppliers: suppliersRes.data || [],
      synonyms: synonymsRes.data?.map((s: any) => s.synonym) || []
    };
  }));
  
  console.log(`[Local] Found ${results.length} materials`);
  return results;
}

// Search PubChem for chemical data
async function searchPubChem(query: string): Promise<ExternalSource | null> {
  try {
    console.log(`[PubChem] Searching for: ${query}`);
    const encodedQuery = encodeURIComponent(query);
    const url = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodedQuery}/property/MolecularFormula,MolecularWeight,IUPACName,XLogP,TPSA,Complexity,HBondDonorCount,HBondAcceptorCount,ExactMass,MonoisotopicMass/JSON`;
    
    const response = await fetch(url);
    if (!response.ok) {
      if (response.status === 404) {
        console.log(`[PubChem] Not found: ${query}`);
        return null;
      }
      throw new Error(`PubChem API error: ${response.status}`);
    }
    
    const data = await response.json();
    const props = data.PropertyTable?.Properties?.[0];
    if (!props) return null;
    
    const properties: Record<string, string> = {};
    if (props.MolecularWeight) properties['Molecular Weight'] = `${props.MolecularWeight} g/mol`;
    if (props.IUPACName) properties['IUPAC Name'] = props.IUPACName;
    if (props.XLogP !== undefined) properties['XLogP (Lipophilicity)'] = String(props.XLogP);
    if (props.TPSA) properties['Topological Polar Surface Area'] = `${props.TPSA} Å²`;
    if (props.Complexity) properties['Molecular Complexity'] = String(props.Complexity);
    if (props.HBondDonorCount !== undefined) properties['H-Bond Donors'] = String(props.HBondDonorCount);
    if (props.HBondAcceptorCount !== undefined) properties['H-Bond Acceptors'] = String(props.HBondAcceptorCount);
    if (props.ExactMass) properties['Exact Mass'] = `${props.ExactMass} g/mol`;
    
    console.log(`[PubChem] Found CID: ${props.CID}`);
    return {
      name: 'PubChem',
      properties,
      formula: props.MolecularFormula,
      url: `https://pubchem.ncbi.nlm.nih.gov/compound/${props.CID}`
    };
  } catch (error) {
    console.error('[PubChem] Error:', error);
    return null;
  }
}

// Search Materials Project for material properties
async function searchMaterialsProject(formula: string): Promise<ExternalSource | null> {
  const apiKey = Deno.env.get('MATERIALS_PROJECT_API_KEY');
  if (!apiKey || !formula) {
    console.log('[MaterialsProject] No API key or formula');
    return null;
  }
  
  try {
    console.log(`[MaterialsProject] Searching for formula: ${formula}`);
    const cleanFormula = formula.replace(/[()]/g, '').replace(/\d+/g, '');
    
    const url = `https://api.materialsproject.org/materials/summary/?formula=${encodeURIComponent(cleanFormula)}&_fields=material_id,formula_pretty,symmetry,band_gap,density,volume,formation_energy_per_atom,energy_above_hull&_limit=5`;
    
    const response = await fetch(url, {
      headers: {
        'X-API-KEY': apiKey,
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.log(`[MaterialsProject] API error: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    if (!data.data || data.data.length === 0) {
      console.log('[MaterialsProject] No results');
      return null;
    }
    
    const material = data.data[0];
    const properties: Record<string, string> = {};
    
    if (material.density) properties['Density'] = `${material.density.toFixed(3)} g/cm³`;
    if (material.band_gap !== undefined) properties['Band Gap'] = `${material.band_gap.toFixed(3)} eV`;
    if (material.formation_energy_per_atom !== undefined) properties['Formation Energy'] = `${material.formation_energy_per_atom.toFixed(4)} eV/atom`;
    if (material.energy_above_hull !== undefined) properties['Energy Above Hull'] = `${material.energy_above_hull.toFixed(4)} eV/atom`;
    if (material.volume) properties['Unit Cell Volume'] = `${material.volume.toFixed(3)} ų`;
    if (material.symmetry?.crystal_system) properties['Crystal System'] = material.symmetry.crystal_system;
    if (material.symmetry?.symbol) properties['Space Group'] = material.symmetry.symbol;
    
    console.log(`[MaterialsProject] Found: ${material.material_id}`);
    return {
      name: 'Materials Project',
      properties,
      formula: material.formula_pretty,
      url: `https://next-gen.materialsproject.org/materials/${material.material_id}`
    };
  } catch (error) {
    console.error('[MaterialsProject] Error:', error);
    return null;
  }
}

// Use AI to generate summary and fill gaps
async function generateAISummary(
  materialName: string,
  localData: any | null,
  externalSources: ExternalSource[]
): Promise<{ summary: string; synonyms: string[] }> {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  if (!LOVABLE_API_KEY) {
    return { summary: '', synonyms: [] };
  }
  
  try {
    const context = {
      name: materialName,
      localProperties: localData?.properties?.map((p: any) => `${p.property_name}: ${p.property_value}`).join(', ') || 'None',
      localApplications: localData?.applications?.map((a: any) => a.application).join(', ') || 'None',
      externalProperties: externalSources.map(s => 
        `${s.name}: ${Object.entries(s.properties).map(([k, v]) => `${k}=${v}`).join(', ')}`
      ).join('; ')
    };
    
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are a materials science expert. Generate a concise 2-3 sentence summary of the material and list common synonyms/abbreviations. Return JSON: {"summary": "...", "synonyms": ["...", "..."]}`
          },
          {
            role: 'user',
            content: `Material: ${materialName}\nLocal Data: Properties: ${context.localProperties}, Applications: ${context.localApplications}\nExternal Data: ${context.externalProperties}\n\nProvide a summary and list of synonyms/alternative names for this material.`
          }
        ],
        temperature: 0.3
      })
    });
    
    if (!response.ok) {
      console.log('[AI] API error:', response.status);
      return { summary: '', synonyms: [] };
    }
    
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        summary: parsed.summary || '',
        synonyms: parsed.synonyms || []
      };
    }
    
    return { summary: content, synonyms: [] };
  } catch (error) {
    console.error('[AI] Error:', error);
    return { summary: '', synonyms: [] };
  }
}

// Main handler
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { query, includeAISummary = true } = await req.json();
    
    if (!query || typeof query !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Query is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`[AI-Search] Processing query: ${query}`);
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Search all sources in parallel
    const [localResults, pubchemResult, materialsProjectResult] = await Promise.all([
      searchLocalDatabase(supabase, query),
      searchPubChem(query),
      searchMaterialsProject(query)
    ]);
    
    const externalSources: ExternalSource[] = [];
    if (pubchemResult) externalSources.push(pubchemResult);
    if (materialsProjectResult) externalSources.push(materialsProjectResult);
    
    // Build consolidated results
    const results: MaterialData[] = [];
    const sourcesUsed = new Set<string>();
    
    // Process local results first (primary source)
    for (const local of localResults) {
      sourcesUsed.add('Your Database');
      
      const properties: MaterialData['properties'] = local.properties.map((p: any) => ({
        name: p.property_name,
        value: p.property_value,
        source: 'Your Database',
        source_url: undefined
      }));
      
      // Add external properties
      for (const ext of externalSources) {
        sourcesUsed.add(ext.name);
        for (const [name, value] of Object.entries(ext.properties)) {
          if (!properties.find(p => p.name.toLowerCase() === name.toLowerCase())) {
            properties.push({ name, value, source: ext.name, source_url: ext.url });
          }
        }
      }
      
      // Generate AI summary if enabled
      let aiSummary = '';
      let aiSynonyms: string[] = [];
      if (includeAISummary) {
        const aiResult = await generateAISummary(local.name, local, externalSources);
        aiSummary = aiResult.summary;
        aiSynonyms = aiResult.synonyms;
        if (aiSummary) sourcesUsed.add('AI Analysis');
      }
      
      results.push({
        name: local.name,
        synonyms: [...new Set([...local.synonyms, ...aiSynonyms])],
        chemical_formula: local.chemical_formula || pubchemResult?.formula || null,
        category: local.category,
        properties,
        applications: local.applications.map((a: any) => ({ name: a.application, source: 'Your Database' })),
        regulations: local.regulations.map((r: any) => ({ name: r.regulation, source: 'Your Database' })),
        sustainability: local.sustainability ? {
          score: local.sustainability.overall_score,
          breakdown: {
            renewable: local.sustainability.renewable_score,
            carbonFootprint: local.sustainability.carbon_footprint_score,
            biodegradability: local.sustainability.biodegradability_score,
            toxicity: local.sustainability.toxicity_score
          },
          source: 'Your Database'
        } : null,
        suppliers: local.suppliers.map((s: any) => ({
          company: s.company_name,
          country: s.country,
          source: 'Your Database'
        })),
        ai_summary: aiSummary,
        sources_used: Array.from(sourcesUsed)
      });
    }
    
    // If no local results, create entry from external sources
    if (localResults.length === 0 && externalSources.length > 0) {
      const properties: MaterialData['properties'] = [];
      
      for (const ext of externalSources) {
        sourcesUsed.add(ext.name);
        for (const [name, value] of Object.entries(ext.properties)) {
          properties.push({ name, value, source: ext.name, source_url: ext.url });
        }
      }
      
      let aiSummary = '';
      let aiSynonyms: string[] = [];
      if (includeAISummary) {
        const aiResult = await generateAISummary(query, null, externalSources);
        aiSummary = aiResult.summary;
        aiSynonyms = aiResult.synonyms;
        if (aiSummary) sourcesUsed.add('AI Analysis');
      }
      
      results.push({
        name: pubchemResult?.properties['IUPAC Name'] || query,
        synonyms: aiSynonyms,
        chemical_formula: pubchemResult?.formula || materialsProjectResult?.formula || null,
        category: 'Chemical Compound',
        properties,
        applications: [],
        regulations: [],
        sustainability: null,
        suppliers: [],
        ai_summary: aiSummary,
        sources_used: Array.from(sourcesUsed)
      });
    }
    
    console.log(`[AI-Search] Returning ${results.length} results from ${sourcesUsed.size} sources`);
    
    return new Response(
      JSON.stringify({
        query,
        results,
        totalResults: results.length,
        sourcesUsed: Array.from(sourcesUsed)
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error: unknown) {
    console.error('[AI-Search] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
