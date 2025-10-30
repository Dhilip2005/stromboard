# 🚀 STROMBOARD - Complete Startup Guide

## ✅ System Status

- ✅ **MongoDB:** Connected to Atlas Cloud Database
- ✅ **Backend:** Configured and ready (Port 5000)
- ✅ **Frontend:** Configured and ready (Port 3000)
- ✅ **Authentication:** JWT-based auth system ready
- ✅ **WebSocket:** Real-time collaboration ready

---

## 🎯 QUICK START (Easiest Method)

### Option 1: One-Click Startup (Recommended)

1. **Double-click** the file: `START_ALL.bat`
2. Wait for all servers to start
3. Your browser will automatically open the app!

That's it! Everything will start automatically.

---

## 📋 MANUAL STARTUP (Step-by-Step)

### Step 1: Start Backend Server

Open a terminal and run:

```bash
cd "c:\Users\manoj\OneDrive\Desktop\wc1\white board collaberation\white board collaberation\backend"
npm start
```

**You should see:**
```
Server is running on port 5000 and bound to 0.0.0.0
MongoDB Connected...
```

✅ Backend is now running at: **http://localhost:5000**

---

### Step 2: Start Frontend Server

Open a **NEW** terminal and run:

```bash
cd "c:\Users\manoj\OneDrive\Desktop\wc1\white board collaberation\white board collaberation\frontend"
npm start
```

**You should see:**
```
[Browsersync] Access URLs:
    Local: http://localhost:3000
```

✅ Frontend is now running at: **http://localhost:3000**

---

### Step 3: Open the Application

Open your browser and go to:
```
http://localhost:3000
```

---

## 🔌 System Architecture

```
┌─────────────────────────────────────────────────┐
│                   BROWSER                        │
│         http://localhost:3000                   │
└────────────┬────────────────────────────────────┘
             │
             ├─── HTTP Requests (REST API)
             │    ├─ POST /api/auth/register
             │    ├─ POST /api/auth/login
             │    ├─ GET  /api/sessions
             │    └─ POST /api/sessions
             │
             └─── WebSocket (Real-time)
                  └─ Socket.IO Connection
                     ├─ join-session
                     ├─ draw-data
                     ├─ users-update
                     └─ canvas-state
                     
┌─────────────────────────────────────────────────┐
│              BACKEND SERVER                      │
│         http://localhost:5000                   │
│                                                  │
│  ├─ Express.js (REST API)                       │
│  ├─ Socket.IO (WebSocket)                       │
│  └─ JWT Authentication                          │
└────────────┬────────────────────────────────────┘
             │
             │ Mongoose ORM
             ↓
┌─────────────────────────────────────────────────┐
│              MONGODB ATLAS                       │
│   mongodb+srv://cluster0.wetcol6.mongodb.net/   │
│                                                  │
│  Collections:                                   │
│  ├─ users (Authentication)                      │
│  └─ sessions (Whiteboard Data)                  │
└─────────────────────────────────────────────────┘
```

---

## 🌐 Available Endpoints

### Backend API (Port 5000)

#### Health Check
- **GET** `http://localhost:5000/api/health`
- **GET** `http://localhost:5000/api/ping`

#### Authentication
- **POST** `http://localhost:5000/api/auth/register`
  ```json
  {
    "name": "Your Name",
    "email": "your@email.com",
    "password": "yourpassword"
  }
  ```

- **POST** `http://localhost:5000/api/auth/login`
  ```json
  {
    "email": "your@email.com",
    "password": "yourpassword"
  }
  ```

#### Sessions
- **GET** `http://localhost:5000/api/sessions` - List all sessions
- **POST** `http://localhost:5000/api/sessions` - Create new session
  ```json
  {
    "sessionName": "My Whiteboard Session"
  }
  ```
- **GET** `http://localhost:5000/api/sessions/:id` - Get session by ID

---

## 👥 Test User Credentials

Two sample users are already created in your database:

### User 1
- **Email:** `john@example.com`
- **Password:** `password123`

### User 2
- **Email:** `jane@example.com`
- **Password:** `password123`

---

## 🛠️ Useful Commands

### Backend Commands
```bash
# Start backend server
npm start

# Start backend with auto-reload (development)
npm run dev

# View MongoDB data
npm run view-db

# Add sample data
npm run add-sample-data

# Test authentication
npm run test-auth
```

### Frontend Commands
```bash
# Start frontend server
npm start
```

---

## 🗄️ MongoDB Atlas Access

### View Your Data Online:

1. Go to: https://cloud.mongodb.com/
2. Login with your MongoDB Atlas credentials
3. Click on **"Cluster0"**
4. Click **"Browse Collections"**
5. Select database: **"test"**
6. View collections:
   - **users** - All registered users
   - **sessions** - All whiteboard sessions

### View Data Locally:

Run this command in the backend folder:
```bash
npm run view-db
```

---

## 📝 How to Use the Application

### 1. Create a Session
1. Open http://localhost:3000
2. Click **"CREATE SESSION"**
3. Enter session name and your name
4. Click Create
5. You'll be taken to the whiteboard

### 2. Join a Session
1. Open http://localhost:3000
2. Click **"JOIN SESSION"**
3. Enter the Room ID (shared by session creator)
4. Enter your name
5. Click Join
6. You'll join the collaborative whiteboard

### 3. Collaborate in Real-Time
- Draw on the canvas
- See other users' drawings in real-time
- Use different tools (pen, highlighter, shapes)
- Change colors and brush sizes
- Auto-saves to MongoDB

---

## 🔍 Testing the Connection

### Test Backend Health:
```bash
curl http://localhost:5000/api/health
```

### Test Frontend Access:
Open browser: http://localhost:3000

### Test MongoDB Connection:
```bash
cd backend
npm run view-db
```

---

## 🐛 Troubleshooting

### Backend won't start:
- Make sure port 5000 is not in use
- Check MongoDB connection string in `.env`
- Run `npm install` in the backend folder

### Frontend won't start:
- Make sure port 3000 is not in use
- Run `npm install` in the frontend folder
- Check if `lite-server` is installed

### Can't connect to MongoDB:
- Check internet connection (Atlas is cloud-based)
- Verify MongoDB URI in `.env` file
- Check if IP address is whitelisted in Atlas

### WebSocket not connecting:
- Make sure backend is running
- Check browser console for errors
- Verify Socket.IO library is loaded

---

## 🛑 How to Stop Everything

### Method 1: Close Terminal Windows
- Close the backend terminal window
- Close the frontend terminal window

### Method 2: Press Ctrl+C
- In backend terminal: Press `Ctrl+C`
- In frontend terminal: Press `Ctrl+C`

---

## 📦 Project Structure

```
white board collaberation/
├── backend/
│   ├── index.js              # Main server file
│   ├── .env                  # MongoDB connection
│   ├── package.json          # Dependencies
│   ├── controllers/
│   │   └── authController.js # Authentication logic
│   ├── module/
│   │   ├── user.js          # Session model
│   │   └── userModel.js     # User model
│   ├── route/
│   │   ├── authRoute.js     # Auth routes
│   │   └── userRoute.js     # Session routes
│   ├── view-all-data.js     # View DB data
│   ├── add-sample-data.js   # Add sample data
│   └── test-auth.js         # Test authentication
│
├── frontend/
│   ├── index.html           # Landing page
│   ├── session.html         # Whiteboard page
│   ├── app.js               # Main app logic
│   ├── session.js           # Session logic
│   ├── whiteboard.js        # Canvas drawing
│   ├── styles.css           # Styles
│   ├── package.json         # Dependencies
│   └── bs-config.json       # Lite-server config
│
└── START_ALL.bat            # One-click startup script
```

---

## 🎓 Development Tips

### Backend Development:
- Use `npm run dev` for auto-reload with nodemon
- Check logs in terminal for errors
- Use `npm run test-auth` to test endpoints

### Frontend Development:
- Changes auto-reload with lite-server
- Check browser console for errors
- Use browser DevTools Network tab for API calls

### Database Development:
- Use `npm run view-db` to see current data
- Use MongoDB Atlas UI for advanced queries
- Run `npm run add-sample-data` for testing

---

## 🔐 Security Notes

- JWT tokens expire in 7 days
- Passwords are hashed with bcrypt
- CORS is enabled for development
- Keep your `.env` file secure
- Never commit MongoDB credentials to Git

---

## 📞 Quick Reference

| Service | URL | Status |
|---------|-----|--------|
| Frontend | http://localhost:3000 | ✅ |
| Backend API | http://localhost:5000 | ✅ |
| MongoDB | Atlas Cloud | ✅ |
| Health Check | http://localhost:5000/api/health | ✅ |

---

## ✅ Checklist

Before starting, make sure:
- [ ] Node.js is installed
- [ ] MongoDB connection string is in `.env`
- [ ] Backend dependencies installed (`npm install`)
- [ ] Frontend dependencies installed (`npm install`)
- [ ] Ports 3000 and 5000 are available

---

**Last Updated:** October 30, 2025

**Happy Collaborating! 🎨**
