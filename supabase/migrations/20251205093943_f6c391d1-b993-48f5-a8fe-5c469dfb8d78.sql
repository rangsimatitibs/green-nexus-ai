-- Add material_source field to store the origin/feedstock of materials
-- Examples: "seaweed", "agricultural waste", "fungi", "fossil fuel chemicals"
ALTER TABLE public.materials 
ADD COLUMN material_source text[] DEFAULT NULL;

-- Add comment for clarity
COMMENT ON COLUMN public.materials.material_source IS 'Array of material origins/feedstocks, e.g., seaweed, agricultural waste, fungi';