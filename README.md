# 🎨 Stromboard - Collaborative Whiteboard

A real-time collaborative whiteboard application with advanced drawing tools, session management, and seamless multi-user synchronization.

![Stromboard](https://img.shields.io/badge/Stromboard-v1.0.0-blue)
![Socket.IO](https://img.shields.io/badge/Socket.IO-v4.7.2-green)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-brightgreen)

---

## ✨ Features

### 🎯 Core Features
- ✅ **Real-Time Collaboration** - Multiple users can draw simultaneously
- ✅ **Advanced Drawing Tools** - Pen, Highlighter, Eraser, Text, Shapes
- ✅ **Color Picker** - Custom colors and presets
- ✅ **Undo/Redo** - Full history management
- ✅ **Session Management** - Create and join rooms with unique IDs
- ✅ **User Authentication** - Email and Google sign-in (simulated)
- ✅ **Active Users Display** - See who's in your session
- ✅ **Touch Support** - Works on tablets and mobile devices

### 🌟 Premium Features
- 📊 **Session Analytics** - Track engagement and participation
- 💾 **Auto-Saving** - Canvas state saved every 30 seconds
- 🔒 **Secure Sessions** - Private rooms with unique IDs
- 📤 **Export & Share** - Download and share your work
- 🎨 **Demo Whiteboard** - Try it before creating a session

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account
- npm or yarn

### Installation

#### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd "white board collaberation"
```

#### 2. Setup Backend
```bash
cd backend
npm install
```

Create `.env` file in `backend/` folder:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
NODE_ENV=development
```

Start backend server:
```bash
npm start
```

Backend will run on `http://localhost:5000`

#### 3. Setup Frontend
```bash
cd frontend
npm install
```

Start frontend server:
```bash
npm start
```

Frontend will run on `http://localhost:3000`

---

## 🧪 Testing Real-Time Collaboration

### Local Testing (Two Tabs)

1. **Start both servers:**
   - Backend: `cd backend && npm start`
   - Frontend: `cd frontend && npm start`

2. **Open two browser tabs:**
   - Tab 1: `http://localhost:3000`
   - Tab 2: `http://localhost:3000` (or use incognito)

3. **Create a session in Tab 1:**
   - Click "Get Started" or "Create Session"
   - Login with any email (e.g., `user1@test.com`)
   - Note the **Room ID** displayed

4. **Join the same session in Tab 2:**
   - Click "Join Session"
   - Login with different email (e.g., `user2@test.com`)
   - Enter the **same Room ID** from Tab 1
   - Click "Join"

5. **Test real-time features:**
   - ✅ Draw in Tab 1 → Should appear in Tab 2 instantly
   - ✅ Change color in Tab 2 → Draw → Should appear in Tab 1
   - ✅ Use eraser in Tab 1 → Should erase in Tab 2
   - ✅ Add text in Tab 2 → Should appear in Tab 1
   - ✅ Clear canvas in Tab 1 → Should clear in Tab 2
   - ✅ Check "Active Users" - both users should be listed
   - ✅ Close Tab 2 → User should disappear from Tab 1's active users

6. **Check browser console (F12):**
   - Should see: `✅ Connected to Socket.IO server`
   - Should see: `👥 Active users: [...]`
   - No errors should appear

### Testing with Different Devices

1. **Find your local IP:**
   ```bash
   # Windows
   ipconfig
   # Look for IPv4 Address (e.g., 192.168.1.100)
   
   # Mac/Linux
   ifconfig
   ```

2. **Update Socket.IO connection:**
   - Edit `frontend/session.js`
   - Change: `socket = io('http://localhost:5000');`
   - To: `socket = io('http://192.168.1.100:5000');`

3. **Access from phone/tablet:**
   - Connect device to same WiFi network
   - Open: `http://192.168.1.100:3000`
   - Create/join session and test!

---

## 📁 Project Structure

```
white board collaberation/
├── backend/
│   ├── controller/
│   │   └── usercontroller.js
│   ├── module/
│   │   └── user.js              # Session model (MongoDB schema)
│   ├── route/
│   │   └── userRoute.js
│   ├── .env                     # Environment variables
│   ├── index.js                 # Express + Socket.IO server
│   └── package.json
│
├── frontend/
│   ├── assets/
│   ├── src/
│   │   ├── app.js
│   │   ├── canvas.js
│   │   ├── session.js
│   │   └── websocket.js
│   ├── index.html               # Landing page
│   ├── session.html             # Whiteboard session page
│   ├── app.js                   # Landing page logic
│   ├── session.js               # Session + Socket.IO logic
│   ├── styles.css               # Base styles
│   ├── features.css             # Feature cards styles
│   ├── animations.css           # 20+ animation effects
│   └── package.json
│
├── DEPLOYMENT_GUIDE.md          # Full deployment instructions
└── README.md                    # This file
```

---

## 🛠️ Tech Stack

### Frontend
- HTML5 Canvas API
- Vanilla JavaScript
- CSS3 (with animations)
- Socket.IO Client (v4.7.2)
- lite-server (dev)

### Backend
- Node.js
- Express.js (v4.21.2)
- Socket.IO (v4.8.1)
- MongoDB with Mongoose (v8.19.2)
- CORS (v2.8.5)

---

## 🎨 Available Drawing Tools

| Tool | Icon | Description |
|------|------|-------------|
| **Select** | 🖱️ | Selection tool (future) |
| **Pen** | ✏️ | Draw with custom colors and sizes |
| **Highlighter** | 🖍️ | Semi-transparent marker |
| **Eraser** | 🧹 | Remove drawings |
| **Text** | 📝 | Add text to canvas |
| **Rectangle** | ▭ | Draw rectangles (future) |
| **Circle** | ⭕ | Draw circles (future) |
| **Line** | ― | Draw lines (future) |
| **Arrow** | ➡️ | Draw arrows (future) |

---

## 🔌 Socket.IO Events

### Client → Server
- `join-session` - Join a whiteboard session
- `draw-action` - Broadcast drawing stroke
- `clear-canvas` - Clear the canvas
- `add-text` - Add text to canvas
- `cursor-move` - Share cursor position
- `undo-action` - Undo last action
- `redo-action` - Redo last undone action
- `save-canvas-state` - Save to MongoDB

### Server → Client
- `users-update` - Active users list
- `draw-action` - Drawing from other users
- `clear-canvas` - Canvas cleared by another user
- `add-text` - Text added by another user
- `cursor-move` - Other users' cursor positions
- `undo-action` - Undo from another user
- `redo-action` - Redo from another user

---

## 🌐 Deployment

See **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** for complete deployment instructions to:
- Railway/Render (Backend)
- Vercel/Netlify (Frontend)
- MongoDB Atlas configuration
- Environment setup
- Troubleshooting tips

---

## 🧪 Testing Checklist

### Before Deployment
- [x] Backend starts without errors
- [x] Frontend starts without errors
- [x] Socket.IO connection established
- [x] Drawing syncs between two tabs
- [x] Active users updates correctly
- [x] Clear canvas works across users
- [x] Text tool syncs
- [x] Undo/redo works locally
- [x] Login flow works
- [x] Session creation works
- [x] Session joining works
- [x] Leave session disconnects socket
- [x] MongoDB connection successful

### After Deployment
- [ ] Backend health check responds
- [ ] Frontend loads successfully
- [ ] Socket.IO connects to production backend
- [ ] Drawing syncs between different devices
- [ ] No CORS errors in console
- [ ] Active users syncs properly
- [ ] All tools work in production

---

## 📊 Performance Notes

- Canvas state saved every 30 seconds to MongoDB
- Socket.IO events are optimized for minimal latency
- Active users tracked per session (no global state)
- Automatic cleanup on user disconnect
- Touch events optimized for mobile devices

---

## 🐛 Known Issues & Limitations

1. **Undo/Redo Sync:** Full history synchronization across users is not implemented. Each user has their own local undo/redo history.
2. **Shape Tools:** Rectangle, Circle, Line, Arrow tools UI exists but drawing logic not implemented yet.
3. **Cursor Tracking:** Backend handles cursor-move events but frontend visual display not implemented.
4. **Image Upload:** Button exists but upload functionality not implemented.
5. **Auth:** Currently simulated - uses localStorage, not true OAuth.

---

## 🔮 Future Enhancements

- [ ] Real Google OAuth integration
- [ ] Implement shape tools (rectangle, circle, line, arrow)
- [ ] Live cursor tracking with user names
- [ ] Chat functionality
- [ ] Video/voice integration
- [ ] Export to PDF/PNG
- [ ] Templates and backgrounds
- [ ] Sticky notes and emojis
- [ ] Permission levels (viewer/editor)
- [ ] Session recording and playback

---

## 📝 Environment Variables

### Backend (.env)
```env
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/
NODE_ENV=development
```

### Frontend
No environment variables required for development. Update Socket.IO connection URL in `session.js` for production.

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Stromboard Team**

---

## 🙏 Acknowledgments

- Socket.IO for real-time communication
- MongoDB Atlas for database hosting
- Font Awesome for icons
- Google Fonts (Poppins)

---

**⭐ Star this repo if you find it helpful!**

*Happy collaborating! 🎨*
