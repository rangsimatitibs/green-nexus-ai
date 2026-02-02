

# Monetization Strategy & Implementation Plan for MaterialInk

## Overview

This plan introduces a tiered subscription model with three user types: **Free (Individual)**, **Researcher**, and **Industry**. Each tier unlocks progressively more features, with Industry users having exclusive access to supplier data.

---

## Proposed Tier Structure

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                        SUBSCRIPTION TIERS                                │
├─────────────────┬─────────────────────┬─────────────────────────────────┤
│   FREE (Basic)  │    RESEARCHER       │         INDUSTRY                │
│   $0/month      │    $29/month        │        $199/month               │
├─────────────────┼─────────────────────┼─────────────────────────────────┤
│ Material Search │ All Free features   │ All Researcher features         │
│ (5 searches/day)│ Unlimited searches  │ Supplier Database Access        │
│                 │ Property Finder     │ Supplier Contact Info           │
│ Basic Results   │ Bibliography Search │ Pricing & MOQ Data              │
│ (Limited props) │ AI Paper Discovery  │ Lead Time Information           │
│                 │ Lab Recipes (View)  │ Bulk Export & Reports           │
│ No supplier data│ Research Library    │ Priority Support                │
│                 │ Save to Libraries   │ API Access (future)             │
│                 │ Export Citations    │ Custom Material Requests        │
└─────────────────┴─────────────────────┴─────────────────────────────────┘
```

---

## Feature Access by Tier

### 1. Free (Individual) Tier
- Material search with **5 searches per day** limit
- View basic material properties (limited to 4 properties per material)
- No supplier information (shows PremiumGate)
- No bibliography search
- No lab recipes access
- Sign up for waitlist to upgrade

### 2. Researcher Tier
- **Unlimited** material searches
- Full property data with AI predictions
- **Property Finder** with deep search
- **Bibliography Search** with AI-powered paper discovery
- Save papers to personal libraries
- **Lab Recipes** - view community protocols
- **Research Library** - access novel materials database
- Export citations and property data
- No supplier access (shows upgrade prompt)

### 3. Industry Tier
- Everything in Researcher tier
- **Exclusive: Supplier Database Access**
  - View all supplier information
  - Company contact details
  - Pricing estimates
  - Minimum order quantities
  - Lead times
  - Certifications
- Material comparison with supplier data
- Export full reports (PDF/CSV)
- Priority support channel
- Custom material request submissions

---

## Technical Implementation

### Database Changes

**1. Extend app_role enum:**
```sql
ALTER TYPE public.app_role ADD VALUE 'researcher';
ALTER TYPE public.app_role ADD VALUE 'industry';
ALTER TYPE public.app_role ADD VALUE 'free';
```

**2. Create subscriptions table:**
```sql
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
```

**3. Create usage_limits table for tracking:**
```sql
CREATE TABLE public.daily_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  search_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);
```

### Frontend Changes

**1. Update AuthContext** to include subscription tier:
- Add `subscriptionTier` to context
- Create `hasFeatureAccess(feature)` helper function
- Create `canAccessSuppliers()` check

**2. Create TierGate Component:**
- Reusable component showing upgrade prompts
- Different messaging per required tier
- Links to pricing/signup page

**3. Update Material Scouting:**
- Gate supplier view behind Industry tier
- Show "Upgrade to Industry" prompt for other users
- Track search usage for free users

**4. Update Researcher's Tool:**
- Gate Lab Recipes behind Researcher tier
- Gate Research Library behind Researcher tier
- Bibliography available to Researcher+

**5. Create Pricing Page:**
- Display all tiers with feature comparison
- Stripe checkout integration
- Toggle monthly/annual pricing

### Stripe Integration

**1. Products to create:**
- `researcher_monthly` - $29/month
- `researcher_annual` - $290/year (save 2 months)
- `industry_monthly` - $199/month
- `industry_annual` - $1990/year (save 2 months)

**2. Webhook handling:**
- Handle `checkout.session.completed`
- Handle `customer.subscription.updated`
- Handle `customer.subscription.deleted`
- Sync subscription status to database

---

## UI/UX Changes

### PremiumGate Enhancements
Update the existing `PremiumGate` component to:
- Accept `requiredTier` prop
- Show tier-specific messaging
- Display feature comparison for that tier
- Link to pricing page with pre-selected tier

### New Components Needed
1. **`SubscriptionBadge`** - Shows current tier in header
2. **`UsageMeter`** - Shows daily search limit for free users
3. **`UpgradePrompt`** - Contextual upgrade suggestions
4. **`PricingTable`** - Full pricing comparison

---

## Implementation Order

1. **Phase 1: Database Setup**
   - Add new roles to enum
   - Create subscriptions table
   - Create daily_usage table
   - Add RLS policies

2. **Phase 2: Auth & Context**
   - Update AuthContext with tier checking
   - Create subscription hook
   - Implement usage tracking

3. **Phase 3: Feature Gating**
   - Update Material Scouting (supplier gate)
   - Update Researcher's Tool (recipe/library gates)
   - Add usage limits for free tier

4. **Phase 4: Stripe Integration**
   - Enable Stripe connector
   - Create checkout flow
   - Implement webhooks
   - Create pricing page

5. **Phase 5: Polish**
   - Add upgrade prompts throughout
   - Create subscription management page
   - Add email notifications

---

## Security Considerations

- All tier checks done server-side via RLS policies
- Supplier data protected with `tier = 'industry'` policy
- API rate limiting for free tier
- Stripe webhook signature verification

