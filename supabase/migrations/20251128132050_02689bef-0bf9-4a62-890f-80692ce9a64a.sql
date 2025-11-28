-- Create storage bucket for material images
INSERT INTO storage.buckets (id, name, public)
VALUES ('material-images', 'material-images', true);

-- Add image_url column to materials table
ALTER TABLE public.materials
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- RLS policies for material-images bucket
CREATE POLICY "Public can view material images"
ON storage.objects FOR SELECT
USING (bucket_id = 'material-images');

CREATE POLICY "Admins can upload material images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'material-images' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can update material images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'material-images' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can delete material images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'material-images' 
  AND has_role(auth.uid(), 'admin'::app_role)
);