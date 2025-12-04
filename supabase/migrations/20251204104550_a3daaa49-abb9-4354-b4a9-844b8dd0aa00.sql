-- Add columns to materials table for external data integration
ALTER TABLE materials ADD COLUMN IF NOT EXISTS data_source TEXT DEFAULT 'manual';
ALTER TABLE materials ADD COLUMN IF NOT EXISTS external_id TEXT;
ALTER TABLE materials ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMPTZ;

-- Create index for faster searches
CREATE INDEX IF NOT EXISTS idx_materials_name_search ON materials USING gin(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_materials_data_source ON materials(data_source);

-- Create search function for optimized filtering
CREATE OR REPLACE FUNCTION search_materials(
  search_term TEXT DEFAULT NULL,
  category_filter TEXT DEFAULT NULL,
  source_filter TEXT DEFAULT NULL,
  result_limit INTEGER DEFAULT 50
)
RETURNS SETOF materials AS $$
  SELECT * FROM materials
  WHERE 
    (search_term IS NULL OR 
     name ILIKE '%' || search_term || '%' OR
     chemical_formula ILIKE '%' || search_term || '%' OR
     category ILIKE '%' || search_term || '%')
    AND (category_filter IS NULL OR category = category_filter)
    AND (source_filter IS NULL OR data_source = source_filter)
  ORDER BY 
    CASE WHEN search_term IS NOT NULL AND name ILIKE search_term THEN 0 
         WHEN search_term IS NOT NULL AND name ILIKE search_term || '%' THEN 1
         ELSE 2 END,
    name
  LIMIT result_limit;
$$ LANGUAGE sql STABLE;
