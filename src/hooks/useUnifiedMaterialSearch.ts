import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Material } from './useMaterialsData';

export interface SearchFilters {
  category?: string;
  source?: string;
  properties?: Array<{ property: string; value: string; importance: string }>;
  industry?: string;
  application?: string;
}

export interface SearchResult extends Material {
  data_source?: string;
  external_id?: string;
  last_synced_at?: string;
  matchScore?: number;
}

export const useUnifiedMaterialSearch = () => {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSearchSource, setLastSearchSource] = useState<'local' | 'external' | null>(null);

  // Search local database
  const searchLocal = useCallback(async (
    searchTerm: string,
    filters?: SearchFilters,
    limit: number = 50
  ): Promise<SearchResult[]> => {
    const { data, error } = await supabase.rpc('search_materials', {
      search_term: searchTerm || null,
      category_filter: filters?.category || null,
      source_filter: filters?.source || null,
      result_limit: limit,
    });

    if (error) {
      console.error('Local search error:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Fetch full material details for results
    const materialsWithDetails = await Promise.all(
      data.map(async (material: any) => {
        const [propertiesRes, applicationsRes, regulationsRes, sustainabilityRes, suppliersRes] = await Promise.all([
          supabase.from('material_properties').select('*').eq('material_id', material.id),
          supabase.from('material_applications').select('*').eq('material_id', material.id),
          supabase.from('material_regulations').select('*').eq('material_id', material.id),
          supabase.from('material_sustainability').select('*').eq('material_id', material.id).maybeSingle(),
          supabase.from('suppliers').select('*').eq('material_id', material.id),
        ]);

        const properties: Record<string, string> = {};
        propertiesRes.data?.forEach((prop) => {
          properties[prop.property_name] = prop.property_value;
        });

        const applications = applicationsRes.data?.map((app) => app.application) || [];
        const regulations = regulationsRes.data?.map((reg) => reg.regulation) || [];

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
            }
          : { score: 0, breakdown: {}, calculation: null };

        // Fetch supplier details
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
          data_source: material.data_source || 'manual',
          external_id: material.external_id,
          last_synced_at: material.last_synced_at,
          properties,
          sustainability,
          applications,
          regulations,
          suppliers,
        };
      })
    );

    return materialsWithDetails;
  }, []);

  // Search external API (PubChem)
  const searchExternal = useCallback(async (searchTerm: string): Promise<SearchResult | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('fetch-material-data', {
        body: { name: searchTerm, storeResult: true },
      });

      if (error) {
        console.error('External search error:', error);
        return null;
      }

      if (!data.found) {
        return null;
      }

      // Return the material data formatted as SearchResult
      const materialData = data.material;
      return {
        id: data.cid ? `pubchem-${data.cid}` : `temp-${Date.now()}`,
        name: materialData.name,
        category: materialData.category,
        chemical_formula: materialData.chemical_formula,
        chemical_structure: null,
        uniqueness: null,
        scale: null,
        innovation: null,
        data_source: 'pubchem',
        external_id: materialData.external_id,
        last_synced_at: materialData.last_synced_at,
        properties: materialData.properties,
        sustainability: { score: 0, breakdown: {}, calculation: null },
        applications: [],
        regulations: [],
        suppliers: [],
      };
    } catch (err) {
      console.error('External search error:', err);
      return null;
    }
  }, []);

  // Combined search function
  const search = useCallback(async (
    searchTerm: string,
    filters?: SearchFilters,
    deepSearch: boolean = false
  ) => {
    setLoading(true);
    setError(null);
    setResults([]);

    try {
      // First, search local database
      let localResults = await searchLocal(searchTerm, filters);
      
      // Apply additional filters (properties, industry, application)
      if (filters?.properties && filters.properties.length > 0) {
        localResults = localResults.filter(material => {
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
        localResults = localResults.filter(m => 
          m.category.toLowerCase().includes(filters.industry!.toLowerCase()) ||
          m.applications.some(a => a.toLowerCase().includes(filters.industry!.toLowerCase()))
        );
      }

      if (filters?.application) {
        localResults = localResults.filter(m =>
          m.applications.some(a => a.toLowerCase().includes(filters.application!.toLowerCase())) ||
          m.category.toLowerCase().includes(filters.application!.toLowerCase())
        );
      }

      if (localResults.length > 0) {
        setResults(localResults);
        setLastSearchSource('local');
        setLoading(false);
        return localResults;
      }

      // If no results and deep search enabled, query external API
      if (deepSearch && searchTerm.trim()) {
        console.log('No local results, searching external databases...');
        const externalResult = await searchExternal(searchTerm);
        
        if (externalResult) {
          setResults([externalResult]);
          setLastSearchSource('external');
          setLoading(false);
          return [externalResult];
        }
      }

      setResults([]);
      setLastSearchSource(localResults.length > 0 ? 'local' : null);
      setLoading(false);
      return [];
    } catch (err) {
      console.error('Search error:', err);
      setError(err instanceof Error ? err.message : 'Search failed');
      setLoading(false);
      return [];
    }
  }, [searchLocal, searchExternal]);

  // Get single material by ID
  const getMaterialById = useCallback(async (id: string): Promise<SearchResult | null> => {
    const results = await searchLocal('', undefined, 100);
    return results.find(m => m.id === id) || null;
  }, [searchLocal]);

  // Refresh material from external source
  const refreshFromExternal = useCallback(async (materialName: string): Promise<SearchResult | null> => {
    setLoading(true);
    try {
      const result = await searchExternal(materialName);
      setLoading(false);
      return result;
    } catch (err) {
      setLoading(false);
      return null;
    }
  }, [searchExternal]);

  return {
    results,
    loading,
    error,
    lastSearchSource,
    search,
    searchLocal,
    searchExternal,
    getMaterialById,
    refreshFromExternal,
  };
};
