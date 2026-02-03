
# Add Waitlist Signups to Admin Panel

## Overview
Create a new admin page to view all waitlist signups, making it easy to track who has signed up for early access and which subscription tier they selected.

## What You'll Get
- A new "Waitlist Signups" section in the admin sidebar
- A table showing all signups with their details (name, email, company, phone, interest, signup date)
- Total count of signups displayed
- Ability to see which subscription tier people selected (shown in the interest area field)

## Implementation Steps

### 1. Create WaitlistAdmin Page
Create a new page at `src/pages/admin/WaitlistAdmin.tsx` that:
- Fetches all entries from the `waitlist_signups` table
- Displays them in a sortable table with columns:
  - Full Name
  - Email
  - Company
  - Phone
  - Interest Area (includes tier selection)
  - Signed Up date
- Shows total signup count
- Has loading and empty states

### 2. Add to Admin Navigation
Update `src/pages/admin/AdminLayout.tsx` to add a "Waitlist" link in the sidebar under a new "User Management" section with a Users icon.

### 3. Add Route
Update `src/App.tsx` to add the `/admin/waitlist` route.

### 4. Dashboard Integration (Bonus)
Add a waitlist signups counter card to the admin dashboard so you can see the total at a glance.

## Technical Notes
- The RLS policy on `waitlist_signups` already allows admins to view all records
- The interest_area field contains tier info in format: `interest (Selected: Tier Name - billing)`
- No database changes needed - just UI additions
