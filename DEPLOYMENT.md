# Deployment Guide for WasteWise

This guide will help you deploy the WasteWise application to Vercel with MongoDB Atlas.

## Prerequisites

1. **MongoDB Atlas Account**: Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. **Vercel Account**: Create a free account at [Vercel](https://vercel.com)
3. **Gmail Account** (for email notifications): Set up an App Password for your Gmail account

## Step 1: Set up MongoDB Atlas

1. Log in to your MongoDB Atlas account
2. Create a new cluster (or use an existing one)
3. Click "Connect" on your cluster
4. Select "Connect your application"
5. Copy the connection string (it should look like: `mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority`)
6. Make sure to replace `<password>` with your actual database password

### Configure Database Access
1. Go to "Database Access" in the left sidebar
2. Add a new database user with a strong password
3. Note down the username and password

### Configure Network Access
1. Go to "Network Access" in the left sidebar
2. Click "Add IP Address"
3. Select "Allow Access from Anywhere" (0.0.0.0/0) for Vercel deployment
4. Click "Confirm"

## Step 2: Set up Gmail App Password

1. Go to your Google Account settings
2. Navigate to Security → 2-Step Verification (enable it if not already enabled)
3. Scroll down to "App passwords"
4. Generate a new app password for "Mail"
5. Copy the 16-character password (remove spaces)

## Step 3: Deploy to Vercel

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. Log in to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure your project:
   - **Framework Preset**: Other
   - **Build Command**: `npm run vercel-build`
   - **Output Directory**: `dist/assignment/browser`
   - **Install Command**: `npm install`

5. Add Environment Variables (click "Environment Variables"):
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority&appName=YourApp
   JWT_SECRET=your-super-secret-jwt-key-change-this-to-something-random
   EMAIL_SERVICE=Gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-16-char-app-password
   FRONTEND_URL=https://your-app-name.vercel.app
   BACKEND_URL=https://your-app-name.vercel.app
   NODE_ENV=production
   ```

6. Click "Deploy"

### Option 2: Deploy via Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Run deployment:
   ```bash
   vercel
   ```

3. Follow the prompts to link your project

4. Add environment variables:
   ```bash
   vercel env add MONGODB_URI
   vercel env add JWT_SECRET
   vercel env add EMAIL_SERVICE
   vercel env add EMAIL_USER
   vercel env add EMAIL_PASSWORD
   vercel env add FRONTEND_URL
   vercel env add BACKEND_URL
   vercel env add NODE_ENV
   ```

## Step 4: Update Environment Variables

After your first deployment, you'll get a Vercel URL (e.g., `https://your-app-name.vercel.app`).

Update these environment variables in Vercel:
- `FRONTEND_URL`: `https://your-app-name.vercel.app`
- `BACKEND_URL`: `https://your-app-name.vercel.app`

Then redeploy your application.

## Step 5: Verify Deployment

1. Visit your Vercel URL
2. Try to register a new user
3. Check your email for the verification link
4. Verify that you can log in after verification
5. Test the main features of the application

## Troubleshooting

### MongoDB Connection Issues

**Problem**: "Connection failed" error in logs

**Solutions**:
1. Verify your MongoDB connection string is correct
2. Ensure your database user has the correct permissions
3. Check that Network Access allows connections from anywhere (0.0.0.0/0)
4. Make sure you replaced `<password>` in the connection string with your actual password
5. Verify the database name in the connection string

### Email Verification Not Working

**Problem**: Verification emails not being sent

**Solutions**:
1. Verify your Gmail App Password is correct (16 characters, no spaces)
2. Ensure 2-Step Verification is enabled on your Google account
3. Check that `EMAIL_USER` and `EMAIL_PASSWORD` environment variables are set correctly
4. Try creating a new App Password

### CORS Errors

**Problem**: CORS errors in the browser console

**Solutions**:
1. Verify `FRONTEND_URL` environment variable matches your Vercel deployment URL
2. Ensure no trailing slashes in the URL
3. Check that your Vercel deployment includes the CORS middleware

### Build Failures

**Problem**: Vercel build fails

**Solutions**:
1. Check the build logs in Vercel dashboard
2. Verify all dependencies are listed in `package.json`
3. Ensure `vercel-build` script exists in `package.json`
4. Try building locally first: `npm run build`

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/...` |
| `JWT_SECRET` | Secret key for JWT token generation | `your-random-secret-key` |
| `EMAIL_SERVICE` | Email service provider | `Gmail` |
| `EMAIL_USER` | Your email address | `your-email@gmail.com` |
| `EMAIL_PASSWORD` | Gmail App Password | `abcd efgh ijkl mnop` |
| `FRONTEND_URL` | Your Vercel app URL | `https://your-app.vercel.app` |
| `BACKEND_URL` | Your Vercel app URL (same as frontend) | `https://your-app.vercel.app` |
| `NODE_ENV` | Environment mode | `production` |

## Local Development

To run the application locally with environment variables:

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your local environment variables in `.env`

3. Start the backend:
   ```bash
   npm run backend
   ```

4. In a separate terminal, start the frontend:
   ```bash
   npm start
   ```

5. Visit `http://localhost:4200`

## Security Notes

- **Never commit your `.env` file** - it's already in `.gitignore`
- Change the default JWT secret to a strong random string
- Use strong passwords for your MongoDB database
- Regularly rotate your credentials
- Monitor your Vercel and MongoDB Atlas usage

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Gmail App Passwords Guide](https://support.google.com/accounts/answer/185833)

## Support

If you encounter issues:
1. Check the Vercel deployment logs
2. Verify all environment variables are set correctly
3. Test your MongoDB connection string separately
4. Ensure your MongoDB Atlas network access is configured correctly
