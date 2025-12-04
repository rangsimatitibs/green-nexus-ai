-- Create material_synonyms table to map material variations
CREATE TABLE public.material_synonyms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id UUID NOT NULL REFERENCES public.materials(id) ON DELETE CASCADE,
  synonym TEXT NOT NULL,
  synonym_type TEXT DEFAULT 'alias', -- alias, abbreviation, formula, iupac, trade_name
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index for fast synonym lookups
CREATE INDEX idx_material_synonyms_synonym ON public.material_synonyms USING gin (to_tsvector('english', synonym));
CREATE INDEX idx_material_synonyms_material_id ON public.material_synonyms(material_id);

-- Enable RLS
ALTER TABLE public.material_synonyms ENABLE ROW LEVEL SECURITY;

-- Public can view synonyms
CREATE POLICY "Public can view material_synonyms" 
ON public.material_synonyms 
FOR SELECT 
USING (true);

-- Admins can manage synonyms
CREATE POLICY "Admins can manage material_synonyms" 
ON public.material_synonyms 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));