
# Monthly/Annual Billing Plan

## Overview
Add a billing period toggle (Monthly vs Annual) to the Subscriptions page, with annual subscriptions offering a discount (typically ~17% off, equivalent to 2 months free).

## Pricing Structure

| Tier | Monthly | Annual | Savings |
|------|---------|--------|---------|
| Free | $0 | $0 | - |
| Researcher Lite | $29/mo | $290/yr ($24.17/mo) | Save $58 |
| Researcher Premium | $49/mo | $490/yr ($40.83/mo) | Save $98 |
| Industry Lite | $149/mo | $1,490/yr ($124.17/mo) | Save $298 |
| Industry Premium | $249/mo | $2,490/yr ($207.50/mo) | Save $498 |

---

## Phase 1: Database Changes

### 1.1 Add billing_period column to subscriptions table
```sql
ALTER TABLE subscriptions 
ADD COLUMN billing_period text DEFAULT 'monthly' 
CHECK (billing_period IN ('monthly', 'annual'));
```

### 1.2 Update tier enum values
Add the new Lite/Premium tier values as planned previously.

---

## Phase 2: UI Components

### 2.1 Create BillingToggle Component
A styled toggle switch to switch between Monthly and Annual views:
- Left: "Monthly"
- Right: "Annual" with a savings badge ("Save up to 17%")
- Smooth animation on toggle

### 2.2 Update Subscriptions Page Structure
1. Add `billingPeriod` state: `'monthly' | 'annual'`
2. Add the BillingToggle above the tier cards
3. Update tier data to include both monthly and annual prices
4. Display appropriate price based on selected billing period
5. Show annual savings badge on each card when annual is selected

---

## Phase 3: Tier Card Updates

### 3.1 Updated Tier Data Structure
```typescript
const tiers = [
  {
    name: "Free",
    monthlyPrice: 0,
    annualPrice: 0,
    tier: "free",
    // ...features
  },
  {
    name: "Researcher Lite",
    monthlyPrice: 29,
    annualPrice: 290,
    tier: "researcher_lite",
    searchLimit: "100/month",
    // ...features
  },
  // ...etc
];
```

### 3.2 Dynamic Price Display
- Show `/month` for monthly billing
- Show `/year` for annual billing with monthly equivalent
- Show savings badge: "Save $XX" on annual

---

## Phase 4: Visual Design

### 4.1 Billing Toggle Design
```text
+------------------------------------------+
|                                          |
|   [ Monthly ]  <==>  [ Annual ]          |
|                      Save up to 17%      |
|                                          |
+------------------------------------------+
```

### 4.2 Price Card with Annual Selected
```text
+---------------------------+
|     Researcher Lite       |
|                           |
|         $290              |
|        per year           |
|     ($24.17/month)        |
|                           |
|    [Save $58/year]        |
|                           |
+---------------------------+
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `supabase/migrations/` | Add billing_period column + new tier values |
| `src/pages/Pricing.tsx` | Rename to Subscriptions.tsx, add billing toggle, update tier structure |
| `src/App.tsx` | Update route from /pricing to /subscriptions |
| `src/components/Header.tsx` | Update nav link text |
| `src/hooks/useSubscription.ts` | Add new tier types |

---

## Implementation Order
1. Database migration (billing_period column + tier values)
2. Rename Pricing to Subscriptions and update routes
3. Add billing period state and toggle component
4. Update tier cards with dynamic pricing
5. Update feature comparison table for 5 tiers
6. Update FAQ section with billing questions
