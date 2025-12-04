-- Fix search_materials function with proper search_path
CREATE OR REPLACE FUNCTION search_materials(
  search_term TEXT DEFAULT NULL,
  category_filter TEXT DEFAULT NULL,
  source_filter TEXT DEFAULT NULL,
  result_limit INTEGER DEFAULT 50
)
RETURNS SETOF materials 
LANGUAGE sql 
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;