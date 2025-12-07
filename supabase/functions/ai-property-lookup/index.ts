import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PropertyResult {
  value: string | null;
  confidence: 'high' | 'medium' | 'low';
  note?: string;
  sources?: Array<{
    title: string;
    authors: string[];
    journal?: string;
    year?: number;
    doi?: string;
    url?: string;
  }>;
}

// Search PubMed for property data
async function searchPubMedForProperty(
  materialName: string,
  propertyName: string
): Promise<{ entries: any[]; propertyData: string | null }> {
  try {
    const query = `${materialName} ${propertyName} properties characterization`;
    const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmax=5&retmode=json`;
    const searchResponse = await fetch(searchUrl);
    
    if (!searchResponse.ok) {
      console.log('[PropertyLookup] PubMed search failed');
      return { entries: [], propertyData: null };
    }

    const searchData = await searchResponse.json();
    const ids = searchData.esearchresult?.idlist || [];
    
    if (ids.length === 0) {
      console.log('[PropertyLookup] No PubMed results found');
      return { entries: [], propertyData: null };
    }

    // Fetch article details
    const fetchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${ids.join(',')}&retmode=json`;
    const fetchResponse = await fetch(fetchUrl);
    
    if (!fetchResponse.ok) {
      return { entries: [], propertyData: null };
    }

    const fetchData = await fetchResponse.json();
    const entries: any[] = [];

    for (const id of ids) {
      const article = fetchData.result?.[id];
      if (!article) continue;

      entries.push({
        title: article.title || 'Untitled',
        authors: article.authors?.map((a: any) => a.name) || [],
        journal: article.fulljournalname || article.source || '',
        year: parseInt(article.pubdate?.split(' ')?.[0]) || new Date().getFullYear(),
        doi: article.elocationid?.replace('doi: ', '') || '',
        url: `https://pubmed.ncbi.nlm.nih.gov/${id}/`,
      });
    }

    console.log(`[PropertyLookup] PubMed found ${entries.length} relevant articles`);
    return { entries, propertyData: null };
  } catch (error) {
    console.error('[PropertyLookup] PubMed error:', error);
    return { entries: [], propertyData: null };
  }
}

// Search CrossRef for property data
async function searchCrossRefForProperty(
  materialName: string,
  propertyName: string
): Promise<{ entries: any[]; propertyData: string | null }> {
  try {
    const query = `${materialName} ${propertyName}`;
    const url = `https://api.crossref.org/works?query=${encodeURIComponent(query)}&rows=5&filter=type:journal-article`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'MaterialInk/1.0 (mailto:research@materialink.io)'
      }
    });

    if (!response.ok) {
      console.log('[PropertyLookup] CrossRef search failed');
      return { entries: [], propertyData: null };
    }

    const data = await response.json();
    const items = data.message?.items || [];
    
    const entries = items.map((item: any) => ({
      title: item.title?.[0] || 'Untitled',
      authors: item.author?.map((a: any) => `${a.given || ''} ${a.family || ''}`.trim()).slice(0, 3) || [],
      journal: item['container-title']?.[0] || '',
      year: item.published?.['date-parts']?.[0]?.[0] || item.created?.['date-parts']?.[0]?.[0],
      doi: item.DOI || '',
      url: item.URL || `https://doi.org/${item.DOI}`,
    }));

    console.log(`[PropertyLookup] CrossRef found ${entries.length} relevant articles`);
    return { entries, propertyData: null };
  } catch (error) {
    console.error('[PropertyLookup] CrossRef error:', error);
    return { entries: [], propertyData: null };
  }
}

// Use AI to extract and validate property from research context
async function extractPropertyWithAI(
  materialName: string,
  propertyName: string,
  sources: any[]
): Promise<PropertyResult> {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  if (!LOVABLE_API_KEY) {
    return { value: null, confidence: 'low', note: 'AI service not configured' };
  }

  const sourceContext = sources.length > 0
    ? `\n\nRelevant research papers found:\n${sources.slice(0, 5).map((s, i) => 
        `${i + 1}. "${s.title}" (${s.journal}, ${s.year}) - DOI: ${s.doi || 'N/A'}`
      ).join('\n')}`
    : '';

  const systemPrompt = `You are a materials science expert with access to scientific literature. Your task is to provide accurate, research-backed property values for materials.

IMPORTANT GUIDELINES:
1. Only provide values that are well-established in scientific literature
2. Use standard units (SI preferred)
3. For ranges, provide typical values as "X - Y units"
4. Be precise - cite specific values from research when possible
5. If the property varies significantly based on conditions, note the standard conditions
6. Do NOT make up values - if uncertain, say the data is not available

Common material properties to look for:
- Tensile Strength: MPa
- Density: g/cm³ or kg/m³
- Melting Point: °C
- Glass Transition Temperature (Tg): °C
- Thermal Conductivity: W/(m·K)
- Young's Modulus: GPa
- Elongation at Break: %
- Water Absorption: %
- Biodegradability: time in specific conditions
- Oxygen Permeability: cc·mil/(m²·day·atm)

${sourceContext}

Return ONLY a JSON object:
{
  "value": "<property value with units, or null if unknown>",
  "confidence": "<high|medium|low>",
  "note": "<source/method note, include journal name if from specific paper>"
}

Confidence levels:
- high: Value from peer-reviewed research, well-established
- medium: Typical range from multiple sources, or extrapolated from similar materials
- low: Estimated or limited data available`;

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
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Material: ${materialName}\nProperty: ${propertyName}\n\nProvide the most accurate value based on scientific literature.` }
        ],
      })
    });

    if (!response.ok) {
      console.error(`[PropertyLookup] AI API error: ${response.status}`);
      return { value: null, confidence: 'low', note: 'AI service error' };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return { value: null, confidence: 'low', note: 'Could not parse response' };
    }

    const result = JSON.parse(jsonMatch[0]);
    return {
      value: result.value,
      confidence: result.confidence || 'medium',
      note: result.note,
      sources: sources.slice(0, 3)
    };
  } catch (error) {
    console.error('[PropertyLookup] AI error:', error);
    return { value: null, confidence: 'low', note: 'Error processing request' };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { materialName, propertyName } = await req.json();

    if (!materialName || !propertyName) {
      return new Response(
        JSON.stringify({ error: 'Material name and property name are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[PropertyLookup] Looking up ${propertyName} for ${materialName}`);

    // Search academic sources in parallel
    const [pubmedResult, crossrefResult] = await Promise.all([
      searchPubMedForProperty(materialName, propertyName),
      searchCrossRefForProperty(materialName, propertyName)
    ]);

    // Combine all sources
    const allSources = [
      ...pubmedResult.entries,
      ...crossrefResult.entries
    ];

    // Deduplicate by title
    const seenTitles = new Set<string>();
    const uniqueSources = allSources.filter(s => {
      const normalized = s.title.toLowerCase().trim();
      if (seenTitles.has(normalized)) return false;
      seenTitles.add(normalized);
      return true;
    });

    console.log(`[PropertyLookup] Found ${uniqueSources.length} unique sources`);

    // Use AI to extract the actual property value from research context
    const result = await extractPropertyWithAI(materialName, propertyName, uniqueSources);

    console.log(`[PropertyLookup] Result: ${result.value} (${result.confidence})`);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[PropertyLookup] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
