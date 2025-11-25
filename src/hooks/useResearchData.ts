import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ResearchMaterial {
  id: string;
  name: string;
  status: string;
  institution: string;
  year: number;
  funding_stage: string | null;
  contact_email: string | null;
  properties: Record<string, string>;
  potential_applications: string[];
}

export interface LabRecipe {
  id: string;
  title: string;
  source: string;
  authors: string | null;
  doi: string | null;
  key_findings: string | null;
  highlighted_section: string | null;
  materials: string[];
  steps: Array<{ step_number: number; description: string }>;
}

export interface MaterialProperty {
  id: string;
  name: string;
  chemical_structure: string | null;
  properties: Record<string, string>;
  sources: string[];
}

export const useResearchData = () => {
  const [researchMaterials, setResearchMaterials] = useState<ResearchMaterial[]>([]);
  const [labRecipes, setLabRecipes] = useState<LabRecipe[]>([]);
  const [materialProperties, setMaterialProperties] = useState<MaterialProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAllResearchData();
  }, []);

  const fetchAllResearchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch research materials
      const { data: researchData, error: researchError } = await supabase
        .from('research_materials')
        .select('*');

      if (researchError) throw researchError;

      const researchWithDetails = await Promise.all(
        (researchData || []).map(async (material) => {
          const { data: propsData } = await supabase
            .from('research_material_properties')
            .select('*')
            .eq('research_material_id', material.id);

          const properties: Record<string, string> = {};
          propsData?.forEach((prop) => {
            properties[prop.property_name] = prop.property_value;
          });

          const { data: appsData } = await supabase
            .from('research_material_applications')
            .select('*')
            .eq('research_material_id', material.id);

          const applications = appsData?.map((app) => app.application) || [];

          return {
            id: material.id,
            name: material.name,
            status: material.status,
            institution: material.institution,
            year: material.year,
            funding_stage: material.funding_stage,
            contact_email: material.contact_email,
            properties,
            potential_applications: applications,
          };
        })
      );

      setResearchMaterials(researchWithDetails);

      // Fetch lab recipes
      const { data: recipesData, error: recipesError } = await supabase
        .from('lab_recipes')
        .select('*');

      if (recipesError) throw recipesError;

      const recipesWithDetails = await Promise.all(
        (recipesData || []).map(async (recipe) => {
          const { data: materialsData } = await supabase
            .from('lab_recipe_materials')
            .select('*')
            .eq('lab_recipe_id', recipe.id)
            .order('order_index');

          const materials = materialsData?.map((m) => m.material) || [];

          const { data: stepsData } = await supabase
            .from('lab_recipe_steps')
            .select('*')
            .eq('lab_recipe_id', recipe.id)
            .order('step_number');

          const steps =
            stepsData?.map((s) => ({
              step_number: s.step_number,
              description: s.description,
            })) || [];

          return {
            id: recipe.id,
            title: recipe.title,
            source: recipe.source,
            authors: recipe.authors,
            doi: recipe.doi,
            key_findings: recipe.key_findings,
            highlighted_section: recipe.highlighted_section,
            materials,
            steps,
          };
        })
      );

      setLabRecipes(recipesWithDetails);

      // Fetch material properties database
      const { data: propsDbData, error: propsDbError } = await supabase
        .from('material_properties_database')
        .select('*');

      if (propsDbError) throw propsDbError;

      const propsWithDetails = await Promise.all(
        (propsDbData || []).map(async (material) => {
          const { data: valuesData } = await supabase
            .from('material_property_values')
            .select('*')
            .eq('material_properties_database_id', material.id);

          const properties: Record<string, string> = {};
          valuesData?.forEach((prop) => {
            properties[prop.property_name] = prop.property_value;
          });

          const { data: sourcesData } = await supabase
            .from('material_property_sources')
            .select('*')
            .eq('material_properties_database_id', material.id);

          const sources = sourcesData?.map((s) => s.source) || [];

          return {
            id: material.id,
            name: material.name,
            chemical_structure: material.chemical_structure,
            properties,
            sources,
          };
        })
      );

      setMaterialProperties(propsWithDetails);
    } catch (err) {
      console.error('Error fetching research data:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return {
    researchMaterials,
    labRecipes,
    materialProperties,
    loading,
    error,
    refetch: fetchAllResearchData,
  };
};
