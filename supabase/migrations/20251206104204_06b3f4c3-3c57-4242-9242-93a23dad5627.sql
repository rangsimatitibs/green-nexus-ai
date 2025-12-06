-- Create bibliography_entries table for storing research articles
CREATE TABLE public.bibliography_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  authors TEXT[] NOT NULL DEFAULT '{}',
  abstract TEXT,
  journal TEXT,
  year INTEGER,
  doi TEXT,
  url TEXT,
  source_database TEXT NOT NULL,
  keywords TEXT[] DEFAULT '{}',
  citation_count INTEGER DEFAULT 0,
  material_relevance TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_id UUID REFERENCES auth.users(id),
  is_saved BOOLEAN DEFAULT false
);

-- Enable RLS
ALTER TABLE public.bibliography_entries ENABLE ROW LEVEL SECURITY;

-- Allow public read access for shared entries
CREATE POLICY "Anyone can view bibliography entries"
  ON public.bibliography_entries
  FOR SELECT
  USING (true);

-- Allow authenticated users to insert
CREATE POLICY "Authenticated users can insert bibliography entries"
  ON public.bibliography_entries
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL OR user_id IS NULL);

-- Allow users to update their own saved entries
CREATE POLICY "Users can update their own entries"
  ON public.bibliography_entries
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Allow users to delete their own entries
CREATE POLICY "Users can delete their own entries"
  ON public.bibliography_entries
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster searches
CREATE INDEX idx_bibliography_title ON public.bibliography_entries USING gin(to_tsvector('english', title));
CREATE INDEX idx_bibliography_source ON public.bibliography_entries(source_database);
CREATE INDEX idx_bibliography_year ON public.bibliography_entries(year DESC);