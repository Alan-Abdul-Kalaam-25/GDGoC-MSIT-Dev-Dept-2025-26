# 🚀 Deployment Connection Issues - SOLUTION GUIDE

## Problem Summary

Your frontends deployed on Vercel are **NOT connecting** to your backends on Render because:

### **Critical Issue in Todo-App:**

- ❌ **All API calls use relative paths** (e.g., `/api/tasks`)
- ❌ These resolve to Vercel's domain, NOT your Render backend
- ❌ Example: `fetch("/api/tasks")` → Points to `https://todoquest-todo-app.vercel.app/api/tasks` (doesn't exist!)

### **Quiz-App Status:**

- ✅ Correctly uses environment variable `VITE_API_BASE_URL`
- ✅ Should work once backend routes are verified

---

## ✅ SOLUTIONS APPLIED

### **1. Todo-App Frontend - FIXED** ✅

I've updated your Todo-App frontend to use a proper API utility that respects the environment variable:

#### Created: `/src/utils/api.js`

```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  // ... handles all API calls with correct base URL
};
```

#### Updated Files:

- ✅ `App.jsx` - All fetch calls now use `apiRequest()`
- ✅ `LoginForm.jsx` - Auth calls fixed
- ✅ `SettingsPage.jsx` - Settings API calls fixed
- ✅ `ProfilePage.jsx` - Profile API calls fixed

---

## 🔧 NEXT STEPS - ACTION REQUIRED

### **Step 1: Verify Environment Variables on Vercel**

#### For Todo-App:

1. Go to Vercel Dashboard → Your Todo-App project
2. Navigate to **Settings** → **Environment Variables**
3. Ensure you have:
   ```
   VITE_API_URL=https://todo-app-backend-xff6.onrender.com
   ```
4. ⚠️ **Important:** Must start with `VITE_` for Vite to expose it to the client

#### For Quiz-App:

1. Go to Vercel Dashboard → Your Quiz-App project
2. Navigate to **Settings** → **Environment Variables**
3. Ensure you have:
   ```
   VITE_API_BASE_URL=https://quiz-master-console-backend.onrender.com
   ```

### **Step 2: Redeploy on Vercel**

After adding/updating environment variables:

1. Go to **Deployments** tab
2. Click the **...** menu on the latest deployment
3. Select **Redeploy**
4. ✅ Check "Use existing Build Cache" (optional, faster)
5. Click **Redeploy**

**OR** push a new commit to trigger automatic deployment.

### **Step 3: Verify Backend CORS Settings**

Your backends already have CORS enabled with `app.use(cors())`, which allows all origins. This is fine for now but consider restricting it in production:

```javascript
// In your backend server.js (optional enhancement)
app.use(
  cors({
    origin: [
      "https://todoquest-todo-app.vercel.app",
      "https://quiz-master-app-henna.vercel.app",
      "http://localhost:5173", // for local development
    ],
    credentials: true,
  })
);
```

### **Step 4: Test Your Deployments**

After redeploying:

1. **Test Todo-App:**

   - Go to https://todoquest-todo-app.vercel.app/
   - Open Developer Tools (F12) → Console tab
   - Try to sign up/login
   - Check Network tab - API calls should go to `todo-app-backend-xff6.onrender.com`

2. **Test Quiz-App:**
   - Go to https://quiz-master-app-henna.vercel.app/
   - Enter username and select a category
   - Check Network tab - API calls should go to `quiz-master-console-backend.onrender.com`

---

## 🐛 Troubleshooting

### If Todo-App still doesn't work:

1. **Check browser console for errors:**

   - Press F12 → Console tab
   - Look for CORS errors or 404s

2. **Verify environment variable is loaded:**

   - Add this temporarily in `App.jsx`:
     ```javascript
     console.log("API URL:", import.meta.env.VITE_API_URL);
     ```
   - Should log: `https://todo-app-backend-xff6.onrender.com`

3. **Check Network requests:**
   - F12 → Network tab
   - Filter by "Fetch/XHR"
   - Click on any API request
   - Verify the URL includes your Render backend domain

### If Quiz-App doesn't work:

1. **Same debugging steps as above**
2. Check that `VITE_API_BASE_URL` is set (not `VITE_API_URL`)

### Common Issues:

#### ❌ "Failed to fetch" error

- **Cause:** Backend is sleeping on Render (free tier)
- **Solution:** Wait 30-60 seconds for backend to wake up, then retry

#### ❌ CORS errors

- **Cause:** Backend not allowing frontend domain
- **Solution:** Verify `cors()` is imported and used in backend

#### ❌ 404 Not Found on API endpoints

- **Cause:** Wrong API route or base URL
- **Solution:** Check that routes match between frontend and backend

---

## 📝 Environment Variable Naming Convention

**IMPORTANT:** Vite requires environment variables to start with `VITE_` to be exposed to the client-side code.

| ❌ Wrong            | ✅ Correct          |
| ------------------- | ------------------- |
| `API_URL`           | `VITE_API_URL`      |
| `REACT_APP_API_URL` | `VITE_API_URL`      |
| `API_BASE_URL`      | `VITE_API_BASE_URL` |

---

## ✅ Verification Checklist

Before considering this fixed, verify:

- [ ] Todo-App `.env` has `VITE_API_URL=https://todo-app-backend-xff6.onrender.com`
- [ ] Quiz-App `.env` has `VITE_API_BASE_URL=https://quiz-master-console-backend.onrender.com`
- [ ] Same environment variables added to Vercel dashboard
- [ ] Both apps redeployed on Vercel after adding env vars
- [ ] Can successfully login/signup on Todo-App
- [ ] Can successfully take a quiz on Quiz-App
- [ ] No CORS errors in browser console
- [ ] Network requests go to Render backend URLs (not Vercel)

---

## 🎯 Why This Fixes It

### Before:

```javascript
// ❌ This goes to Vercel domain
fetch("/api/tasks");
// → https://todoquest-todo-app.vercel.app/api/tasks (doesn't exist)
```

### After:

```javascript
// ✅ This goes to Render backend
apiRequest("/api/tasks");
// → https://todo-app-backend-xff6.onrender.com/api/tasks (works!)
```

---

## 📞 Need Help?

If you still face issues after following these steps:

1. Check the browser console for specific error messages
2. Verify the Network tab shows requests going to the correct backend URL
3. Test your backend directly by visiting:
   - https://todo-app-backend-xff6.onrender.com/
   - https://quiz-master-console-backend.onrender.com/

Both should show a JSON response confirming the API is running.

---

## 🚀 Final Notes

- The code changes I made are already saved to your local files
- You need to commit and push these changes to GitHub
- Vercel will automatically redeploy when you push
- Remember to add the environment variables in Vercel dashboard!

Good luck! 🎉
