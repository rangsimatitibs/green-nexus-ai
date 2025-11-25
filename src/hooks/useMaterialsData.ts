import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Material {
  id: string;
  name: string;
  category: string;
  chemical_formula: string | null;
  chemical_structure: string | null;
  uniqueness: string | null;
  scale: string | null;
  innovation: string | null;
  properties: Record<string, string>;
  sustainability: {
    score: number;
    breakdown: Record<string, number>;
    calculation: string | null;
  };
  applications: string[];
  regulations: string[];
  suppliers: Array<{
    id: string;
    company: string;
    country: string;
    logo_url: string | null;
    product_image_url: string | null;
    uniqueness: string | null;
    pricing: string | null;
    min_order: string | null;
    lead_time: string | null;
    properties: Record<string, string>;
    detailed_properties: Record<string, Record<string, string>>;
    certifications: string[];
  }>;
}

export const useMaterialsData = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch materials with all related data
      const { data: materialsData, error: materialsError } = await supabase
        .from('materials')
        .select('*');

      if (materialsError) throw materialsError;

      // Fetch related data for each material
      const materialsWithDetails = await Promise.all(
        (materialsData || []).map(async (material) => {
          // Fetch properties
          const { data: propertiesData } = await supabase
            .from('material_properties')
            .select('*')
            .eq('material_id', material.id);

          const properties: Record<string, string> = {};
          propertiesData?.forEach((prop) => {
            properties[prop.property_name] = prop.property_value;
          });

          // Fetch applications
          const { data: applicationsData } = await supabase
            .from('material_applications')
            .select('*')
            .eq('material_id', material.id);

          const applications = applicationsData?.map((app) => app.application) || [];

          // Fetch regulations
          const { data: regulationsData } = await supabase
            .from('material_regulations')
            .select('*')
            .eq('material_id', material.id);

          const regulations = regulationsData?.map((reg) => reg.regulation) || [];

          // Fetch sustainability
          const { data: sustainabilityData } = await supabase
            .from('material_sustainability')
            .select('*')
            .eq('material_id', material.id)
            .single();

          const sustainability = sustainabilityData
            ? {
                score: sustainabilityData.overall_score,
                breakdown: {
                  renewable: sustainabilityData.renewable_score,
                  carbonFootprint: sustainabilityData.carbon_footprint_score,
                  biodegradability: sustainabilityData.biodegradability_score,
                  toxicity: sustainabilityData.toxicity_score,
                },
                calculation: sustainabilityData.calculation_method,
              }
            : { score: 0, breakdown: {}, calculation: null };

          // Fetch suppliers
          const { data: suppliersData } = await supabase
            .from('suppliers')
            .select('*')
            .eq('material_id', material.id);

          const suppliers = await Promise.all(
            (suppliersData || []).map(async (supplier) => {
              // Fetch supplier properties
              const { data: supplierPropsData } = await supabase
                .from('supplier_properties')
                .select('*')
                .eq('supplier_id', supplier.id);

              const supplierProps: Record<string, string> = {};
              supplierPropsData?.forEach((prop) => {
                supplierProps[prop.property_name] = prop.property_value;
              });

              // Fetch detailed properties
              const { data: detailedPropsData } = await supabase
                .from('supplier_detailed_properties')
                .select('*')
                .eq('supplier_id', supplier.id);

              const detailedProps: Record<string, Record<string, string>> = {};
              detailedPropsData?.forEach((prop) => {
                if (!detailedProps[prop.category]) {
                  detailedProps[prop.category] = {};
                }
                detailedProps[prop.category][prop.property_name] = prop.property_value;
              });

              // Fetch certifications
              const { data: certificationsData } = await supabase
                .from('supplier_certifications')
                .select('*')
                .eq('supplier_id', supplier.id);

              const certifications =
                certificationsData?.map((cert) => cert.certification) || [];

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
                certifications,
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
            properties,
            sustainability,
            applications,
            regulations,
            suppliers,
          };
        })
      );

      setMaterials(materialsWithDetails);
    } catch (err) {
      console.error('Error fetching materials:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return { materials, loading, error, refetch: fetchMaterials };
};
