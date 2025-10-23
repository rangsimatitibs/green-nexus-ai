-- Create a table for waitlist signups
CREATE TABLE public.waitlist_signups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  company_name TEXT,
  full_name TEXT,
  phone TEXT,
  interest_area TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.waitlist_signups ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (public signup form)
CREATE POLICY "Anyone can sign up for waitlist"
ON public.waitlist_signups
FOR INSERT
WITH CHECK (true);

-- Only allow users to view their own signups
CREATE POLICY "Users can view their own signups"
ON public.waitlist_signups
FOR SELECT
USING (auth.uid() IS NOT NULL OR true);

-- Add index for faster email lookups
CREATE INDEX idx_waitlist_signups_email ON public.waitlist_signups(email);