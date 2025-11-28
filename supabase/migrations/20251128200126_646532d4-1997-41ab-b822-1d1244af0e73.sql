-- Create optimization_runs table to store user optimization sessions
CREATE TABLE public.optimization_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  process_name TEXT NOT NULL,
  process_type TEXT NOT NULL, -- 'fermentation', 'enzymatic', 'synthesis', 'custom'
  
  -- Input parameters
  temperature NUMERIC NOT NULL,
  ph NUMERIC NOT NULL,
  agitation NUMERIC NOT NULL,
  substrate_concentration NUMERIC,
  oxygen_level NUMERIC,
  retention_time NUMERIC,
  
  -- Constraints
  temp_min NUMERIC,
  temp_max NUMERIC,
  ph_min NUMERIC,
  ph_max NUMERIC,
  
  -- Baseline results
  baseline_yield NUMERIC NOT NULL,
  baseline_energy NUMERIC NOT NULL,
  baseline_time NUMERIC NOT NULL,
  
  -- Optimized results
  optimized_yield NUMERIC NOT NULL,
  optimized_energy NUMERIC NOT NULL,
  optimized_time NUMERIC NOT NULL,
  
  -- Optimized parameters
  opt_temperature NUMERIC NOT NULL,
  opt_ph NUMERIC NOT NULL,
  opt_agitation NUMERIC NOT NULL,
  opt_substrate_concentration NUMERIC,
  opt_oxygen_level NUMERIC,
  opt_retention_time NUMERIC,
  
  -- Improvements (percentage changes)
  yield_improvement NUMERIC NOT NULL,
  energy_improvement NUMERIC NOT NULL,
  time_improvement NUMERIC NOT NULL,
  
  -- Notes
  notes TEXT
);

-- Enable RLS
ALTER TABLE public.optimization_runs ENABLE ROW LEVEL SECURITY;

-- Users can view their own optimization runs
CREATE POLICY "Users can view own optimization_runs"
ON public.optimization_runs
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own optimization runs
CREATE POLICY "Users can create own optimization_runs"
ON public.optimization_runs
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own optimization runs
CREATE POLICY "Users can update own optimization_runs"
ON public.optimization_runs
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own optimization runs
CREATE POLICY "Users can delete own optimization_runs"
ON public.optimization_runs
FOR DELETE
USING (auth.uid() = user_id);

-- Admins can manage all optimization runs
CREATE POLICY "Admins can manage all optimization_runs"
ON public.optimization_runs
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create indexes for faster queries
CREATE INDEX idx_optimization_runs_user_id ON public.optimization_runs(user_id);
CREATE INDEX idx_optimization_runs_created_at ON public.optimization_runs(created_at DESC);