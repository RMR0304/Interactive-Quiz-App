# Deployment Guide - Quiz App

This guide covers deploying the Quiz App to production.

## Prerequisites

- GitHub account (for code hosting)
- MongoDB Atlas account (free tier available)
- Render/Railway account (for backend)
- Vercel/Netlify account (for frontend)

---

## Step 1: MongoDB Atlas Setup (Cloud Database)

1. **Create MongoDB Atlas Account**
   - Go to https://www.mongodb.com/cloud/atlas
   - Sign up for free account

2. **Create a Cluster**
   - Click "Build a Database"
   - Choose FREE tier (M0)
   - Select cloud provider and region
   - Click "Create"

3. **Create Database User**
   - Go to "Database Access"
   - Click "Add New Database User"
   - Username: `quizapp` (or your choice)
   - Password: Generate secure password (save it!)
   - Database User Privileges: "Atlas admin" or "Read and write to any database"
   - Click "Add User"

4. **Whitelist IP Address**
   - Go to "Network Access"
   - Click "Add IP Address"
   - For development: Click "Allow Access from Anywhere" (0.0.0.0/0)
   - For production: Add your server IPs only (more secure)

5. **Get Connection String**
   - Go to "Database" → Click "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with `quiz_app` (or your choice)
   - Example: `mongodb+srv://quizapp:yourpassword@cluster0.xxxxx.mongodb.net/quiz_app?retryWrites=true&w=majority`

---

## Step 2: Backend Deployment (Render/Railway)

### Option A: Render (Recommended)

1. **Create Render Account**
   - Go to https://render.com
   - Sign up with GitHub

2. **Create New Web Service**
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Select the repository

3. **Configure Service**
   - **Name**: `quiz-app-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm run start`
   - **Root Directory**: Leave empty (or set to `backend` if needed)

4. **Environment Variables**
   Add these in Render dashboard:
   ```
   PORT=5000
   MONGO_URI=<your-mongodb-atlas-connection-string>
   JWT_SECRET=<generate-a-strong-random-secret>
   JWT_EXPIRES_IN=1d
   CORS_ORIGIN=https://your-frontend-domain.vercel.app
   NODE_ENV=production
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Note the URL (e.g., `https://quiz-app-backend.onrender.com`)

### Option B: Railway

1. **Create Railway Account**
   - Go to https://railway.app
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Select your repository

3. **Configure Service**
   - Railway auto-detects Node.js
   - Set **Root Directory**: `backend`
   - Set **Start Command**: `npm run start`

4. **Environment Variables**
   Add in Railway dashboard (same as Render above)

5. **Deploy**
   - Railway auto-deploys on push
   - Get your URL from dashboard

---

## Step 3: Frontend Deployment (Vercel/Netlify)

### Option A: Vercel (Recommended)

1. **Create Vercel Account**
   - Go to https://vercel.com
   - Sign up with GitHub

2. **Import Project**
   - Click "Add New" → "Project"
   - Import your GitHub repository

3. **Configure Project**
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. **Environment Variables**
   Add in Vercel dashboard:
   ```
   VITE_API_URL=https://your-backend-url.onrender.com
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Get your URL (e.g., `https://quiz-app.vercel.app`)

6. **Update Backend CORS**
   - Go back to Render/Railway
   - Update `CORS_ORIGIN` to your Vercel URL
   - Redeploy backend

### Option B: Netlify

1. **Create Netlify Account**
   - Go to https://netlify.com
   - Sign up with GitHub

2. **Add New Site**
   - Click "Add new site" → "Import an existing project"
   - Connect GitHub repository

3. **Build Settings**
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`

4. **Environment Variables**
   Add in Netlify dashboard:
   ```
   VITE_API_URL=https://your-backend-url.onrender.com
   ```

5. **Deploy**
   - Click "Deploy site"
   - Wait for build
   - Get your URL

---

## Step 4: Update Configuration Files

### Backend: Update CORS in production

The backend already supports CORS configuration via environment variable. Make sure `CORS_ORIGIN` in your deployment platform matches your frontend URL.

### Frontend: Update API URL

The frontend uses `VITE_API_URL` environment variable. Set this in your frontend deployment platform to your backend URL.

---

## Step 5: Seed Production Database

After deployment, you can seed the database:

### Option 1: Local Script (Recommended)

1. Update your local `.env` file with production MongoDB URI:
   ```
   MONGO_URI=<your-mongodb-atlas-connection-string>
   ```

2. Run seed script:
   ```bash
   cd backend
   npm run seed
   ```

### Option 2: Create Admin via API

Use the signup endpoint to create an admin:
```bash
curl -X POST https://your-backend-url.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin",
    "email": "admin@example.com",
    "password": "securepassword123",
    "role": "admin"
  }'
```

---

## Step 6: Verify Deployment

1. **Test Backend**
   ```bash
   curl https://your-backend-url.onrender.com/api/health
   ```
   Should return: `{"status":"ok"}`

2. **Test Frontend**
   - Visit your frontend URL
   - Try logging in with seeded credentials

3. **Test Admin Access**
   - Login as admin
   - Access `/admin` route
   - Verify you can see all users

---

## Environment Variables Summary

### Backend (.env)
```env
PORT=5000
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/quiz_app
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=1d
CORS_ORIGIN=https://your-frontend.vercel.app
NODE_ENV=production
```

### Frontend (.env)
```env
VITE_API_URL=https://your-backend.onrender.com
```

---

## Troubleshooting

### Backend Issues

1. **MongoDB Connection Failed**
   - Check MongoDB Atlas IP whitelist
   - Verify connection string has correct password
   - Check network access settings

2. **CORS Errors**
   - Verify `CORS_ORIGIN` matches frontend URL exactly
   - Include protocol (https://)
   - No trailing slash

3. **Build Fails**
   - Check Node.js version (should be 18+)
   - Verify all dependencies in package.json
   - Check build logs for errors

### Frontend Issues

1. **API Calls Fail**
   - Verify `VITE_API_URL` is set correctly
   - Check browser console for CORS errors
   - Ensure backend is running

2. **Build Fails**
   - Check Node.js version
   - Verify all dependencies
   - Check build logs

---

## Security Checklist

- [ ] Use strong JWT_SECRET (random string, 32+ characters)
- [ ] MongoDB Atlas IP whitelist configured
- [ ] Database user has appropriate permissions
- [ ] CORS_ORIGIN set to specific frontend URL (not *)
- [ ] Environment variables not committed to git
- [ ] HTTPS enabled (automatic on Vercel/Netlify/Render)

---

## Quick Deploy Commands

### Render (Backend)
```bash
# Already configured via dashboard
# Just push to GitHub and Render auto-deploys
```

### Vercel (Frontend)
```bash
cd frontend
npm install -g vercel
vercel
# Follow prompts
```

---

## Post-Deployment

1. **Seed Database**: Run seed script with production MongoDB URI
2. **Test All Features**: Login, signup, create quiz, take quiz
3. **Monitor Logs**: Check deployment platform logs for errors
4. **Update Documentation**: Note your production URLs

---

## Support

If you encounter issues:
1. Check deployment platform logs
2. Verify environment variables
3. Test API endpoints directly
4. Check MongoDB Atlas connection
5. Review browser console for frontend errors

