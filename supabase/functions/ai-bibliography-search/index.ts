import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BibliographyEntry {
  title: string;
  authors: string[];
  abstract?: string;
  journal?: string;
  year?: number;
  doi?: string;
  url?: string;
  sourceDatabase: string;
  keywords: string[];
  citationCount?: number;
  materialRelevance?: string;
}

// Academic database configurations
const ACADEMIC_SOURCES = [
  { name: 'PubMed', domain: 'pubmed.ncbi.nlm.nih.gov', searchPattern: 'site:pubmed.ncbi.nlm.nih.gov' },
  { name: 'ResearchGate', domain: 'researchgate.net', searchPattern: 'site:researchgate.net/publication' },
  { name: 'Scopus', domain: 'scopus.com', searchPattern: 'site:scopus.com' },
  { name: 'MDPI', domain: 'mdpi.com', searchPattern: 'site:mdpi.com' },
  { name: 'Wiley', domain: 'onlinelibrary.wiley.com', searchPattern: 'site:onlinelibrary.wiley.com' },
  { name: 'Springer', domain: 'link.springer.com', searchPattern: 'site:link.springer.com' },
  { name: 'ScienceDirect', domain: 'sciencedirect.com', searchPattern: 'site:sciencedirect.com' },
  { name: 'Nature', domain: 'nature.com', searchPattern: 'site:nature.com' },
  { name: 'ACS Publications', domain: 'pubs.acs.org', searchPattern: 'site:pubs.acs.org' },
  { name: 'IOP Science', domain: 'iopscience.iop.org', searchPattern: 'site:iopscience.iop.org' },
  { name: 'Taylor & Francis', domain: 'tandfonline.com', searchPattern: 'site:tandfonline.com' },
  { name: 'arXiv', domain: 'arxiv.org', searchPattern: 'site:arxiv.org' },
  { name: 'Google Scholar', domain: 'scholar.google.com', searchPattern: '' },
];

async function searchWithLovableAI(
  query: string,
  sources: string[],
  maxResults: number
): Promise<BibliographyEntry[]> {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  if (!LOVABLE_API_KEY) {
    console.error('[Bibliography] LOVABLE_API_KEY not configured');
    return [];
  }

  // Build source-specific search hints
  const sourceHints = sources.length > 0 
    ? sources.map(s => {
        const source = ACADEMIC_SOURCES.find(as => as.name.toLowerCase() === s.toLowerCase());
        return source ? source.name : s;
      }).join(', ')
    : 'all major academic databases';

  const systemPrompt = `You are an expert academic research assistant specializing in materials science. Your task is to find and format research articles about materials based on the user's query.

You must return a JSON array of bibliography entries with the following structure:
{
  "entries": [
    {
      "title": "Full article title",
      "authors": ["Author 1", "Author 2"],
      "abstract": "Brief abstract or summary",
      "journal": "Journal name",
      "year": 2024,
      "doi": "10.xxxx/xxxxx",
      "url": "https://...",
      "sourceDatabase": "Database name",
      "keywords": ["keyword1", "keyword2"],
      "citationCount": 0,
      "materialRelevance": "Brief explanation of why this is relevant to the material query"
    }
  ]
}

Focus on:
1. Finding real, credible research articles from: ${sourceHints}
2. Prioritizing recent publications (last 5 years when possible)
3. Including materials science, chemistry, and engineering journals
4. Providing accurate DOIs when possible
5. Explaining material relevance for each entry

Important: Return ONLY valid JSON, no additional text.`;

  const userPrompt = `Search for ${maxResults} research articles about: "${query}"

Look for articles from these academic sources: ${sourceHints}

Focus on:
- Material properties and characterization
- Synthesis methods and processing
- Applications and performance data
- Recent developments and innovations

Return the results as a JSON object with an "entries" array.`;

  try {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      console.error('[Bibliography] AI API error:', response.status);
      return [];
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('[Bibliography] Could not parse JSON from AI response');
      return [];
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const entries = parsed.entries || [];
    
    console.log(`[Bibliography] AI returned ${entries.length} entries`);
    return entries;
  } catch (error) {
    console.error('[Bibliography] AI search error:', error);
    return [];
  }
}

// Search PubMed API directly for more accurate results
async function searchPubMed(query: string, maxResults: number): Promise<BibliographyEntry[]> {
  try {
    // Search for article IDs
    const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmax=${maxResults}&retmode=json`;
    const searchResponse = await fetch(searchUrl);
    
    if (!searchResponse.ok) {
      console.log('[Bibliography] PubMed search failed');
      return [];
    }

    const searchData = await searchResponse.json();
    const ids = searchData.esearchresult?.idlist || [];
    
    if (ids.length === 0) {
      console.log('[Bibliography] No PubMed results found');
      return [];
    }

    // Fetch article details
    const fetchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${ids.join(',')}&retmode=json`;
    const fetchResponse = await fetch(fetchUrl);
    
    if (!fetchResponse.ok) {
      console.log('[Bibliography] PubMed fetch failed');
      return [];
    }

    const fetchData = await fetchResponse.json();
    const results: BibliographyEntry[] = [];

    for (const id of ids) {
      const article = fetchData.result?.[id];
      if (!article) continue;

      results.push({
        title: article.title || 'Untitled',
        authors: article.authors?.map((a: any) => a.name) || [],
        abstract: article.sorttitle || '',
        journal: article.fulljournalname || article.source || '',
        year: parseInt(article.pubdate?.split(' ')?.[0]) || new Date().getFullYear(),
        doi: article.elocationid?.replace('doi: ', '') || '',
        url: `https://pubmed.ncbi.nlm.nih.gov/${id}/`,
        sourceDatabase: 'PubMed',
        keywords: [],
        citationCount: 0,
        materialRelevance: 'Found via PubMed database search'
      });
    }

    console.log(`[Bibliography] PubMed returned ${results.length} entries`);
    return results;
  } catch (error) {
    console.error('[Bibliography] PubMed error:', error);
    return [];
  }
}

// Search CrossRef API for DOI-based results
async function searchCrossRef(query: string, maxResults: number): Promise<BibliographyEntry[]> {
  try {
    const url = `https://api.crossref.org/works?query=${encodeURIComponent(query)}&rows=${maxResults}&filter=type:journal-article`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'MaterialInk/1.0 (mailto:rangsimatiti.b.s@gmail.com)'
      }
    });

    if (!response.ok) {
      console.log('[Bibliography] CrossRef search failed');
      return [];
    }

    const data = await response.json();
    const items = data.message?.items || [];
    
    const results: BibliographyEntry[] = items.map((item: any) => ({
      title: item.title?.[0] || 'Untitled',
      authors: item.author?.map((a: any) => `${a.given || ''} ${a.family || ''}`.trim()) || [],
      abstract: item.abstract?.replace(/<[^>]*>/g, '') || '',
      journal: item['container-title']?.[0] || '',
      year: item.published?.['date-parts']?.[0]?.[0] || item.created?.['date-parts']?.[0]?.[0],
      doi: item.DOI || '',
      url: item.URL || `https://doi.org/${item.DOI}`,
      sourceDatabase: 'CrossRef',
      keywords: item.subject || [],
      citationCount: item['is-referenced-by-count'] || 0,
      materialRelevance: 'Found via CrossRef academic database'
    }));

    console.log(`[Bibliography] CrossRef returned ${results.length} entries`);
    return results;
  } catch (error) {
    console.error('[Bibliography] CrossRef error:', error);
    return [];
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, sources = [], maxResults = 10, includeAI = true } = await req.json();

    if (!query || query.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Query is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[Bibliography] Searching for: "${query}" from sources: ${sources.join(', ') || 'all'}`);

    // Search multiple sources in parallel
    const searchPromises: Promise<BibliographyEntry[]>[] = [];

    // Always search real APIs first
    searchPromises.push(searchPubMed(query + ' materials', Math.ceil(maxResults / 2)));
    searchPromises.push(searchCrossRef(query + ' materials science', Math.ceil(maxResults / 2)));

    // Use AI to find additional results and enrich data
    if (includeAI) {
      searchPromises.push(searchWithLovableAI(query, sources, maxResults));
    }

    const allResults = await Promise.all(searchPromises);
    
    // Combine and deduplicate results
    const seenTitles = new Set<string>();
    const combinedResults: BibliographyEntry[] = [];

    for (const resultSet of allResults) {
      for (const entry of resultSet) {
        const normalizedTitle = entry.title.toLowerCase().trim();
        if (!seenTitles.has(normalizedTitle)) {
          seenTitles.add(normalizedTitle);
          combinedResults.push(entry);
        }
      }
    }

    // Sort by year (newest first), then by citation count
    combinedResults.sort((a, b) => {
      const yearA = a.year || 0;
      const yearB = b.year || 0;
      if (yearB !== yearA) return yearB - yearA;
      return (b.citationCount || 0) - (a.citationCount || 0);
    });

    // Limit to requested number
    const finalResults = combinedResults.slice(0, maxResults);

    console.log(`[Bibliography] Returning ${finalResults.length} unique entries`);

    return new Response(
      JSON.stringify({
        success: true,
        entries: finalResults,
        sources: ACADEMIC_SOURCES.map(s => s.name),
        totalFound: combinedResults.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[Bibliography] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
