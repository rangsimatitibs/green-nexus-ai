-- Create bibliography_libraries table for organizing saved articles
CREATE TABLE public.bibliography_libraries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create saved_bibliography_entries for linking articles to libraries
CREATE TABLE public.saved_bibliography_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  library_id UUID NOT NULL REFERENCES public.bibliography_libraries(id) ON DELETE CASCADE,
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
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bibliography_libraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_bibliography_entries ENABLE ROW LEVEL SECURITY;

-- Libraries: users can manage their own
CREATE POLICY "Users can view their own libraries"
  ON public.bibliography_libraries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own libraries"
  ON public.bibliography_libraries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own libraries"
  ON public.bibliography_libraries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own libraries"
  ON public.bibliography_libraries FOR DELETE
  USING (auth.uid() = user_id);

-- Saved entries: users can manage entries in their libraries
CREATE POLICY "Users can view entries in their libraries"
  ON public.saved_bibliography_entries FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.bibliography_libraries 
    WHERE id = library_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can add entries to their libraries"
  ON public.saved_bibliography_entries FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.bibliography_libraries 
    WHERE id = library_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can delete entries from their libraries"
  ON public.saved_bibliography_entries FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.bibliography_libraries 
    WHERE id = library_id AND user_id = auth.uid()
  ));

-- Indexes
CREATE INDEX idx_bibliography_libraries_user ON public.bibliography_libraries(user_id);
CREATE INDEX idx_saved_entries_library ON public.saved_bibliography_entries(library_id);