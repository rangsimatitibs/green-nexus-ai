import { SubscriptionTier } from "@/hooks/useSubscription";

export interface StripePriceConfig {
  priceId: string;
  productId: string;
}

export interface StripeTierConfig {
  monthly: StripePriceConfig;
  annual?: StripePriceConfig; // Annual prices can be added later
}

// Stripe product and price mappings
export const STRIPE_TIERS: Partial<Record<SubscriptionTier, StripeTierConfig>> = {
  researcher_lite: {
    monthly: {
      priceId: "price_1SwPcBRNDLTTpBBfeRBuBCbS",
      productId: "prod_TuE4mwtUnj7Ott",
    },
  },
  researcher_premium: {
    monthly: {
      priceId: "price_1SwPcwRNDLTTpBBfmJ3ELgXV",
      productId: "prod_TuE58iFRJANG1f",
    },
  },
  industry_lite: {
    monthly: {
      priceId: "price_1SwPdzRNDLTTpBBfL3hsnR42",
      productId: "prod_TuE6k644OlPPWc",
    },
  },
  industry_premium: {
    monthly: {
      priceId: "price_1SwPeERNDLTTpBBfZmfU9Wj5",
      productId: "prod_TuE6z5enLtycmI",
    },
  },
};

// Map Stripe product IDs back to subscription tiers
export const PRODUCT_TO_TIER: Record<string, SubscriptionTier> = {
  "prod_TuE4mwtUnj7Ott": "researcher_lite",
  "prod_TuE58iFRJANG1f": "researcher_premium",
  "prod_TuE6k644OlPPWc": "industry_lite",
  "prod_TuE6z5enLtycmI": "industry_premium",
};

export const getPriceId = (tier: SubscriptionTier, billingPeriod: 'monthly' | 'annual' = 'monthly'): string | null => {
  const config = STRIPE_TIERS[tier];
  if (!config) return null;
  
  if (billingPeriod === 'annual' && config.annual) {
    return config.annual.priceId;
  }
  
  return config.monthly.priceId;
};
