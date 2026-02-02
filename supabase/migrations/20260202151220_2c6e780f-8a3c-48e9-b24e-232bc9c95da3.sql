-- Add new roles to the app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'researcher';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'industry';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'free';

-- Create subscriptions table for tier management
CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tier text NOT NULL DEFAULT 'free',
  stripe_customer_id text,
  stripe_subscription_id text,
  status text NOT NULL DEFAULT 'active',
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Create daily_usage table for tracking free tier limits
CREATE TABLE public.daily_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  search_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Enable RLS on both tables
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_usage ENABLE ROW LEVEL SECURITY;

-- Create helper function to get user subscription tier
CREATE OR REPLACE FUNCTION public.get_user_tier(_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT tier FROM public.subscriptions 
     WHERE user_id = _user_id 
     AND status = 'active'
     AND (current_period_end IS NULL OR current_period_end > now())),
    'free'
  )
$$;

-- Create helper function to check if user has tier access
CREATE OR REPLACE FUNCTION public.has_tier_access(_user_id uuid, _required_tier text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE 
    WHEN _required_tier = 'free' THEN true
    WHEN _required_tier = 'researcher' THEN 
      public.get_user_tier(_user_id) IN ('researcher', 'industry')
    WHEN _required_tier = 'industry' THEN 
      public.get_user_tier(_user_id) = 'industry'
    ELSE false
  END
$$;

-- RLS Policies for subscriptions table
CREATE POLICY "Users can view their own subscription"
ON public.subscriptions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage subscriptions"
ON public.subscriptions
FOR ALL
USING (true)
WITH CHECK (true);

-- RLS Policies for daily_usage table
CREATE POLICY "Users can view their own usage"
ON public.daily_usage
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own usage"
ON public.daily_usage
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own usage"
ON public.daily_usage
FOR UPDATE
USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX idx_daily_usage_user_date ON public.daily_usage(user_id, date);

-- RLS Policy to protect supplier data - only industry tier can access
CREATE POLICY "Industry tier can view supplier pricing details"
ON public.suppliers
FOR SELECT
USING (
  public.has_tier_access(auth.uid(), 'industry') OR
  has_role(auth.uid(), 'admin'::app_role)
);