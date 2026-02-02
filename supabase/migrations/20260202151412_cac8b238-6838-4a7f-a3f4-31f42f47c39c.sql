-- Fix the overly permissive policy on property_lookup_cache
DROP POLICY IF EXISTS "Service can manage property cache" ON public.property_lookup_cache;

-- Create more specific policy for cache management
CREATE POLICY "Admins can manage property cache"
ON public.property_lookup_cache
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Allow authenticated users to insert into cache
CREATE POLICY "Authenticated users can insert cache entries"
ON public.property_lookup_cache
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Allow authenticated users to update cache entries
CREATE POLICY "Authenticated users can update cache entries"
ON public.property_lookup_cache
FOR UPDATE
USING (auth.uid() IS NOT NULL);