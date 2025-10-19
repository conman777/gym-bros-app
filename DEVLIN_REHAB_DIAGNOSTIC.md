# Devlin Rehab Plan Diagnostic Guide

## Issue: Rehab Plan Not Showing

If you're not seeing the rehab plan when logged in as Devlin, follow these steps to diagnose and fix the issue.

---

## Quick Fix Steps

### 1. **Verify You're Logging in as "Devlin" (Not "ddevin")**

The user system recognizes two names:
- ✅ **"Conor"**
- ✅ **"Devlin"** ← This is the correct name

There is **no user named "ddevin"** in the system. Make sure you're clicking the **"DEVLIN"** button on the login page.

---

### 2. **Use the Diagnostic Tool**

I've created a diagnostic tool to check Devlin's rehab data:

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to the testing page:
   ```
   http://localhost:3000/testing
   ```

3. Click the **"Check Rehab Status"** button in the "Devlin Rehab Diagnostic" section

4. Review the diagnostic results:
   - ✅ **User Found** - Shows user info and rehab exercises
   - ❌ **User Not Found** - You need to log in as Devlin to create the user

---

### 3. **Check the Browser Console**

1. Open Developer Tools (F12 or Right-click → Inspect)
2. Go to the **Console** tab
3. Look for any error messages related to:
   - `/api/rehab` - The API endpoint for fetching rehab exercises
   - `/api/dashboard` - The main dashboard data
   - Any network errors (red text)

---

### 4. **Verify Database Setup**

If the diagnostic shows "User Not Found":

1. Log out (click the logout button in the dashboard header)
2. Return to the home page
3. Click the **"DEVLIN"** button
4. Wait for the setup process to complete (you'll see a progress indicator)
5. Once setup is complete, you should see the rehab section on the dashboard

---

## What Should You See?

When logged in as **Devlin**, the dashboard should show:

### 📱 **Rehabilitation Section** (Teal/Cyan gradient card)

Located below the "Quick Stats" section with:
- **Header:** "Shoulder Rehabilitation" with a heart icon
- **PDF Link:** Link to `/shoulder-rehab.pdf`
- **Manage Link:** Link to `/rehab/manage`
- **Progress Bar:** Shows completed vs. total exercises
- **Exercise List:** 13 predefined exercises organized by category:

  **Warm-up:**
  - Rowing (3-5 min)

  **Mobility & Stretching:**
  - Sleeper Stretch
  - Lat Dorsi Stretch on Bench
  - Pec Stretch (Doorway/Frame)
  - Shoulder Internal Rotation (Towel Behind Back)

  **Band / Dumbbell / Machine Strength:**
  - Shoulder External Rotation w/ Resistance Band
  - Abduction in Plane of Scapula
  - Shoulder External Rotation w/ Dumbbell
  - Horizontal Extension Prone w/ Dumbbell
  - Supported Bent-Over Row
  - Seated Low Row (Neutral Grip)
  - Dumbbell Hammer Curls
  - Triceps Cable Pulldown (Standing)

---

## Common Issues & Solutions

### ❌ **"User Not Found"**
**Solution:** Log in as "Devlin" (not "ddevin") on the home page

### ❌ **"No rehab exercises yet"**
**Solution:** The setup didn't complete. Try:
1. Log out and log back in as Devlin
2. Wait for the setup progress to complete (watch for the progress modal)
3. If it still doesn't work, check the browser console for errors

### ❌ **"Setup Complete: No"**
**Solution:** The background job didn't finish. Try:
1. Wait a few seconds and refresh the page
2. If it's still not complete, check the console for errors

### ❌ **Rehab section not visible on dashboard**
**Possible causes:**
1. You're logged in as "Conor" instead of "Devlin"
2. The `user.name` in the database is incorrect (check with diagnostic tool)
3. JavaScript error preventing render (check console)

---

## Direct API Testing

You can also test the diagnostic API directly:

1. Ensure you're logged in as Devlin
2. Open a new tab and navigate to:
   ```
   http://localhost:3000/api/diagnostic/devlin
   ```

3. You should see a JSON response with:
   ```json
   {
     "status": "SUCCESS",
     "devlinUser": {
       "name": "Devlin",
       "setupComplete": true,
       "rehabExercisesCount": 13,
       ...
     },
     ...
   }
   ```

If you see `"status": "NOT_FOUND"`, the Devlin user doesn't exist in the database.

---

## Code References

If you want to investigate the code:

- **Dashboard (shows rehab section):** `src/app/dashboard/page.tsx:406`
- **Rehab condition check:** `src/app/dashboard/page.tsx:76` and `406`
- **Rehab API endpoint:** `src/app/api/rehab/route.ts`
- **User creation:** `src/app/api/auth/route.ts:28`
- **Demo rehab data:** `src/lib/demo-data.ts:313-435`

---

## Need More Help?

If the issue persists after following these steps:

1. Run the diagnostic tool and take a screenshot
2. Check the browser console and copy any error messages
3. Provide:
   - The diagnostic results
   - Any console errors
   - Steps you've already tried

---

**Last Updated:** 2025-10-19
