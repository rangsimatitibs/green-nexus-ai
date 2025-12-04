-- Create external_data_sources table for managing external APIs
CREATE TABLE public.external_data_sources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  api_endpoint TEXT,
  api_key_secret_name TEXT,
  data_format JSONB DEFAULT '{"type": "json", "fields": []}',
  field_mapping JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  rate_limit_per_minute INTEGER DEFAULT 60,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.external_data_sources ENABLE ROW LEVEL SECURITY;

-- Only admins can manage external sources
CREATE POLICY "Admins can manage external sources"
ON public.external_data_sources
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Public read for active sources (for app to know what's available)
CREATE POLICY "Anyone can read active sources"
ON public.external_data_sources
FOR SELECT
USING (is_active = true);

-- Add trigger for updated_at
CREATE TRIGGER update_external_data_sources_updated_at
BEFORE UPDATE ON public.external_data_sources
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default sources
INSERT INTO public.external_data_sources (name, description, api_endpoint, is_active, priority, data_format, field_mapping)
VALUES 
  ('PubChem', 'Chemical compound database from NIH', 'https://pubchem.ncbi.nlm.nih.gov/rest/pug', true, 1, 
   '{"type": "json", "fields": ["MolecularFormula", "MolecularWeight", "IUPACName", "CanonicalSMILES"]}',
   '{"MolecularFormula": "chemical_formula", "MolecularWeight": "Molecular Weight", "IUPACName": "IUPAC Name"}'),
  ('MakeItFrom', 'Engineering material properties', 'https://www.makeitfrom.com/material-properties', true, 2,
   '{"type": "html_scrape", "fields": ["Density", "Young''s Modulus", "Tensile Strength", "Thermal Conductivity"]}',
   '{}'),
  ('Materials Project', 'Computational materials science database', 'https://api.materialsproject.org/v2', true, 3,
   '{"type": "json", "fields": ["formula_pretty", "band_gap", "formation_energy_per_atom"]}',
   '{"formula_pretty": "chemical_formula", "band_gap": "Band Gap", "formation_energy_per_atom": "Formation Energy"}'),
  ('AI Analysis', 'AI-generated descriptions and sustainability scores', NULL, true, 0,
   '{"type": "ai_generated", "fields": ["description", "sustainability", "safety", "regulations"]}',
   '{}');