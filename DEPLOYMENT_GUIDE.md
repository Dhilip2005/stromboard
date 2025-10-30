# 🚀 Stromboard Deployment Guide

Complete guide to deploy your collaborative whiteboard application online.

---

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Backend Deployment (Railway/Render)](#backend-deployment)
3. [Frontend Deployment (Vercel/Netlify)](#frontend-deployment)
4. [Environment Configuration](#environment-configuration)
5. [Testing Your Deployment](#testing)
6. [Troubleshooting](#troubleshooting)

---

## 🔧 Prerequisites

Before deploying, ensure you have:
- ✅ GitHub account
- ✅ MongoDB Atlas account (already configured)
- ✅ Git installed locally
- ✅ Both frontend and backend working locally

---

## 🖥️ Backend Deployment

### Option 1: Railway (Recommended - Free Tier Available)

#### Step 1: Prepare Your Backend
```bash
cd backend
# Ensure package.json has start script
# "start": "node index.js"
```

#### Step 2: Create Railway Account
1. Go to [Railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Connect your GitHub account and select your repository
6. Choose the `backend` folder

#### Step 3: Configure Environment Variables
In Railway dashboard:
1. Go to your project → Variables
2. Add these variables:
   ```
   PORT=5000
   MONGO_URI=mongodb+srv://dhilip_02:Dhilip2005p@cluster0.wetcol6.mongodb.net/
   NODE_ENV=production
   ```

#### Step 4: Configure CORS
Update `backend/index.js` before deployment:
```javascript
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3000', 'https://your-frontend-domain.vercel.app'], 
    methods: ['GET', 'POST'],
    credentials: true
  },
});

app.use(cors({
  origin: ['http://localhost:3000', 'https://your-frontend-domain.vercel.app'],
  credentials: true
}));
```

#### Step 5: Deploy
Railway will automatically deploy when you push to GitHub!

**Your Backend URL:** `https://your-app-name.railway.app`

---

### Option 2: Render (Alternative Free Option)

#### Step 1: Create Render Account
1. Go to [Render.com](https://render.com)
2. Sign up with GitHub
3. Click "New +" → "Web Service"
4. Connect your repository

#### Step 2: Configure Service
- **Name:** stromboard-backend
- **Environment:** Node
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Plan:** Free

#### Step 3: Environment Variables
Add in Render dashboard:
```
PORT=5000
MONGO_URI=mongodb+srv://dhilip_02:Dhilip2005p@cluster0.wetcol6.mongodb.net/
NODE_ENV=production
```

#### Step 4: Deploy
Click "Create Web Service" - Render will build and deploy!

**Your Backend URL:** `https://stromboard-backend.onrender.com`

---

## 🌐 Frontend Deployment

### Option 1: Vercel (Recommended)

#### Step 1: Update Socket.IO Connection
Update `frontend/session.js`:
```javascript
// Change this line:
socket = io('http://localhost:5000');

// To your production backend URL:
socket = io('https://your-backend-url.railway.app');
```

#### Step 2: Create Vercel Account
1. Go to [Vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click "Add New..." → "Project"
4. Import your repository
5. Configure:
   - **Framework Preset:** Other
   - **Root Directory:** `frontend`
   - **Build Command:** Leave empty (static site)
   - **Output Directory:** `.` (current directory)

#### Step 3: Deploy
Click "Deploy" - Vercel will deploy in seconds!

**Your Frontend URL:** `https://stromboard.vercel.app`

---

### Option 2: Netlify (Alternative)

#### Step 1: Update Socket Connection
Same as Vercel - update `session.js` with production backend URL.

#### Step 2: Create Netlify Account
1. Go to [Netlify.com](https://netlify.com)
2. Sign up with GitHub
3. Click "Add new site" → "Import from Git"
4. Choose your repository

#### Step 3: Configure Build
- **Base directory:** `frontend`
- **Build command:** Leave empty
- **Publish directory:** `.`

#### Step 4: Deploy
Click "Deploy site" - Done!

**Your Frontend URL:** `https://stromboard.netlify.app`

---

## ⚙️ Environment Configuration

### MongoDB Atlas Whitelist
1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Navigate to Network Access
3. Click "Add IP Address"
4. Select "Allow Access from Anywhere" (0.0.0.0/0)
   - **Note:** For production, restrict to your backend server IP only!

### Update Backend CORS (Important!)
After deploying frontend, update `backend/index.js`:

```javascript
const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:3000',
      'https://stromboard.vercel.app',  // Your Vercel domain
      'https://your-custom-domain.com'   // If you have one
    ],
    methods: ['GET', 'POST'],
    credentials: true
  },
});

app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://stromboard.vercel.app',
    'https://your-custom-domain.com'
  ],
  credentials: true
}));
```

**Commit and push** - Railway/Render will auto-redeploy!

---

## 🧪 Testing Your Deployment

### 1. Test Backend Health
Visit: `https://your-backend-url.railway.app/api/health`

Should return:
```json
{
  "status": "OK",
  "message": "Stromboard backend is running!"
}
```

### 2. Test Real-Time Collaboration
1. Open your frontend URL: `https://stromboard.vercel.app`
2. Login with email/Google
3. Click "Create Session"
4. **Open the same session URL in another browser/incognito tab**
5. Draw in one tab - it should appear in the other tab in real-time!

### 3. Check Browser Console
Open DevTools (F12) → Console:
- ✅ Should see: `Connected to Socket.IO server`
- ✅ Should see: `Active users: [...]`
- ❌ Should NOT see CORS errors

---

## 🐛 Troubleshooting

### Issue: CORS Errors
**Symptom:** `Access to XMLHttpRequest blocked by CORS policy`

**Solution:**
1. Verify frontend URL is added to backend CORS config
2. Push changes to trigger redeploy
3. Clear browser cache and hard refresh (Ctrl+Shift+R)

---

### Issue: Socket.IO Not Connecting
**Symptom:** `ERR_CONNECTION_REFUSED` or timeout

**Solution:**
1. Check backend is running: Visit `/api/health` endpoint
2. Verify Socket.IO URL in `session.js` is correct (HTTPS, not HTTP)
3. Check backend logs for errors

---

### Issue: MongoDB Connection Failed
**Symptom:** `MongoNetworkError` in backend logs

**Solution:**
1. Verify MONGO_URI is set correctly in environment variables
2. Check MongoDB Atlas Network Access whitelist
3. Ensure database user credentials are correct

---

### Issue: Drawing Not Syncing Between Users
**Symptom:** Multiple tabs don't see each other's drawings

**Solution:**
1. Open browser console - check for Socket errors
2. Verify both users joined the same `roomId`
3. Check backend logs to see if `draw-action` events are being received
4. Ensure `sessionId` is being passed correctly in all socket emissions

---

### Issue: "Module not found" on Deployment
**Symptom:** Build fails with missing module error

**Solution:**
1. Verify `package.json` includes all dependencies
2. Run `npm install` locally to update package-lock.json
3. Commit both `package.json` and `package-lock.json`
4. Push to trigger redeploy

---

## 🎯 Quick Deployment Checklist

### Before Deploying:
- [ ] Test locally: Frontend on :3000, Backend on :5000
- [ ] Verify Socket.IO connection works locally
- [ ] Commit all changes to GitHub
- [ ] MongoDB Atlas allows connections from anywhere (0.0.0.0/0)

### Backend Deployment:
- [ ] Deploy to Railway/Render
- [ ] Set environment variables (PORT, MONGO_URI, NODE_ENV)
- [ ] Test health endpoint
- [ ] Note backend URL

### Frontend Deployment:
- [ ] Update `session.js` with production backend URL
- [ ] Commit and push changes
- [ ] Deploy to Vercel/Netlify
- [ ] Note frontend URL

### Final Configuration:
- [ ] Update backend CORS with frontend URL
- [ ] Redeploy backend
- [ ] Test in two browsers - verify real-time sync
- [ ] Test login flow
- [ ] Test all drawing tools
- [ ] Share and celebrate! 🎉

---

## 📞 Support

If you encounter issues:
1. Check browser console (F12)
2. Check backend logs in Railway/Render dashboard
3. Verify all URLs are using HTTPS (not HTTP)
4. Ensure environment variables are set correctly

---

## 🔗 Useful Links

- [Railway Documentation](https://docs.railway.app)
- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Netlify Documentation](https://docs.netlify.com)
- [Socket.IO Documentation](https://socket.io/docs/v4/)
- [MongoDB Atlas](https://cloud.mongodb.com)

---

**Made with ❤️ for Stromboard**

*Last updated: 2024*
