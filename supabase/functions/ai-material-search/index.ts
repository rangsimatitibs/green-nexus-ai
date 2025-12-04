import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface MaterialData {
  name: string;
  iupac_name: string | null;
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
  matchScore?: number;
}

interface ExternalSource {
  name: string;
  properties: Record<string, string>;
  formula?: string;
  url?: string;
}

// Use AI to expand query into related search terms
async function expandQueryWithAI(query: string): Promise<string[]> {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  if (!LOVABLE_API_KEY) {
    console.log('[AI-Expand] No API key, returning original query');
    return [query];
  }

  try {
    console.log(`[AI-Expand] Expanding query: ${query}`);
    
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
            content: `You are a materials science expert. Given a search query about materials, expand it into specific material names that should be searched. 
            
For category queries like "bioplastics", return specific materials in that category (e.g., PLA, PHA, PBS, PBAT, PCL, PVA, starch).
For specific materials, return the material name plus common abbreviations and synonyms.
For property queries like "biodegradable plastics", return materials with that property.

Return ONLY a JSON array of strings, no explanation. Maximum 15 terms. Example: ["PLA", "polylactic acid", "PHA", "polyhydroxyalkanoates", "PBS"]`
          },
          { 
            role: 'user', 
            content: `Expand this material search query into specific searchable terms: "${query}"` 
          }
        ],
        temperature: 0.3
      })
    });

    if (!response.ok) {
      console.log(`[AI-Expand] API error: ${response.status}`);
      return [query];
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    // Parse JSON array from response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const terms = JSON.parse(jsonMatch[0]);
      console.log(`[AI-Expand] Expanded to ${terms.length} terms:`, terms.slice(0, 5));
      return [...new Set([query, ...terms])]; // Include original query
    }
    
    return [query];
  } catch (error) {
    console.error('[AI-Expand] Error:', error);
    return [query];
  }
}

// Search Wikipedia for material information
async function searchWikipedia(query: string): Promise<ExternalSource | null> {
  try {
    console.log(`[Wikipedia] Searching for: ${query}`);
    const encodedQuery = encodeURIComponent(query);
    
    // First, search for the page
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodedQuery}&format=json&origin=*`;
    const searchResponse = await fetch(searchUrl);
    
    if (!searchResponse.ok) {
      console.log(`[Wikipedia] Search error: ${searchResponse.status}`);
      return null;
    }
    
    const searchData = await searchResponse.json();
    const firstResult = searchData.query?.search?.[0];
    
    if (!firstResult) {
      console.log(`[Wikipedia] No results for: ${query}`);
      return null;
    }
    
    // Get page extract
    const pageTitle = encodeURIComponent(firstResult.title);
    const extractUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${pageTitle}&prop=extracts&exintro=true&explaintext=true&format=json&origin=*`;
    const extractResponse = await fetch(extractUrl);
    
    if (!extractResponse.ok) {
      return null;
    }
    
    const extractData = await extractResponse.json();
    const pages = extractData.query?.pages;
    const pageId = Object.keys(pages)[0];
    const extract = pages[pageId]?.extract;
    
    if (!extract || extract.length < 50) {
      return null;
    }
    
    // Extract useful properties from the text
    const properties: Record<string, string> = {};
    properties['Description'] = extract.substring(0, 500) + (extract.length > 500 ? '...' : '');
    
    console.log(`[Wikipedia] Found: ${firstResult.title}`);
    return {
      name: 'Wikipedia',
      properties,
      url: `https://en.wikipedia.org/wiki/${pageTitle}`
    };
  } catch (error) {
    console.error('[Wikipedia] Error:', error);
    return null;
  }
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
    result_limit: 50
  });
  
  if (error) {
    console.error('[Local] Search error:', error);
    return [];
  }
  
  // Also search by category
  const { data: categoryMatches } = await supabase
    .from('materials')
    .select('id')
    .ilike('category', `%${query}%`);
  
  const categoryMaterialIds = categoryMatches?.map((m: any) => m.id) || [];
  
  // Combine results and fetch full details
  const materialIds = new Set([
    ...(materials || []).map((m: any) => m.id),
    ...synonymMaterialIds,
    ...categoryMaterialIds
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

// Check if a name looks like a long IUPAC name
function isLongIUPACName(name: string): boolean {
  return name.length > 60 && (
    name.includes('oxan') || 
    name.includes('yl]') || 
    name.includes('hydroxy') ||
    name.includes('amino') ||
    /\[\d[SR],\d[SR]/.test(name)
  );
}

// Use AI to generate summary, common name, and synonyms
async function generateAISummary(
  materialName: string,
  localData: any | null,
  externalSources: ExternalSource[]
): Promise<{ summary: string; synonyms: string[]; commonName: string | null }> {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  if (!LOVABLE_API_KEY) {
    return { summary: '', synonyms: [], commonName: null };
  }
  
  try {
    const isLongName = isLongIUPACName(materialName);
    const context = {
      name: materialName,
      localProperties: localData?.properties?.map((p: any) => `${p.property_name}: ${p.property_value}`).join(', ') || 'None',
      localApplications: localData?.applications?.map((a: any) => a.application).join(', ') || 'None',
      externalProperties: externalSources.map(s => 
        `${s.name}: ${Object.entries(s.properties).map(([k, v]) => `${k}=${v}`).join(', ')}`
      ).join('; ')
    };
    
    const systemPrompt = isLongName
      ? `You are a materials science expert. The material name provided is a long IUPAC systematic name. Your MOST IMPORTANT task is to identify the common/trivial name for this compound. Return JSON: {"commonName": "short common name like Chitosan, Cellulose, etc.", "summary": "2-3 sentence description", "synonyms": ["abbreviation", "other names"]}`
      : `You are a materials science expert. Generate a concise 2-3 sentence summary and list common synonyms/abbreviations. Return JSON: {"commonName": null, "summary": "...", "synonyms": ["...", "..."]}`;
    
    const userPrompt = isLongName
      ? `This is a long IUPAC name: ${materialName}\n\nWhat is the COMMON NAME for this compound? For example, if it's a polysaccharide chain with amino groups, it might be Chitosan. If it contains glucose units, it might be Cellulose or Starch.\n\nExternal Data: ${context.externalProperties}\n\nProvide the common name, a brief summary, and synonyms.`
      : `Material: ${materialName}\nLocal Data: Properties: ${context.localProperties}, Applications: ${context.localApplications}\nExternal Data: ${context.externalProperties}\n\nProvide a summary and list of synonyms/alternative names for this material.`;
    
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3
      })
    });
    
    if (!response.ok) {
      console.log('[AI] API error:', response.status);
      return { summary: '', synonyms: [], commonName: null };
    }
    
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        summary: parsed.summary || '',
        synonyms: parsed.synonyms || [],
        commonName: parsed.commonName || null
      };
    }
    
    return { summary: content, synonyms: [], commonName: null };
  } catch (error) {
    console.error('[AI] Error:', error);
    return { summary: '', synonyms: [], commonName: null };
  }
}

// Generate regulations using AI based on material properties
async function generateRegulationsWithAI(material: {
  name: string;
  category: string;
  applications: string[];
}): Promise<Array<{ name: string; source: string }>> {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  if (!LOVABLE_API_KEY) {
    console.log('[AI-Regulations] No API key');
    return [];
  }

  try {
    console.log(`[AI-Regulations] Generating for: ${material.name}`);
    
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
            content: `You are a materials science regulatory expert. Given a material name, category, and applications, determine which regulatory standards and certifications are LIKELY applicable.

Common regulations to consider:
- Food Contact: FDA 21 CFR, EU 10/2011, GRAS status
- Packaging: ASTM D6400 (compostability), EN 13432 (EU composting)
- Environmental: REACH, RoHS, California Prop 65
- Medical/Biocompatible: ISO 10993, USP Class VI
- Biodegradability: ISO 14855, ASTM D5338
- Bio-based: USDA BioPreferred, OK Biobased, TUV Austria

Return ONLY a JSON array of regulation names that are likely applicable. Be specific. Example: ["FDA 21 CFR (Food Contact)", "ASTM D6400 (Industrial Compostability)", "EN 13432 (EU Packaging)"]
Maximum 6 regulations. Only include regulations that are genuinely relevant to the material type.`
          },
          { 
            role: 'user', 
            content: `Material: ${material.name}
Category: ${material.category}
Applications: ${material.applications.join(', ') || 'General use'}

What regulatory standards likely apply to this material?` 
          }
        ],
        temperature: 0.3
      })
    });

    if (!response.ok) {
      console.log(`[AI-Regulations] API error: ${response.status}`);
      return [];
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const regulations = JSON.parse(jsonMatch[0]);
      console.log(`[AI-Regulations] Generated ${regulations.length} regulations`);
      return regulations.map((reg: string) => ({ name: reg, source: 'AI Analysis' }));
    }
    
    return [];
  } catch (error) {
    console.error('[AI-Regulations] Error:', error);
    return [];
  }
}

// Build MaterialData from local result
async function buildMaterialData(
  local: any,
  externalSources: ExternalSource[],
  sourcesUsed: Set<string>,
  aiSummary: string,
  aiSynonyms: string[],
  aiCommonName: string | null,
  pubchemResult: ExternalSource | null,
  matchScore: number
): Promise<MaterialData> {
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
  
  if (aiSummary) sourcesUsed.add('AI Analysis');
  
  // Use common name if available and original name is long IUPAC
  const displayName = (aiCommonName && isLongIUPACName(local.name)) ? aiCommonName : local.name;
  
  // Get regulations - use local if available, otherwise generate with AI
  let regulations: Array<{ name: string; source: string }> = [];
  if (local.regulations && local.regulations.length > 0) {
    regulations = local.regulations.map((r: any) => ({ name: r.regulation, source: 'Your Database' }));
  } else {
    // Generate regulations with AI
    const applications = local.applications.map((a: any) => a.application);
    regulations = await generateRegulationsWithAI({
      name: displayName,
      category: local.category,
      applications
    });
    if (regulations.length > 0) {
      sourcesUsed.add('AI Analysis');
    }
  }
  
  return {
    name: displayName,
    iupac_name: isLongIUPACName(local.name) ? local.name : null,
    synonyms: [...new Set([...local.synonyms, ...aiSynonyms, ...(aiCommonName ? [aiCommonName] : [])])],
    chemical_formula: local.chemical_formula || pubchemResult?.formula || null,
    category: local.category,
    properties,
    applications: local.applications.map((a: any) => ({ name: a.application, source: 'Your Database' })),
    regulations,
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
    sources_used: Array.from(sourcesUsed),
    matchScore
  };
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
    
    // Step 1: Expand query using AI to get related terms
    const expandedTerms = await expandQueryWithAI(query);
    console.log(`[AI-Search] Searching ${expandedTerms.length} terms`);
    
    // Step 2: Search all sources in parallel for all expanded terms
    const allLocalResults: Map<string, any> = new Map(); // Use map to dedupe by ID
    const externalResults: Map<string, ExternalSource> = new Map();
    
    // Search local database for all expanded terms in parallel
    const localSearchPromises = expandedTerms.slice(0, 10).map(term => 
      searchLocalDatabase(supabase, term).then(results => ({ term, results }))
    );
    
    // Also search external sources for the original query
    const externalPromises = [
      searchPubChem(query),
      searchMaterialsProject(query),
      searchWikipedia(query)
    ];
    
    const [localSearchResults, ...externalSearchResults] = await Promise.all([
      Promise.all(localSearchPromises),
      ...externalPromises
    ]);
    
    // Merge local results with match scoring based on name relevance
    const queryLower = query.toLowerCase().trim();
    
    for (const { term, results } of localSearchResults) {
      for (const result of results) {
        const existing = allLocalResults.get(result.id);
        const nameLower = result.name.toLowerCase().trim();
        const synonymsLower = (result.synonyms || []).map((s: string) => s.toLowerCase().trim());
        
        // Score based on how well the MATERIAL NAME matches the original query
        let newScore = 50; // Base score
        
        // Exact name match (case-insensitive)
        if (nameLower === queryLower) {
          newScore = 100;
        }
        // Name starts with query (e.g., "PLA" matches "PLA-based material")
        else if (nameLower.startsWith(queryLower + ' ') || nameLower.startsWith(queryLower + '-')) {
          newScore = 95;
        }
        // Query is an exact synonym match
        else if (synonymsLower.includes(queryLower)) {
          newScore = 90;
        }
        // Name contains query as a word
        else if (nameLower.includes(queryLower)) {
          newScore = 85;
        }
        // Query matches partial synonym
        else if (synonymsLower.some((s: string) => s.includes(queryLower) || queryLower.includes(s))) {
          newScore = 75;
        }
        // Found via expanded search term match
        else if (term.toLowerCase() === queryLower) {
          newScore = 70;
        }
        // Found via related term
        else {
          newScore = 60;
        }
        
        if (!existing || (existing.matchScore || 0) < newScore) {
          allLocalResults.set(result.id, { ...result, matchScore: newScore });
        }
      }
    }
    
    // Collect external sources
    const [pubchemResult, materialsProjectResult, wikipediaResult] = externalSearchResults as [ExternalSource | null, ExternalSource | null, ExternalSource | null];
    
    if (pubchemResult) externalResults.set('pubchem', pubchemResult);
    if (materialsProjectResult) externalResults.set('materials_project', materialsProjectResult);
    if (wikipediaResult) externalResults.set('wikipedia', wikipediaResult);
    
    const externalSources = Array.from(externalResults.values());
    const sourcesUsed = new Set<string>();
    const results: MaterialData[] = [];
    
    // Process local results
    const localResultsArray = Array.from(allLocalResults.values())
      .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
    
    console.log(`[AI-Search] Processing ${localResultsArray.length} unique local results`);
    
    // Generate AI summaries in batches (skip for large result sets to save time)
    const shouldGenerateSummaries = includeAISummary && localResultsArray.length <= 5;
    
    for (const local of localResultsArray) {
      let aiSummary = '';
      let aiSynonyms: string[] = [];
      let aiCommonName: string | null = null;
      
      if (shouldGenerateSummaries) {
        const aiResult = await generateAISummary(local.name, local, externalSources);
        aiSummary = aiResult.summary;
        aiSynonyms = aiResult.synonyms;
        aiCommonName = aiResult.commonName;
      }
      
      results.push(await buildMaterialData(
        local,
        externalSources,
        sourcesUsed,
        aiSummary,
        aiSynonyms,
        aiCommonName,
        pubchemResult,
        local.matchScore || 50
      ));
    }
    
    // If no local results, create entry from external sources
    if (localResultsArray.length === 0 && externalSources.length > 0) {
      const properties: MaterialData['properties'] = [];
      
      for (const ext of externalSources) {
        sourcesUsed.add(ext.name);
        for (const [name, value] of Object.entries(ext.properties)) {
          properties.push({ name, value, source: ext.name, source_url: ext.url });
        }
      }
      
      let aiSummary = '';
      let aiSynonyms: string[] = [];
      let aiCommonName: string | null = null;
      
      const rawName = pubchemResult?.properties['IUPAC Name'] || query;
      
      if (includeAISummary) {
        const aiResult = await generateAISummary(rawName, null, externalSources);
        aiSummary = aiResult.summary;
        aiSynonyms = aiResult.synonyms;
        aiCommonName = aiResult.commonName;
        if (aiSummary) sourcesUsed.add('AI Analysis');
      }
      
      const displayName = (aiCommonName && isLongIUPACName(rawName)) ? aiCommonName : rawName;
      
      // Generate AI regulations for external-only results
      const aiRegulations = await generateRegulationsWithAI({
        name: displayName,
        category: 'Chemical Compound',
        applications: []
      });
      if (aiRegulations.length > 0) {
        sourcesUsed.add('AI Analysis');
      }
      
      results.push({
        name: displayName,
        iupac_name: isLongIUPACName(rawName) ? rawName : null,
        synonyms: [...new Set([...aiSynonyms, ...(aiCommonName ? [aiCommonName] : [])])],
        chemical_formula: pubchemResult?.formula || materialsProjectResult?.formula || null,
        category: 'Chemical Compound',
        properties,
        applications: [],
        regulations: aiRegulations,
        sustainability: null,
        suppliers: [],
        ai_summary: aiSummary,
        sources_used: Array.from(sourcesUsed),
        matchScore: 30
      });
    }
    
    // Sort by match score
    results.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
    
    console.log(`[AI-Search] Returning ${results.length} results from ${sourcesUsed.size} sources`);
    
    return new Response(
      JSON.stringify({
        query,
        expandedTerms,
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
