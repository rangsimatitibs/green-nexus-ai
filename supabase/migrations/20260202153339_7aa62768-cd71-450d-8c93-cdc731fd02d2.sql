-- Add new tier values to app_role enum
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'researcher_lite';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'researcher_premium';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'industry_lite';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'industry_premium';

-- Add billing_period column to subscriptions table
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS billing_period text DEFAULT 'monthly';

-- Add check constraint for billing_period
ALTER TABLE public.subscriptions 
ADD CONSTRAINT subscriptions_billing_period_check 
CHECK (billing_period IN ('monthly', 'annual'));

-- Create monthly_usage table for tracking Lite tier limits
CREATE TABLE IF NOT EXISTS public.monthly_usage (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  month date NOT NULL DEFAULT date_trunc('month', CURRENT_DATE)::date,
  search_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, month)
);

-- Enable RLS on monthly_usage
ALTER TABLE public.monthly_usage ENABLE ROW LEVEL SECURITY;

-- RLS policies for monthly_usage
CREATE POLICY "Users can view their own monthly usage"
ON public.monthly_usage FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own monthly usage"
ON public.monthly_usage FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own monthly usage"
ON public.monthly_usage FOR UPDATE
USING (auth.uid() = user_id);

-- Migrate existing 'researcher' tier to 'researcher_lite'
UPDATE public.subscriptions 
SET tier = 'researcher_lite' 
WHERE tier = 'researcher';

-- Update get_user_tier function to handle new tiers
CREATE OR REPLACE FUNCTION public.get_user_tier(_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT COALESCE(
    (SELECT tier FROM public.subscriptions 
     WHERE user_id = _user_id 
     AND status = 'active'
     AND (current_period_end IS NULL OR current_period_end > now())),
    'free'
  )
$function$;

-- Update has_tier_access function for new tier hierarchy
CREATE OR REPLACE FUNCTION public.has_tier_access(_user_id uuid, _required_tier text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT CASE 
    WHEN _required_tier = 'free' THEN true
    WHEN _required_tier IN ('researcher', 'researcher_lite') THEN 
      public.get_user_tier(_user_id) IN ('researcher_lite', 'researcher_premium', 'industry_lite', 'industry_premium')
    WHEN _required_tier = 'researcher_premium' THEN 
      public.get_user_tier(_user_id) IN ('researcher_premium', 'industry_lite', 'industry_premium')
    WHEN _required_tier IN ('industry', 'industry_lite') THEN 
      public.get_user_tier(_user_id) IN ('industry_lite', 'industry_premium')
    WHEN _required_tier = 'industry_premium' THEN 
      public.get_user_tier(_user_id) = 'industry_premium'
    ELSE false
  END
$function$;