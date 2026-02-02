import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export type SubscriptionTier = 'free' | 'researcher' | 'industry';

interface Subscription {
  id: string;
  tier: SubscriptionTier;
  status: string;
  currentPeriodEnd: string | null;
}

interface DailyUsage {
  searchCount: number;
  date: string;
}

interface UseSubscriptionReturn {
  tier: SubscriptionTier;
  subscription: Subscription | null;
  loading: boolean;
  dailyUsage: DailyUsage | null;
  canAccessSuppliers: boolean;
  canAccessResearchTools: boolean;
  canSearch: boolean;
  remainingSearches: number;
  incrementSearchCount: () => Promise<void>;
  hasFeatureAccess: (requiredTier: SubscriptionTier) => boolean;
}

const FREE_TIER_DAILY_LIMIT = 5;

export const useSubscription = (): UseSubscriptionReturn => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [dailyUsage, setDailyUsage] = useState<DailyUsage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setSubscription(null);
      setDailyUsage(null);
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
            currentPeriodEnd: subData.current_period_end,
          });
        } else {
          setSubscription(null);
        }

        // Fetch daily usage
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
      } catch (error) {
        console.error('Error fetching subscription:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [user]);

  const tier: SubscriptionTier = subscription?.tier || 'free';

  const hasFeatureAccess = (requiredTier: SubscriptionTier): boolean => {
    if (requiredTier === 'free') return true;
    if (requiredTier === 'researcher') {
      return tier === 'researcher' || tier === 'industry';
    }
    if (requiredTier === 'industry') {
      return tier === 'industry';
    }
    return false;
  };

  const canAccessSuppliers = hasFeatureAccess('industry');
  const canAccessResearchTools = hasFeatureAccess('researcher');
  
  const remainingSearches = tier === 'free' 
    ? Math.max(0, FREE_TIER_DAILY_LIMIT - (dailyUsage?.searchCount || 0))
    : Infinity;
  
  const canSearch = tier !== 'free' || remainingSearches > 0;

  const incrementSearchCount = async () => {
    if (!user || tier !== 'free') return;

    const today = new Date().toISOString().split('T')[0];
    
    try {
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
    } catch (error) {
      console.error('Error incrementing search count:', error);
    }
  };

  return {
    tier,
    subscription,
    loading,
    dailyUsage,
    canAccessSuppliers,
    canAccessResearchTools,
    canSearch,
    remainingSearches,
    incrementSearchCount,
    hasFeatureAccess,
  };
};
