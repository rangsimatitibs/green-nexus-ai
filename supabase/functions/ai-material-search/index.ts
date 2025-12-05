import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

type PropertyCategory = 'description' | 'physical' | 'mechanical' | 'thermal' | 'safety' | 'environmental';

interface PropertyRequirement {
  property: string;
  value: string;
  unit: string;
  importance: 'must-have' | 'preferred' | 'nice-to-have';
}

interface PropertyMatchResult {
  property: string;
  required: string;
  actual: string | null;
  matches: boolean;
  matchType: 'exact' | 'range' | 'partial' | 'ai-estimated' | 'not-found';
  confidence: number;
}

interface MaterialData {
  name: string;
  iupac_name: string | null;
  synonyms: string[];
  chemical_formula: string | null;
  category: string;
  properties: Array<{ name: string; value: string; source: string; source_url?: string; category?: PropertyCategory }>;
  applications: Array<{ name: string; source: string }>;
  regulations: Array<{ name: string; source: string }>;
  sustainability: { score: number; breakdown: Record<string, number>; source: string; justification?: string } | null;
  suppliers: Array<{ company: string; country: string; source: string }>;
  ai_summary: string;
  sources_used: string[];
  matchScore?: number;
  material_source?: string[];
  propertyMatches?: PropertyMatchResult[];
  requirementMatchScore?: number;
}

// Property categorization mapping
const CATEGORY_MAPPINGS: Record<PropertyCategory, string[]> = {
  description: [
    'iupac', 'name', 'cas', 'formula', 'description', 'molecular weight', 
    'synonym', 'chemical structure', 'complexity', 'exact mass', 'monoisotopic'
  ],
  physical: [
    'density', 'solubility', 'melting', 'boiling', 'crystal', 'space group',
    'xlogp', 'lipophilicity', 'polar surface', 'h-bond', 'hydrogen bond',
    'unit cell', 'band gap', 'formation energy', 'energy above hull',
    'refractive', 'viscosity', 'color', 'appearance', 'odor', 'ph'
  ],
  mechanical: [
    'tensile', 'strength', 'elongation', 'modulus', 'hardness', 'young',
    'shear', 'flexural', 'compressive', 'impact', 'fatigue', 'creep',
    'wear', 'friction', 'elasticity', 'stiffness', 'ductility', 'brittleness'
  ],
  thermal: [
    'thermal', 'conductivity', 'expansion', 'glass transition', 'heat',
    'specific heat', 'flammability', 'ignition', 'decomposition', 'hdt',
    'deflection temperature', 'vicat', 'service temperature'
  ],
  safety: [
    'hazard', 'health', 'ppe', 'protective', 'safety', 'toxic', 
    'ghs', 'classification', 'warning', 'caution', 'msds', 'sds',
    'exposure', 'limit', 'lethal', 'ld50', 'carcinogenic', 'mutagenic'
  ],
  environmental: [
    'biodegradable', 'biodegradability', 'compostable', 'renewable',
    'recyclable', 'carbon footprint', 'sustainability', 'eco', 
    'environmental', 'bio-based', 'lifecycle', 'lca'
  ]
};

function categorizeProperty(propertyName: string): PropertyCategory {
  const lowerName = propertyName.toLowerCase();
  
  for (const [category, keywords] of Object.entries(CATEGORY_MAPPINGS)) {
    for (const keyword of keywords) {
      if (lowerName.includes(keyword)) {
        return category as PropertyCategory;
      }
    }
  }
  
  return 'physical'; // Default
}

interface ExternalSource {
  name: string;
  properties: Record<string, string>;
  formula?: string;
  url?: string;
}

// Fetch excluded terms from database
let excludedTermsCache: Set<string> | null = null;
let excludedTermsCacheTime: number = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function getExcludedTerms(): Promise<Set<string>> {
  const now = Date.now();
  
  // Return cached terms if still valid
  if (excludedTermsCache && (now - excludedTermsCacheTime) < CACHE_TTL) {
    return excludedTermsCache;
  }
  
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { data, error } = await supabase
      .from('excluded_search_terms')
      .select('term');
    
    if (error) {
      console.log('[ExcludedTerms] Error fetching from database:', error.message);
      // Return empty set on error, don't fail the whole search
      return new Set();
    }
    
    const terms = new Set((data || []).map(row => row.term.toLowerCase()));
    excludedTermsCache = terms;
    excludedTermsCacheTime = now;
    console.log(`[ExcludedTerms] Loaded ${terms.size} excluded terms from database`);
    return terms;
  } catch (e) {
    console.log('[ExcludedTerms] Exception:', e);
    return new Set();
  }
}

// Check if a query is a category/use-case rather than a specific material
async function isCategoryOrUseCase(query: string): Promise<boolean> {
  const normalizedQuery = query.toLowerCase().trim();
  const excludedTerms = await getExcludedTerms();
  
  // Direct match
  if (excludedTerms.has(normalizedQuery)) {
    return true;
  }
  
  // Check for plural/singular variations
  const withoutS = normalizedQuery.endsWith('s') ? normalizedQuery.slice(0, -1) : normalizedQuery;
  const withS = normalizedQuery + 's';
  if (excludedTerms.has(withoutS) || excludedTerms.has(withS)) {
    return true;
  }
  
  // Check for "X materials" pattern
  if (normalizedQuery.endsWith(' materials') || normalizedQuery.endsWith(' material')) {
    return true;
  }
  
  return false;
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

// Generate AI description for a material
async function generateAIDescription(query: string): Promise<ExternalSource | null> {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  if (!LOVABLE_API_KEY) {
    return null;
  }

  try {
    console.log(`[AI-Description] Generating for: ${query}`);
    
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
            content: `You are a materials science expert. Given a material name, provide a brief, factual description in 1-2 sentences (max 150 characters). Focus on what the material IS and its primary use/property. Be concise and scientific.

Example outputs:
- "A biodegradable thermoplastic derived from renewable resources like corn starch, widely used in packaging and 3D printing."
- "A thermoset polymer known for excellent adhesion, chemical resistance, and electrical insulation properties."
- "A natural polysaccharide extracted from crustacean shells, valued for its biocompatibility and antimicrobial properties."

Return ONLY the description text, no JSON or formatting.`
          },
          { role: 'user', content: `Describe: ${query}` }
        ],
        temperature: 0.3
      })
    });

    if (!response.ok) {
      console.log(`[AI-Description] API error: ${response.status}`);
      return null;
    }

    const data = await response.json();
    const description = data.choices?.[0]?.message?.content?.trim() || '';
    
    if (!description || description.length < 20) {
      return null;
    }

    // Truncate if too long
    const finalDescription = description.length > 180 
      ? description.substring(0, 180).replace(/\s+\S*$/, '') + '...'
      : description;

    console.log(`[AI-Description] Generated description`);
    return {
      name: 'AI Analysis',
      properties: {
        'Description': finalDescription
      }
    };
  } catch (error) {
    console.error('[AI-Description] Error:', error);
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

// Generate AI-based safety information for a material
async function generateSafetyInfo(query: string): Promise<ExternalSource | null> {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  if (!LOVABLE_API_KEY) return null;

  try {
    console.log(`[Safety] Generating safety info for: ${query}`);
    
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
            content: `You are an occupational safety expert. Given a material name, provide brief, factual safety information. Return ONLY a JSON object with these fields (omit fields if unknown or not applicable):
{
  "hazard_class": "GHS hazard classification (e.g., 'Irritant', 'Flammable', 'Non-hazardous')",
  "health_effects": "Brief health hazard summary (max 100 chars)",
  "ppe": "Recommended PPE (max 80 chars)",
  "cas_number": "CAS registry number if known"
}

Be concise and factual. Only include fields you're confident about.`
          },
          { role: 'user', content: `Safety information for: ${query}` }
        ],
        temperature: 0.2
      })
    });

    if (!response.ok) {
      console.log(`[Safety] API error: ${response.status}`);
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    
    const safetyData = JSON.parse(jsonMatch[0]);
    const properties: Record<string, string> = {};
    
    if (safetyData.hazard_class) properties['Hazard Classification'] = safetyData.hazard_class;
    if (safetyData.health_effects) properties['Health Effects'] = safetyData.health_effects;
    if (safetyData.ppe) properties['Recommended PPE'] = safetyData.ppe;
    if (safetyData.cas_number) properties['CAS Number'] = safetyData.cas_number;
    
    if (Object.keys(properties).length === 0) return null;
    
    console.log(`[Safety] Generated ${Object.keys(properties).length} safety properties`);
    return {
      name: 'Safety Analysis',
      properties
    };
  } catch (error) {
    console.error('[Safety] Error:', error);
    return null;
  }
}

// Search MakeItFrom for material engineering properties
async function searchMakeItFrom(query: string): Promise<ExternalSource | null> {
  try {
    console.log(`[MakeItFrom] Searching for: ${query}`);
    
    // Format query for URL - convert to URL-friendly slug
    const formatForUrl = (name: string): string => {
      return name
        .trim()
        .split(/\s+/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join('-')
        .replace(/[^a-zA-Z0-9-]/g, '');
    };
    
    // Try different URL variations
    const urlVariations = [
      formatForUrl(query),
      query.replace(/\s+/g, '-'),
      query.toUpperCase(),
      query.toLowerCase().replace(/\s+/g, '-')
    ];
    
    let html: string | null = null;
    let successUrl = '';
    
    for (const urlSlug of urlVariations) {
      const url = `https://www.makeitfrom.com/material-properties/${urlSlug}`;
      console.log(`[MakeItFrom] Trying URL: ${url}`);
      
      try {
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; MaterialSearch/1.0)',
            'Accept': 'text/html'
          }
        });
        
        if (response.ok) {
          html = await response.text();
          successUrl = url;
          console.log(`[MakeItFrom] Found page at: ${url}`);
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    if (!html) {
      console.log(`[MakeItFrom] No page found for: ${query}`);
      return null;
    }
    
    // Parse properties from HTML - MakeItFrom structure:
    // <div class="mech"><p>Property Name</p><div class="data-bars">...</div><div class="data-bars">...</div><p>Value <i>Unit</i>...</p></div>
    const properties: Record<string, string> = {};
    
    // Simpler approach: match the pattern directly
    // The name is in first <p>, value in second <p> after the data-bars divs
    const regex = /<div class="(?:mech|therm|ele|other|common)"><p>([^<]+)<\/p><div class="data-bars">.*?<\/div><div class="data-bars">.*?<\/div><p>(\d+(?:\.\d+)?)\s*(?:<i>([^<]*)<\/i>)?/g;
    
    let match;
    while ((match = regex.exec(html)) !== null) {
      const propName = match[1]?.trim();
      const value = match[2]?.trim();
      const unit = match[3]?.trim();
      
      if (propName && value) {
        const propValue = unit ? `${value} ${unit}` : value;
        
        // Map property names to our standard format
        const nameMapping: Record<string, string> = {
          "Elastic (Young's, Tensile) Modulus": "Elastic Modulus",
          "Tensile Strength: Ultimate (UTS)": "Tensile Strength",
          "Glass Transition Temperature": "Glass Transition (Tg)",
          "Thermal Conductivity": "Thermal Conductivity",
          "Specific Heat Capacity": "Specific Heat",
          "Thermal Expansion": "Thermal Expansion",
          "Dielectric Strength (Breakdown Potential)": "Dielectric Strength",
          "Electrical Resistivity Order of Magnitude": "Electrical Resistivity",
        };
        
        const standardName = nameMapping[propName] || propName;
        properties[standardName] = propValue;
      }
    }
    
    if (Object.keys(properties).length === 0) {
      console.log(`[MakeItFrom] Could not parse properties from page`);
      return null;
    }
    
    console.log(`[MakeItFrom] Extracted ${Object.keys(properties).length} properties`);
    return {
      name: 'MakeItFrom',
      properties,
      url: successUrl
    };
  } catch (error) {
    console.error('[MakeItFrom] Error:', error);
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

// Generate sustainability score with AI
async function generateAISustainability(material: {
  name: string;
  category: string;
  properties: Array<{ name: string; value: string }>;
}): Promise<{ score: number; breakdown: Record<string, number>; justification: string } | null> {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  if (!LOVABLE_API_KEY) {
    console.log('[AI-Sustainability] No API key');
    return null;
  }

  try {
    console.log(`[AI-Sustainability] Generating for: ${material.name}`);
    
    const propertiesText = material.properties
      .slice(0, 15)
      .map(p => `${p.name}: ${p.value}`)
      .join('; ');
    
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
            content: `You are a Life Cycle Assessment (LCA) expert. Analyze materials and provide PRECISE sustainability scores based on scientific data. Use the FULL 0-100 scale with specific values (not rounded to 5s).

SCORING METHODOLOGY (be precise, use exact values like 67, 82, 43, not 75, 80, 45):

**RENEWABLE (raw material source):**
- 95-100: 100% bio-based from rapidly renewable sources (bamboo, algae, agricultural waste)
- 85-94: Bio-based from slower-growing sources (wood, hemp, cotton)
- 70-84: Partially bio-based (30-70% bio-content)
- 40-69: Minimal bio-based content (<30%)
- 15-39: Fossil-derived but recyclable (PET, HDPE)
- 0-14: Non-renewable, non-recyclable (certain thermosets)

**CARBON FOOTPRINT (production emissions - INVERSE score):**
- 90-100: Carbon-negative or near-zero (some bio-based materials sequester carbon)
- 75-89: Very low (<2 kg CO2e/kg material)
- 55-74: Moderate (2-5 kg CO2e/kg)
- 35-54: High (5-10 kg CO2e/kg)
- 15-34: Very high (10-20 kg CO2e/kg)
- 0-14: Extremely high (>20 kg CO2e/kg, virgin aluminum, some plastics)

**BIODEGRADABILITY:**
- 92-100: Home compostable in <90 days (PHA, uncoated paper, food waste)
- 78-91: Industrial compostable in <180 days (PLA, PBAT blends)
- 55-77: Biodegradable in specific conditions (certain cellulose derivatives)
- 30-54: Slowly degradable (>5 years in environment)
- 10-29: Very slowly degradable (decades)
- 0-9: Essentially non-biodegradable (most conventional plastics, metals)

**TOXICITY (inverse - higher = safer):**
- 92-100: Food-contact safe, FDA/EU approved, no hazardous additives
- 78-91: Generally safe, minimal processing chemicals
- 60-77: Some concerns (certain plasticizers, processing aids)
- 40-59: Contains regulated substances, requires handling precautions
- 20-39: Contains hazardous substances (heavy metals, certain solvents)
- 0-19: Highly toxic, restricted substances

**OVERALL** = weighted average: renewable(25%) + carbonFootprint(30%) + biodegradability(25%) + toxicity(20%)

IMPORTANT: Use SPECIFIC numbers, NOT multiples of 5. Example: 67, not 65 or 70.

Return ONLY valid JSON:
{
  "overall": <precise number 0-100>,
  "renewable": <precise number 0-100>,
  "carbonFootprint": <precise number 0-100>,
  "biodegradability": <precise number 0-100>,
  "toxicity": <precise number 0-100>,
  "justification": "<specific reason citing material properties, max 120 chars>"
}`
          },
          { 
            role: 'user', 
            content: `Analyze sustainability for:

Material: ${material.name}
Category: ${material.category}
Properties: ${propertiesText || 'No specific properties available'}

Provide precise LCA-based sustainability scores using the full 0-100 scale with non-rounded values.` 
          }
        ],
        temperature: 0.5
      })
    });

    if (!response.ok) {
      console.log(`[AI-Sustainability] API error: ${response.status}`);
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validate and ensure reasonable values
      const clamp = (val: number) => Math.max(0, Math.min(100, Math.round(val)));
      
      const breakdown = {
        renewable: clamp(parsed.renewable ?? 50),
        carbonFootprint: clamp(parsed.carbonFootprint ?? 50),
        biodegradability: clamp(parsed.biodegradability ?? 50),
        toxicity: clamp(parsed.toxicity ?? 50)
      };
      
      // Calculate weighted overall if AI didn't provide or seems wrong
      const calculatedOverall = Math.round(
        breakdown.renewable * 0.25 +
        breakdown.carbonFootprint * 0.30 +
        breakdown.biodegradability * 0.25 +
        breakdown.toxicity * 0.20
      );
      
      const overall = parsed.overall ? clamp(parsed.overall) : calculatedOverall;
      
      console.log(`[AI-Sustainability] Generated score: ${overall} (R:${breakdown.renewable} C:${breakdown.carbonFootprint} B:${breakdown.biodegradability} T:${breakdown.toxicity})`);
      
      return {
        score: overall,
        breakdown,
        justification: parsed.justification || `Based on ${material.category} properties and LCA methodology.`
      };
    }
    
    return null;
  } catch (error) {
    console.error('[AI-Sustainability] Error:', error);
    return null;
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
    source_url: undefined,
    category: categorizeProperty(p.property_name)
  }));
  
  // Add external properties
  for (const ext of externalSources) {
    sourcesUsed.add(ext.name);
    for (const [name, value] of Object.entries(ext.properties)) {
      if (!properties.find(p => p.name.toLowerCase() === name.toLowerCase())) {
        properties.push({ name, value, source: ext.name, source_url: ext.url, category: categorizeProperty(name) });
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
  
  // Get sustainability - use local if available, otherwise generate with AI
  let sustainability: MaterialData['sustainability'] = null;
  if (local.sustainability) {
    sustainability = {
      score: local.sustainability.overall_score,
      breakdown: {
        renewable: local.sustainability.renewable_score,
        carbonFootprint: local.sustainability.carbon_footprint_score,
        biodegradability: local.sustainability.biodegradability_score,
        toxicity: local.sustainability.toxicity_score
      },
      source: 'Your Database'
    };
  } else {
    // Generate sustainability with AI
    const aiSustainability = await generateAISustainability({
      name: displayName,
      category: local.category,
      properties: properties.map(p => ({ name: p.name, value: p.value }))
    });
    if (aiSustainability) {
      sustainability = {
        score: aiSustainability.score,
        breakdown: aiSustainability.breakdown,
        source: 'AI Analysis',
        justification: aiSustainability.justification
      };
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
    sustainability,
    suppliers: local.suppliers.map((s: any) => ({
      company: s.company_name,
      country: s.country,
      source: 'Your Database'
    })),
    ai_summary: aiSummary,
    sources_used: Array.from(sourcesUsed),
    matchScore,
    material_source: local.material_source || []
  };
}

// Parse numeric value from string (handles ranges, comparisons)
function parseNumericValue(value: string): { min?: number; max?: number; exact?: number } | null {
  if (!value) return null;
  
  const cleaned = value.replace(/[^\d\.\-<>=]/g, ' ').trim();
  
  // Range pattern: "100-200" or "100 - 200"
  const rangeMatch = value.match(/([\d.]+)\s*[-–]\s*([\d.]+)/);
  if (rangeMatch) {
    return { min: parseFloat(rangeMatch[1]), max: parseFloat(rangeMatch[2]) };
  }
  
  // Greater than: ">100" or ">=100"
  const gtMatch = value.match(/[>≥]\s*([\d.]+)/);
  if (gtMatch) {
    return { min: parseFloat(gtMatch[1]) };
  }
  
  // Less than: "<100" or "<=100"
  const ltMatch = value.match(/[<≤]\s*([\d.]+)/);
  if (ltMatch) {
    return { max: parseFloat(ltMatch[1]) };
  }
  
  // Exact value
  const numMatch = cleaned.match(/([\d.]+)/);
  if (numMatch) {
    return { exact: parseFloat(numMatch[0]) };
  }
  
  return null;
}

// Check if a material property value matches a requirement
function checkPropertyMatch(
  actualValue: string | null, 
  requiredValue: string
): { matches: boolean; matchType: PropertyMatchResult['matchType'] } {
  if (!actualValue) {
    return { matches: false, matchType: 'not-found' };
  }
  
  const actualParsed = parseNumericValue(actualValue);
  const requiredParsed = parseNumericValue(requiredValue);
  
  // If both are numeric
  if (actualParsed && requiredParsed) {
    const actualNum = actualParsed.exact ?? actualParsed.min ?? actualParsed.max;
    
    if (actualNum !== undefined) {
      // Check against range
      if (requiredParsed.min !== undefined && requiredParsed.max !== undefined) {
        const matches = actualNum >= requiredParsed.min && actualNum <= requiredParsed.max;
        return { matches, matchType: matches ? 'range' : 'partial' };
      }
      // Check against min only (>X)
      if (requiredParsed.min !== undefined) {
        const matches = actualNum >= requiredParsed.min;
        return { matches, matchType: matches ? 'range' : 'partial' };
      }
      // Check against max only (<X)
      if (requiredParsed.max !== undefined) {
        const matches = actualNum <= requiredParsed.max;
        return { matches, matchType: matches ? 'range' : 'partial' };
      }
      // Exact match with 10% tolerance
      if (requiredParsed.exact !== undefined) {
        const tolerance = requiredParsed.exact * 0.1;
        const matches = Math.abs(actualNum - requiredParsed.exact) <= tolerance;
        return { matches, matchType: matches ? 'exact' : 'partial' };
      }
    }
  }
  
  // Fall back to string comparison
  const actualLower = actualValue.toLowerCase();
  const requiredLower = requiredValue.toLowerCase();
  
  if (actualLower.includes(requiredLower) || requiredLower.includes(actualLower)) {
    return { matches: true, matchType: 'partial' };
  }
  
  return { matches: false, matchType: 'partial' };
}

// Validate material against property requirements
async function validateMaterialRequirements(
  material: MaterialData,
  requirements: PropertyRequirement[]
): Promise<{ propertyMatches: PropertyMatchResult[]; matchScore: number }> {
  const propertyMatches: PropertyMatchResult[] = [];
  let mustHaveScore = 0;
  let mustHaveTotal = 0;
  let preferredScore = 0;
  let preferredTotal = 0;
  let niceToHaveScore = 0;
  let niceToHaveTotal = 0;
  
  for (const req of requirements) {
    // Find matching property in material
    const propLower = req.property.toLowerCase();
    const matchingProp = material.properties.find(p => 
      p.name.toLowerCase().includes(propLower) || 
      propLower.includes(p.name.toLowerCase())
    );
    
    const actualValue = matchingProp?.value || null;
    const { matches, matchType } = checkPropertyMatch(actualValue, req.value);
    
    const confidence = matches ? (matchType === 'exact' ? 100 : matchType === 'range' ? 90 : 70) : 0;
    
    propertyMatches.push({
      property: req.property,
      required: `${req.value}${req.unit ? ' ' + req.unit : ''}`,
      actual: actualValue,
      matches,
      matchType: actualValue ? matchType : 'not-found',
      confidence
    });
    
    // Score based on importance
    if (req.importance === 'must-have') {
      mustHaveTotal++;
      if (matches) mustHaveScore++;
    } else if (req.importance === 'preferred') {
      preferredTotal++;
      if (matches) preferredScore++;
    } else {
      niceToHaveTotal++;
      if (matches) niceToHaveScore++;
    }
  }
  
  // Calculate weighted score
  // Must-have: 60% weight, Preferred: 30% weight, Nice-to-have: 10% weight
  let matchScore = 0;
  if (mustHaveTotal > 0) {
    matchScore += (mustHaveScore / mustHaveTotal) * 60;
  } else {
    matchScore += 60; // No must-haves = full score for that category
  }
  if (preferredTotal > 0) {
    matchScore += (preferredScore / preferredTotal) * 30;
  } else {
    matchScore += 30;
  }
  if (niceToHaveTotal > 0) {
    matchScore += (niceToHaveScore / niceToHaveTotal) * 10;
  } else {
    matchScore += 10;
  }
  
  return { propertyMatches, matchScore: Math.round(matchScore) };
}

// AI-powered property estimation for missing properties
async function estimateMissingProperty(
  materialName: string,
  propertyName: string,
  unit: string
): Promise<{ value: string; confidence: number } | null> {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  if (!LOVABLE_API_KEY) return null;
  
  try {
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
            content: `You are a materials science expert. Estimate the value of material properties based on scientific knowledge.
            
Return ONLY a JSON object with:
- "value": the estimated value with units
- "confidence": percentage (0-100) of how confident you are
- "source": brief note on what this estimate is based on

Example: {"value": "150-170", "confidence": 75, "source": "Based on typical values for similar polyesters"}`
          },
          { 
            role: 'user', 
            content: `For the material "${materialName}", estimate the ${propertyName}${unit ? ' (in ' + unit + ')' : ''}.` 
          }
        ],
        temperature: 0.3
      })
    });

    if (!response.ok) return null;
    
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);
      return { value: result.value, confidence: result.confidence || 50 };
    }
    
    return null;
  } catch {
    return null;
  }
}

// Main handler
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { query, includeAISummary = true, propertyRequirements = [] } = await req.json() as {
      query: string;
      includeAISummary?: boolean;
      propertyRequirements?: PropertyRequirement[];
    };
    
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
      generateAIDescription(query),
      generateSafetyInfo(query),
      searchMakeItFrom(query)
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
    const [pubchemResult, materialsProjectResult, aiDescriptionResult, safetyResult, makeItFromResult] = externalSearchResults as [ExternalSource | null, ExternalSource | null, ExternalSource | null, ExternalSource | null, ExternalSource | null];
    
    if (pubchemResult) externalResults.set('pubchem', pubchemResult);
    if (materialsProjectResult) externalResults.set('materials_project', materialsProjectResult);
    if (aiDescriptionResult) externalResults.set('ai_description', aiDescriptionResult);
    if (safetyResult) externalResults.set('safety', safetyResult);
    if (makeItFromResult) externalResults.set('makeitfrom', makeItFromResult);
    
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
    // BUT only if it's a specific material, not a category/use-case
    const isCategory = await isCategoryOrUseCase(query);
    
    if (localResultsArray.length === 0 && externalSources.length > 0 && !isCategory) {
      const properties: MaterialData['properties'] = [];
      
      for (const ext of externalSources) {
        sourcesUsed.add(ext.name);
        for (const [name, value] of Object.entries(ext.properties)) {
          properties.push({ name, value, source: ext.name, source_url: ext.url, category: categorizeProperty(name) });
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
      
      // Generate AI sustainability for external-only results
      const aiSustainability = await generateAISustainability({
        name: displayName,
        category: 'Chemical Compound',
        properties: properties.map(p => ({ name: p.name, value: p.value }))
      });
      let sustainability: MaterialData['sustainability'] = null;
      if (aiSustainability) {
        sustainability = {
          score: aiSustainability.score,
          breakdown: aiSustainability.breakdown,
          source: 'AI Analysis',
          justification: aiSustainability.justification
        };
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
        sustainability,
        suppliers: [],
        ai_summary: aiSummary,
        sources_used: Array.from(sourcesUsed),
        matchScore: 30
      });
    }
    
    // Sort by match score
    results.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
    
    // Validate against property requirements if provided
    let validatedResults = results;
    if (propertyRequirements && propertyRequirements.length > 0) {
      console.log(`[AI-Search] Validating ${results.length} results against ${propertyRequirements.length} requirements`);
      
      // Validate each result against requirements
      const validationPromises = results.map(async (material) => {
        const { propertyMatches, matchScore: reqMatchScore } = await validateMaterialRequirements(
          material,
          propertyRequirements
        );
        
        // Try to estimate missing "must-have" properties with AI
        const mustHaveRequirements = propertyRequirements.filter(r => r.importance === 'must-have');
        const missingMustHaves = mustHaveRequirements.filter(req => 
          !propertyMatches.find(pm => pm.property === req.property && pm.actual)
        );
        
        // Estimate up to 3 missing must-have properties
        for (const missing of missingMustHaves.slice(0, 3)) {
          const estimated = await estimateMissingProperty(material.name, missing.property, missing.unit);
          if (estimated) {
            const matchResult = checkPropertyMatch(estimated.value, missing.value);
            const existingMatch = propertyMatches.find(pm => pm.property === missing.property);
            if (existingMatch) {
              existingMatch.actual = `~${estimated.value} (AI Est.)`;
              existingMatch.matches = matchResult.matches;
              existingMatch.matchType = 'ai-estimated';
              existingMatch.confidence = Math.min(estimated.confidence, matchResult.matches ? 70 : 30);
            }
          }
        }
        
        // Recalculate score after AI estimation
        const { matchScore: finalScore } = await validateMaterialRequirements(
          { ...material, properties: material.properties },
          propertyRequirements
        );
        
        return {
          ...material,
          propertyMatches,
          requirementMatchScore: finalScore
        };
      });
      
      const validatedMaterials = await Promise.all(validationPromises);
      
      // Filter out materials that don't meet must-have requirements
      const mustHaveCount = propertyRequirements.filter(r => r.importance === 'must-have').length;
      
      validatedResults = validatedMaterials
        .filter(m => {
          // If there are must-have requirements, filter by threshold
          if (mustHaveCount > 0) {
            const mustHaveMatches = m.propertyMatches?.filter(pm => 
              propertyRequirements.find(r => r.property === pm.property && r.importance === 'must-have')?.importance === 'must-have' &&
              pm.matches
            ).length || 0;
            // Require at least 50% of must-haves to match
            return mustHaveMatches >= Math.ceil(mustHaveCount * 0.5);
          }
          return true;
        })
        // Sort by requirement match score
        .sort((a, b) => (b.requirementMatchScore || 0) - (a.requirementMatchScore || 0));
      
      console.log(`[AI-Search] After validation: ${validatedResults.length} results meet requirements`);
    }
    
    console.log(`[AI-Search] Returning ${validatedResults.length} results from ${sourcesUsed.size} sources`);
    
    return new Response(
      JSON.stringify({
        query,
        expandedTerms,
        results: validatedResults,
        totalResults: validatedResults.length,
        sourcesUsed: Array.from(sourcesUsed),
        hasPropertyRequirements: propertyRequirements && propertyRequirements.length > 0
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
