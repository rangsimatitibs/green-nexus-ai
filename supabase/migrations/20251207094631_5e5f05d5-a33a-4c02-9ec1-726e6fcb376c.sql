-- Create a cache table for property lookups
CREATE TABLE public.property_lookup_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  material_name TEXT NOT NULL,
  property_name TEXT NOT NULL,
  property_value TEXT NOT NULL,
  confidence TEXT,
  sources JSONB,
  search_count INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(material_name, property_name)
);

-- Enable RLS
ALTER TABLE public.property_lookup_cache ENABLE ROW LEVEL SECURITY;

-- Public read access for cache
CREATE POLICY "Public can view property cache" 
ON public.property_lookup_cache 
FOR SELECT 
USING (true);

-- Service role can manage cache (edge functions use service role)
CREATE POLICY "Service can manage property cache" 
ON public.property_lookup_cache 
FOR ALL 
USING (true);

-- Create index for fast lookups
CREATE INDEX idx_property_cache_lookup ON public.property_lookup_cache(material_name, property_name);
CREATE INDEX idx_property_cache_popular ON public.property_lookup_cache(search_count DESC);

-- Trigger to update updated_at
CREATE TRIGGER update_property_cache_updated_at
BEFORE UPDATE ON public.property_lookup_cache
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();