# How to Revert to Previous Working Version

## Quick Solution: Promote Previous Deployment in Vercel

If you had a working version deployed at `https://waste-management-system-ckcmv6ox6.vercel.app/`, you can restore it:

### Option 1: Promote Previous Deployment (Easiest)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project "Waste-Management-System"
3. Click on **"Deployments"** tab
4. Find the deployment with URL `waste-management-system-ckcmv6ox6.vercel.app`
5. Click the **three dots (...)** menu next to it
6. Select **"Promote to Production"**
7. Your production URL will now use that working version

### Option 2: Redeploy from Git Commit

If you want to deploy a specific commit:

1. In Vercel Dashboard → Your Project → Settings
2. Go to **"Git"** section
3. Note your connected branch
4. Find the commit hash of your working version (likely `0293043`)
5. In Vercel Dashboard → Deployments → Click "Create Deployment"
6. Or simply push that commit to your main branch

### Option 3: Close This PR

If this PR introduced issues:

1. Go to GitHub PR page
2. Click **"Close pull request"**
3. Your production deployment will remain on the main branch (working version)
4. You can reopen or create a new PR later if needed

## Understanding What Changed

### Before This PR (Working Version)
- MongoDB connection was hardcoded in the code
- Frontend used hardcoded `localhost:3000` URLs
- No environment variable configuration
- But it was working on Vercel (possibly with hardcoded credentials)

### After This PR (Current State)
- MongoDB uses environment variables (requires MONGODB_URI to be set)
- Frontend uses `environment.apiUrl` that changes based on build
- Serverless API configuration for Vercel
- Requires proper Angular build configuration

## If You Want to Keep Improvements

The changes in this PR add:
- ✅ Security (no hardcoded credentials)
- ✅ Environment variable support
- ✅ Proper serverless architecture
- ✅ Better production/development separation

But require:
- Setting environment variables in Vercel
- Proper Angular production build configuration
- Vercel serverless function setup

## Troubleshooting Current Issues

If you want to make the new version work instead of reverting:

1. **Verify Environment Variables in Vercel**:
   - Go to Project Settings → Environment Variables
   - Ensure these are set:
     ```
     MONGODB_URI=your-mongodb-connection-string
     JWT_SECRET=your-jwt-secret
     EMAIL_USER=your-email
     EMAIL_PASS=your-email-app-password
     ```

2. **Ensure Fresh Deployment**:
   - Go to Deployments → Latest deployment → Redeploy
   - This ensures the latest code with all fixes is deployed

3. **Check Browser Console**:
   - After deployment, visit your site
   - Open Developer Tools (F12) → Console
   - Check what URL the API calls are going to
   - Should be `/api/user/login` not `localhost:3000`

## Need Help?

If you're unsure which path to take:
1. **Revert to working version** (Option 1 above) - safest, immediate fix
2. **Test the current branch** after proper deployment
3. **Compare what's different** between versions

The working version URL you mentioned suggests the app was deployed successfully before. The changes in this PR aimed to fix MongoDB connection issues you reported, but if the original was working, we may need to understand what the actual problem was.
