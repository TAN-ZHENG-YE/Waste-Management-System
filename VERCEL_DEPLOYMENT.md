# Vercel Deployment Guide for Waste Management System

## Prerequisites

1. A MongoDB Atlas account with a cluster set up
2. A Vercel account
3. Gmail account with App Password enabled (for email functionality)

## Step 1: Prepare MongoDB Connection

1. Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Navigate to your cluster
3. Click "Connect" → "Connect your application"
4. Copy your connection string (it should look like: `mongodb+srv://username:password@cluster.mongodb.net/database`)
5. Replace `<password>` with your actual database password
6. Keep this connection string secure - you'll need it for Vercel

## Step 2: Set Up Gmail App Password

1. Go to your [Google Account Security Settings](https://myaccount.google.com/security)
2. Enable 2-Step Verification if not already enabled
3. Go to "App passwords" (search for it in settings)
4. Generate a new app password for "Mail"
5. Copy the 16-character password (without spaces)

## Step 3: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. Go to [Vercel](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your GitHub repository
4. Before clicking "Deploy", go to "Environment Variables"
5. Add the following environment variables:

   ```
   MONGODB_URI=your-mongodb-connection-string
   JWT_SECRET=your-secure-random-string-at-least-32-characters
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-gmail-app-password
   FRONTEND_URL=https://your-vercel-app.vercel.app
   BACKEND_URL=https://your-vercel-app.vercel.app
   ```

6. Click "Deploy"

### Option B: Deploy via Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Run deployment:
   ```bash
   vercel
   ```

4. Add environment variables via CLI:
   ```bash
   vercel env add MONGODB_URI
   vercel env add JWT_SECRET
   vercel env add EMAIL_USER
   vercel env add EMAIL_PASS
   vercel env add FRONTEND_URL
   vercel env add BACKEND_URL
   ```

## Step 4: Update Environment Variables

After initial deployment, you'll get your Vercel URL (e.g., `https://your-app.vercel.app`). Update these environment variables:

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Update:
   - `FRONTEND_URL` to your Vercel app URL
   - `BACKEND_URL` to your Vercel app URL
4. Redeploy for changes to take effect

## Step 5: Test Your Deployment

1. Visit your Vercel URL
2. Try registering a new user
3. Check if email verification works
4. Test login functionality
5. Verify database connections by creating data

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `JWT_SECRET` | Secret key for JWT tokens | `a-very-long-random-string-here` |
| `EMAIL_USER` | Gmail address for sending emails | `your-email@gmail.com` |
| `EMAIL_PASS` | Gmail App Password | `abcd efgh ijkl mnop` |
| `FRONTEND_URL` | Your frontend URL | `https://your-app.vercel.app` |
| `BACKEND_URL` | Your backend URL | `https://your-app.vercel.app` |

## Troubleshooting

### Database Connection Issues

If you see "connection failed" in Vercel logs:

1. Verify your MongoDB connection string is correct
2. Ensure your MongoDB Atlas cluster allows connections from anywhere (0.0.0.0/0)
3. Check that your database user has proper permissions
4. Verify the `MONGODB_URI` environment variable is set correctly in Vercel

### Email Not Sending

1. Verify `EMAIL_USER` and `EMAIL_PASS` are set correctly
2. Ensure you're using a Gmail App Password, not your regular password
3. Check Vercel function logs for email errors

### CORS Issues

The application is configured to accept requests from:
- `http://localhost:4200` (development)
- Your `FRONTEND_URL` (production)
- Any `*.vercel.app` domain

If you still have CORS issues, check that your frontend is making requests to the correct backend URL.

## Security Notes

1. **Never commit `.env` file** - It's already in `.gitignore`
2. **Use strong JWT_SECRET** - Generate using: `openssl rand -base64 32`
3. **MongoDB Network Access** - Consider restricting to specific IPs in production
4. **Rotate secrets regularly** - Update passwords and secrets periodically

## Local Development

For local development:

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your local values:
   ```
   MONGODB_URI=your-local-or-atlas-mongodb-uri
   JWT_SECRET=local-dev-secret
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   FRONTEND_URL=http://localhost:4200
   BACKEND_URL=http://localhost:3000
   PORT=3000
   ```

3. Run the application:
   ```bash
   npm run backend  # Start backend
   npm start        # Start frontend in another terminal
   ```

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Gmail App Passwords Guide](https://support.google.com/accounts/answer/185833)
