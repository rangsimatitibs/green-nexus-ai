import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SearchFilters {
  category?: string;
  source?: string;
  properties?: Array<{ property: string; value: string; importance: string }>;
  industry?: string;
  application?: string;
}

export interface PropertyWithSource {
  name: string;
  value: string;
  source: string;
  source_url?: string;
  category?: 'description' | 'physical' | 'mechanical' | 'thermal' | 'safety' | 'environmental';
}

export interface SearchResult {
  id: string;
  name: string;
  category: string;
  chemical_formula: string | null;
  chemical_structure: string | null;
  innovation: string | null;
  uniqueness: string | null;
  scale: string | null;
  image_url?: string | null;
  data_source: string | null;
  external_id: string | null;
  last_synced_at: string | null;
  created_at?: string;
  updated_at?: string;
  matchScore?: number;
  properties: Record<string, string>;
  propertiesWithSource?: PropertyWithSource[];
  applications: string[];
  applicationsWithSource?: Array<{ name: string; source: string }>;
  regulations: string[];
  regulationsWithSource?: Array<{ name: string; source: string }>;
  sustainability: {
    score: number;
    breakdown: Record<string, number>;
    calculation: string | null;
    source?: string;
    justification?: string;
  };
  suppliers: Array<{
    id: string;
    company: string;
    country: string;
    logo_url?: string | null;
    product_image_url?: string | null;
    uniqueness?: string | null;
    pricing?: string | null;
    min_order?: string | null;
    lead_time?: string | null;
    properties: Record<string, string>;
    detailed_properties?: Record<string, Record<string, string>>;
    certifications: string[];
  }>;
  synonyms?: string[];
  iupac_name?: string | null;
  ai_summary?: string;
  sources_used?: string[];
  material_source?: string[];
}

const RESULTS_THRESHOLD = 25;

export const useUnifiedMaterialSearch = () => {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSearchSource, setLastSearchSource] = useState<'local' | 'external' | 'combined' | 'ai' | null>(null);
  const [canLoadMore, setCanLoadMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [lastSearchTerm, setLastSearchTerm] = useState<string>('');

  // Search using AI agent (primary method)
  const searchWithAI = useCallback(async (searchTerm: string): Promise<SearchResult[]> => {
    try {
      console.log(`[AI Search] Querying AI agent for: ${searchTerm}`);
      
      const { data, error: funcError } = await supabase.functions.invoke('ai-material-search', {
        body: { query: searchTerm, includeAISummary: true }
      });

      if (funcError) {
        console.error('[AI Search] Error:', funcError);
        throw funcError;
      }

      if (!data?.results || data.results.length === 0) {
        console.log('[AI Search] No results');
        return [];
      }

      console.log(`[AI Search] Found ${data.results.length} results from sources: ${data.sourcesUsed?.join(', ')}`);

      // Transform AI agent results to SearchResult format
      return data.results.map((result: any, index: number) => {
        const properties: Record<string, string> = {};
        result.properties?.forEach((p: any) => {
          properties[p.name] = p.value;
        });

        return {
          id: `ai-result-${index}-${Date.now()}`,
          name: result.name,
          category: result.category || 'Material',
          chemical_formula: result.chemical_formula,
          chemical_structure: null,
          innovation: null,
          uniqueness: null,
          scale: null,
          image_url: null,
          data_source: result.sources_used?.[0] || 'ai',
          external_id: null,
          last_synced_at: new Date().toISOString(),
          matchScore: 95,
          properties,
          propertiesWithSource: result.properties || [],
          applications: result.applications?.map((a: any) => a.name) || [],
          applicationsWithSource: result.applications || [],
          regulations: result.regulations?.map((r: any) => r.name) || [],
          regulationsWithSource: result.regulations || [],
          sustainability: result.sustainability || { score: 0, breakdown: {}, calculation: null },
          suppliers: result.suppliers?.map((s: any, idx: number) => ({
            id: `supplier-${idx}`,
            company: s.company,
            country: s.country,
            properties: {},
            certifications: []
          })) || [],
            synonyms: result.synonyms || [],
            iupac_name: result.iupac_name || null,
            ai_summary: result.ai_summary,
            sources_used: result.sources_used || data.sourcesUsed || [],
            material_source: result.material_source || []
          };
      });
    } catch (err) {
      console.error('[AI Search] Failed:', err);
      throw err;
    }
  }, []);

  // Fallback: Search local database directly
  const searchLocal = useCallback(async (
    searchTerm: string,
    filters?: SearchFilters,
    limit: number = 50
  ): Promise<SearchResult[]> => {
    try {
      const { data, error: searchError } = await supabase.rpc('search_materials', {
        search_term: searchTerm || null,
        category_filter: filters?.category || null,
        source_filter: filters?.source || null,
        result_limit: limit,
      });

      if (searchError) {
        console.error('Local search error:', searchError);
        return [];
      }

      if (!data || data.length === 0) {
        return [];
      }

      const materialsWithDetails = await Promise.all(
        data.map(async (material: any) => {
          const [propertiesRes, applicationsRes, regulationsRes, sustainabilityRes, suppliersRes, synonymsRes] = await Promise.all([
            supabase.from('material_properties').select('*').eq('material_id', material.id),
            supabase.from('material_applications').select('*').eq('material_id', material.id),
            supabase.from('material_regulations').select('*').eq('material_id', material.id),
            supabase.from('material_sustainability').select('*').eq('material_id', material.id).maybeSingle(),
            supabase.from('suppliers').select('*').eq('material_id', material.id),
            supabase.from('material_synonyms').select('synonym').eq('material_id', material.id)
          ]);

          const properties: Record<string, string> = {};
          const propertiesWithSource: PropertyWithSource[] = [];
          propertiesRes.data?.forEach((prop) => {
            properties[prop.property_name] = prop.property_value;
            propertiesWithSource.push({
              name: prop.property_name,
              value: prop.property_value,
              source: 'Your Database'
            });
          });

          const applications = applicationsRes.data?.map((app) => app.application) || [];
          const regulations = regulationsRes.data?.map((reg) => reg.regulation) || [];
          const synonyms = synonymsRes.data?.map((s) => s.synonym) || [];

          const sustainability = sustainabilityRes.data
            ? {
                score: sustainabilityRes.data.overall_score,
                breakdown: {
                  renewable: sustainabilityRes.data.renewable_score,
                  carbonFootprint: sustainabilityRes.data.carbon_footprint_score,
                  biodegradability: sustainabilityRes.data.biodegradability_score,
                  toxicity: sustainabilityRes.data.toxicity_score,
                },
                calculation: sustainabilityRes.data.calculation_method,
                source: 'Your Database'
              }
            : { score: 0, breakdown: {}, calculation: null };

          const suppliers = await Promise.all(
            (suppliersRes.data || []).map(async (supplier) => {
              const [propsRes, detailedPropsRes, certsRes] = await Promise.all([
                supabase.from('supplier_properties').select('*').eq('supplier_id', supplier.id),
                supabase.from('supplier_detailed_properties').select('*').eq('supplier_id', supplier.id),
                supabase.from('supplier_certifications').select('*').eq('supplier_id', supplier.id),
              ]);

              const supplierProps: Record<string, string> = {};
              propsRes.data?.forEach((prop) => {
                supplierProps[prop.property_name] = prop.property_value;
              });

              const detailedProps: Record<string, Record<string, string>> = {};
              detailedPropsRes.data?.forEach((prop) => {
                if (!detailedProps[prop.category]) {
                  detailedProps[prop.category] = {};
                }
                detailedProps[prop.category][prop.property_name] = prop.property_value;
              });

              return {
                id: supplier.id,
                company: supplier.company_name,
                country: supplier.country,
                logo_url: supplier.logo_url,
                product_image_url: supplier.product_image_url,
                uniqueness: supplier.uniqueness,
                pricing: supplier.pricing,
                min_order: supplier.min_order,
                lead_time: supplier.lead_time,
                properties: supplierProps,
                detailed_properties: detailedProps,
                certifications: certsRes.data?.map((c) => c.certification) || [],
              };
            })
          );

          return {
            id: material.id,
            name: material.name,
            category: material.category,
            chemical_formula: material.chemical_formula,
            chemical_structure: material.chemical_structure,
            uniqueness: material.uniqueness,
            scale: material.scale,
            innovation: material.innovation,
            data_source: material.data_source || 'local',
            external_id: material.external_id,
            last_synced_at: material.last_synced_at,
            matchScore: 100,
            properties,
            propertiesWithSource,
            sustainability,
            applications,
            applicationsWithSource: applications.map(a => ({ name: a, source: 'Your Database' })),
            regulations,
            regulationsWithSource: regulations.map(r => ({ name: r, source: 'Your Database' })),
            suppliers,
            synonyms,
            sources_used: ['Your Database'],
            material_source: material.material_source || []
          };
        })
      );

      return materialsWithDetails;
    } catch (err) {
      console.error('Local search error:', err);
      return [];
    }
  }, []);

  // Main search function - uses AI agent first, falls back to local
  const search = useCallback(async (
    searchTerm: string,
    filters?: SearchFilters
  ): Promise<SearchResult[]> => {
    if (!searchTerm.trim()) {
      setResults([]);
      setError(null);
      setCanLoadMore(false);
      return [];
    }

    setLoading(true);
    setError(null);
    setLastSearchTerm(searchTerm);

    try {
      let searchResults: SearchResult[] = [];
      
      // Try AI agent first
      try {
        searchResults = await searchWithAI(searchTerm);
        setLastSearchSource('ai');
      } catch (aiError) {
        console.log('[Search] AI agent failed, falling back to local search');
        searchResults = await searchLocal(searchTerm, filters);
        setLastSearchSource('local');
      }

      // Apply additional filters
      let filteredResults = searchResults;
      
      if (filters?.properties && filters.properties.length > 0) {
        filteredResults = filteredResults.filter(material => {
          return filters.properties!.every(propFilter => {
            if (!propFilter.property.trim()) return true;
            
            const propName = propFilter.property.toLowerCase();
            const propValue = propFilter.value.toLowerCase();
            
            const materialProp = Object.entries(material.properties).find(([key]) => 
              key.toLowerCase().includes(propName)
            );
            
            if (!materialProp) {
              return propFilter.importance !== 'must-have';
            }
            
            if (propValue) {
              const matValue = String(materialProp[1]).toLowerCase();
              return matValue.includes(propValue) || propValue.includes(matValue);
            }
            
            return true;
          });
        });
      }

      if (filters?.industry) {
        filteredResults = filteredResults.filter(m => 
          m.category.toLowerCase().includes(filters.industry!.toLowerCase()) ||
          m.applications.some(a => a.toLowerCase().includes(filters.industry!.toLowerCase()))
        );
      }

      if (filters?.application) {
        filteredResults = filteredResults.filter(m =>
          m.applications.some(a => a.toLowerCase().includes(filters.application!.toLowerCase())) ||
          m.category.toLowerCase().includes(filters.application!.toLowerCase())
        );
      }

      // Sort by match score
      filteredResults.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

      setResults(filteredResults);
      setCanLoadMore(filteredResults.length > 0 && filteredResults.length < RESULTS_THRESHOLD);

      return filteredResults;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Search failed';
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, [searchWithAI, searchLocal]);

  // Load more results
  const loadMore = useCallback(async (): Promise<SearchResult[]> => {
    if (!lastSearchTerm || isLoadingMore) return [];

    setIsLoadingMore(true);

    try {
      const variations = generateSearchVariations(lastSearchTerm);
      console.log(`[Load More] Searching variations: ${variations.join(', ')}`);

      const additionalResults: SearchResult[] = [];
      const existingIds = new Set(results.map(r => r.id));

      for (const variation of variations) {
        if (variation === lastSearchTerm) continue;
        
        try {
          const extResults = await searchWithAI(variation);
          for (const result of extResults) {
            if (!existingIds.has(result.id)) {
              additionalResults.push(result);
              existingIds.add(result.id);
            }
          }
        } catch {
          // Skip failed variations
        }
      }

      if (additionalResults.length > 0) {
        const newResults = [...results, ...additionalResults];
        setResults(newResults);
        setCanLoadMore(false);
        return additionalResults;
      }

      setCanLoadMore(false);
      return [];
    } catch (err) {
      console.error('Load more error:', err);
      return [];
    } finally {
      setIsLoadingMore(false);
    }
  }, [lastSearchTerm, results, searchWithAI, isLoadingMore]);

  // Get single material by ID
  const getMaterialById = useCallback(async (id: string): Promise<SearchResult | null> => {
    const cached = results.find(r => r.id === id);
    if (cached) return cached;

    const localResults = await searchLocal('', undefined, 100);
    return localResults.find(m => m.id === id) || null;
  }, [results, searchLocal]);

  return {
    results,
    loading,
    isLoadingMore,
    error,
    lastSearchSource,
    canLoadMore,
    search,
    loadMore,
    searchLocal,
    searchWithAI,
    getMaterialById,
  };
};

// Generate search term variations for expanded searching
function generateSearchVariations(term: string): string[] {
  const variations = [term];
  const lowerTerm = term.toLowerCase();

  const synonyms: Record<string, string[]> = {
    'bioplastic': ['polylactic acid', 'PLA', 'polyhydroxybutyrate', 'PHB', 'starch polymer'],
    'pla': ['polylactic acid', 'poly lactic acid', '(C3H4O2)n'],
    'polylactic acid': ['PLA', 'poly(lactic acid)', '(C3H4O2)n'],
    'biodegradable': ['compostable', 'bio-based', 'organic polymer'],
    'cellulose': ['cellulose acetate', 'cellulose nanofiber', 'nanocellulose'],
    'hemp': ['hemp fiber', 'cannabis sativa fiber'],
    'bamboo': ['bamboo fiber', 'bamboo cellulose'],
    'algae': ['algae-based', 'seaweed', 'alginate'],
    'mycelium': ['mushroom leather', 'fungal material'],
    'chitin': ['chitosan', 'crustacean shell'],
    'lignin': ['wood polymer', 'lignocellulose'],
    'starch': ['starch-based', 'corn starch', 'thermoplastic starch'],
  };

  for (const [key, values] of Object.entries(synonyms)) {
    if (lowerTerm.includes(key)) {
      variations.push(...values);
    }
    for (const value of values) {
      if (lowerTerm.includes(value.toLowerCase())) {
        variations.push(key);
        variations.push(...values.filter(v => v !== value));
      }
    }
  }

  if (/^[A-Z][a-z]?\d*/.test(term)) {
    variations.push(term.toUpperCase());
  }

  return [...new Set(variations)];
}
