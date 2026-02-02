
# Update Contact Email & About Page Plan

## Overview
Two changes: update API User-Agent headers in edge functions to use the new contact email, and restructure the About page to show Rangsimatiti as the sole Founder & CEO.

---

## Changes Summary

### 1. Edge Functions - User-Agent Headers

**Files to update:**
- `supabase/functions/ai-property-lookup/index.ts` (line 178-179)
- `supabase/functions/ai-bibliography-search/index.ts` (line 175)

**Current:**
```javascript
'User-Agent': 'MaterialInk/1.0 (mailto:research@materialink.io)'
```

**Updated:**
```javascript
'User-Agent': 'MaterialInk/1.0 (mailto:rangsimatiti.b.s@gmail.com)'
```

---

### 2. About Page - Team Restructure

**File:** `src/pages/About.tsx`

**Current team (3 members):**
1. Alex Joseph - Co-Founder
2. Rangsimatiti Binda Saichompoo - Co-Founder  
3. Dr. Holger Warth - Technology & Innovation Advisor

**Updated team (2 members):**
1. **Rangsimatiti Binda Saichompoo** - Founder & CEO
2. **Dr. Holger Warth** - Technology & Innovation Advisor (unchanged)

**Changes:**
- Remove Alex Joseph from the `teamMembers` array
- Update Rangsimatiti's role from "Co-Founder" to "Founder & CEO"
- Remove the unused `alexPhoto` import
- Adjust grid layout (2 cards will center nicely with `md:grid-cols-2`)

---

## Files to Modify

| File | Changes |
|------|---------|
| `supabase/functions/ai-property-lookup/index.ts` | Update User-Agent email |
| `supabase/functions/ai-bibliography-search/index.ts` | Update User-Agent email |
| `src/pages/About.tsx` | Remove Alex, update Rangsimatiti's role to "Founder & CEO" |
