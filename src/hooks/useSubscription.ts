import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export type SubscriptionTier = 'free' | 'researcher_lite' | 'researcher_premium' | 'industry_lite' | 'industry_premium';
export type BillingPeriod = 'monthly' | 'annual';

interface Subscription {
  id: string;
  tier: SubscriptionTier;
  status: string;
  billingPeriod: BillingPeriod;
  currentPeriodEnd: string | null;
}

interface DailyUsage {
  searchCount: number;
  date: string;
}

interface MonthlyUsage {
  searchCount: number;
  month: string;
}

interface UseSubscriptionReturn {
  tier: SubscriptionTier;
  subscription: Subscription | null;
  loading: boolean;
  dailyUsage: DailyUsage | null;
  monthlyUsage: MonthlyUsage | null;
  canAccessSuppliers: boolean;
  canAccessResearchTools: boolean;
  canSearch: boolean;
  remainingSearches: number;
  incrementSearchCount: () => Promise<void>;
  hasFeatureAccess: (requiredTier: SubscriptionTier) => boolean;
  isLiteTier: boolean;
  isPremiumTier: boolean;
}

const FREE_TIER_DAILY_LIMIT = 5;
const LITE_TIER_MONTHLY_LIMIT = 100;

const getMonthKey = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
};

export const useSubscription = (): UseSubscriptionReturn => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [dailyUsage, setDailyUsage] = useState<DailyUsage | null>(null);
  const [monthlyUsage, setMonthlyUsage] = useState<MonthlyUsage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setSubscription(null);
      setDailyUsage(null);
      setMonthlyUsage(null);
      setLoading(false);
      return;
    }

    const fetchSubscription = async () => {
      setLoading(true);
      try {
        // Fetch subscription
        const { data: subData, error: subError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .single();

        if (subData && !subError) {
          setSubscription({
            id: subData.id,
            tier: subData.tier as SubscriptionTier,
            status: subData.status,
            billingPeriod: (subData.billing_period as BillingPeriod) || 'monthly',
            currentPeriodEnd: subData.current_period_end,
          });
        } else {
          setSubscription(null);
        }

        // Fetch daily usage (for free tier)
        const today = new Date().toISOString().split('T')[0];
        const { data: usageData, error: usageError } = await supabase
          .from('daily_usage')
          .select('*')
          .eq('user_id', user.id)
          .eq('date', today)
          .single();

        if (usageData && !usageError) {
          setDailyUsage({
            searchCount: usageData.search_count,
            date: usageData.date,
          });
        } else {
          setDailyUsage({ searchCount: 0, date: today });
        }

        // Fetch monthly usage (for lite tiers)
        const monthKey = getMonthKey();
        const { data: monthlyData, error: monthlyError } = await supabase
          .from('monthly_usage')
          .select('*')
          .eq('user_id', user.id)
          .eq('month', monthKey)
          .single();

        if (monthlyData && !monthlyError) {
          setMonthlyUsage({
            searchCount: monthlyData.search_count,
            month: monthlyData.month,
          });
        } else {
          setMonthlyUsage({ searchCount: 0, month: monthKey });
        }
      } catch (error) {
        console.error('Error fetching subscription:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [user]);

  const tier: SubscriptionTier = subscription?.tier || 'free';
  
  const isLiteTier = tier === 'researcher_lite' || tier === 'industry_lite';
  const isPremiumTier = tier === 'researcher_premium' || tier === 'industry_premium';

  const hasFeatureAccess = (requiredTier: SubscriptionTier): boolean => {
    const tierHierarchy: Record<SubscriptionTier, SubscriptionTier[]> = {
      'free': ['free', 'researcher_lite', 'researcher_premium', 'industry_lite', 'industry_premium'],
      'researcher_lite': ['researcher_lite', 'researcher_premium', 'industry_lite', 'industry_premium'],
      'researcher_premium': ['researcher_premium', 'industry_lite', 'industry_premium'],
      'industry_lite': ['industry_lite', 'industry_premium'],
      'industry_premium': ['industry_premium'],
    };
    return tierHierarchy[requiredTier]?.includes(tier) ?? false;
  };

  const canAccessSuppliers = hasFeatureAccess('industry_lite');
  const canAccessResearchTools = hasFeatureAccess('researcher_lite');
  
  // Calculate remaining searches based on tier
  let remainingSearches: number;
  if (tier === 'free') {
    remainingSearches = Math.max(0, FREE_TIER_DAILY_LIMIT - (dailyUsage?.searchCount || 0));
  } else if (isLiteTier) {
    remainingSearches = Math.max(0, LITE_TIER_MONTHLY_LIMIT - (monthlyUsage?.searchCount || 0));
  } else {
    remainingSearches = Infinity;
  }
  
  const canSearch = remainingSearches > 0;

  const incrementSearchCount = async () => {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];
    const monthKey = getMonthKey();

    try {
      // Always update daily usage for free tier
      if (tier === 'free') {
        const { data: existingUsage } = await supabase
          .from('daily_usage')
          .select('*')
          .eq('user_id', user.id)
          .eq('date', today)
          .single();

        if (existingUsage) {
          await supabase
            .from('daily_usage')
            .update({ search_count: existingUsage.search_count + 1 })
            .eq('id', existingUsage.id);
          
          setDailyUsage(prev => prev ? { ...prev, searchCount: prev.searchCount + 1 } : null);
        } else {
          await supabase
            .from('daily_usage')
            .insert({ user_id: user.id, date: today, search_count: 1 });
          
          setDailyUsage({ searchCount: 1, date: today });
        }
      }
      
      // Update monthly usage for lite tiers
      if (isLiteTier) {
        const { data: existingMonthly } = await supabase
          .from('monthly_usage')
          .select('*')
          .eq('user_id', user.id)
          .eq('month', monthKey)
          .single();

        if (existingMonthly) {
          await supabase
            .from('monthly_usage')
            .update({ search_count: existingMonthly.search_count + 1 })
            .eq('id', existingMonthly.id);
          
          setMonthlyUsage(prev => prev ? { ...prev, searchCount: prev.searchCount + 1 } : null);
        } else {
          await supabase
            .from('monthly_usage')
            .insert({ user_id: user.id, month: monthKey, search_count: 1 });
          
          setMonthlyUsage({ searchCount: 1, month: monthKey });
        }
      }
    } catch (error) {
      console.error('Error incrementing search count:', error);
    }
  };

  return {
    tier,
    subscription,
    loading,
    dailyUsage,
    monthlyUsage,
    canAccessSuppliers,
    canAccessResearchTools,
    canSearch,
    remainingSearches,
    incrementSearchCount,
    hasFeatureAccess,
    isLiteTier,
    isPremiumTier,
  };
};
