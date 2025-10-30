# 🧪 Stromboard - Real-Time Testing Guide

Quick guide to test your collaborative whiteboard's real-time features.

---

## 🚀 Quick Start Testing (5 minutes)

### Step 1: Start Both Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```
✅ Should see: `Server is running on port 5000` and `MongoDB Connected...`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```
✅ Should see: `Did not detect a \`bs-config.json\` or \`bs-config.js\` override file` and browser opens

---

### Step 2: Open Two Browser Tabs

**Tab 1 (User 1):**
1. Go to `http://localhost:3000`
2. Click "Get Started"
3. Login with: `user1@test.com`
4. Click "Create Session"
5. Enter session name: `Test Room`
6. **Copy the Room ID** (e.g., `room-12345`)

**Tab 2 (User 2) - Incognito/Private Window:**
1. Go to `http://localhost:3000`
2. Click "Get Started"
3. Login with: `user2@test.com`
4. Click "Join Session"
5. Enter the **Room ID** from Tab 1
6. Click "Join"

---

### Step 3: Test Real-Time Drawing

#### Test 1: Basic Drawing ✏️
- **Tab 1:** Select pen tool, draw a circle
- **Tab 2:** Should see the circle appear instantly!

#### Test 2: Color Change 🎨
- **Tab 2:** Change color to red, draw a line
- **Tab 1:** Should see red line appear!

#### Test 3: Eraser 🧹
- **Tab 1:** Select eraser, erase part of the drawing
- **Tab 2:** Should see the same area get erased!

#### Test 4: Highlighter 🖍️
- **Tab 2:** Select highlighter, draw over existing content
- **Tab 1:** Should see semi-transparent highlight!

#### Test 5: Text Tool 📝
- **Tab 1:** Select text tool, click on canvas
- Enter text: "Hello from User 1!"
- **Tab 2:** Should see the text appear!

#### Test 6: Clear Canvas 🧹
- **Tab 2:** Click "Clear" button, confirm
- **Tab 1:** Canvas should be cleared!

#### Test 7: Active Users 👥
- **Both Tabs:** Look at "Active Users" section (top-right)
- Should see both users listed with avatars

#### Test 8: User Disconnect
- **Tab 2:** Close the tab or click "Leave Session"
- **Tab 1:** User 2 should disappear from "Active Users"

---

## 🔍 Browser Console Checks

### Open DevTools (F12) → Console

**What You Should See:**
```
✅ Connected to Socket.IO server
👥 Active users: [{...}, {...}]
```

**What You Should NOT See:**
```
❌ CORS error
❌ Connection refused
❌ 404 errors (except favicon.ico)
❌ WebSocket errors
```

---

## 📊 Expected Results Summary

| Test | Expected Behavior | Status |
|------|------------------|--------|
| **Two tabs open same session** | ✅ Both users in Active Users list | |
| **Draw in Tab 1** | ✅ Appears instantly in Tab 2 | |
| **Draw in Tab 2** | ✅ Appears instantly in Tab 1 | |
| **Change color** | ✅ Different colors sync correctly | |
| **Use eraser** | ✅ Erased areas sync to all users | |
| **Add text** | ✅ Text appears in all sessions | |
| **Clear canvas** | ✅ All canvases cleared | |
| **User leaves** | ✅ Removed from Active Users | |
| **User joins** | ✅ Added to Active Users | |
| **No console errors** | ✅ Clean console, no CORS/Socket errors | |

---

## 🐛 Troubleshooting

### Issue: "Not seeing other user's drawings"

**Check:**
1. Both tabs showing the **same Room ID** in navbar?
2. Both tabs have "Active Users" showing 2 users?
3. Browser console showing "Connected to Socket.IO server"?
4. Backend terminal showing both users joined?

**Solution:**
- Refresh both tabs
- Make sure you're using **incognito/private** for second tab
- Check backend terminal for errors

---

### Issue: "Socket.IO not connecting"

**Console shows:** `ERR_CONNECTION_REFUSED`

**Check:**
1. Backend server running on port 5000?
2. Check backend terminal for errors
3. Visit `http://localhost:5000/api/health` - should return JSON

**Solution:**
```bash
# Restart backend
cd backend
npm start
```

---

### Issue: "User count not updating"

**Check:**
1. Browser console for `users-update` events
2. Backend terminal for "User joined session" messages

**Solution:**
- Hard refresh both tabs (Ctrl+Shift+R)
- Check `connectToBackend()` function is being called

---

### Issue: "Drawings lag or delay"

**Check:**
1. Local network speed
2. Backend terminal for errors
3. Browser DevTools → Network → WS (WebSocket) tab

**Solution:**
- This is normal for localhost testing (should be instant)
- Check if backend is processing too many events
- Try reducing brush size

---

## 📱 Testing on Mobile/Tablet

### 1. Find Your Computer's IP

**Windows:**
```cmd
ipconfig
```
Look for `IPv4 Address`: e.g., `192.168.1.100`

**Mac/Linux:**
```bash
ifconfig
```
Look for `inet`: e.g., `192.168.1.100`

### 2. Update Socket.IO Connection

Edit `frontend/session.js` line ~230:
```javascript
// Change from:
socket = io('http://localhost:5000');

// To:
socket = io('http://192.168.1.100:5000'); // Use your IP
```

### 3. Access from Phone

1. Connect phone to **same WiFi network**
2. Open browser on phone
3. Go to: `http://192.168.1.100:3000`
4. Login and join/create session
5. Draw on phone - should appear on computer!

---

## ✅ Final Checklist

Before deploying to production, ensure:

- [ ] Two tabs can draw simultaneously
- [ ] Active users list updates correctly
- [ ] Clear canvas works across all users
- [ ] Text tool syncs properly
- [ ] Color changes sync
- [ ] Eraser works across sessions
- [ ] No errors in browser console
- [ ] No errors in backend terminal
- [ ] User disconnect removes from Active Users
- [ ] Login flow works smoothly
- [ ] Room ID copy button works
- [ ] Leave session disconnects socket

---

## 🎯 Performance Testing

### Stress Test: Multiple Users

1. Open 5+ tabs in different browsers
2. All join the same session
3. All draw simultaneously
4. Check for:
   - Lag in drawing sync
   - Canvas getting corrupted
   - Backend performance issues
   - Memory usage spikes

### Expected Performance:
- **2-3 users:** Instant sync, no lag
- **4-6 users:** Slight delay (< 100ms)
- **7+ users:** May experience lag depending on drawing speed

---

## 📞 Need Help?

1. **Check Logs:**
   - Backend terminal for server errors
   - Browser console (F12) for frontend errors

2. **Verify Connections:**
   - Backend: `http://localhost:5000/api/health`
   - Frontend: `http://localhost:3000`

3. **Reset Everything:**
   ```bash
   # Kill all processes
   # Ctrl+C in both terminals
   
   # Restart backend
   cd backend && npm start
   
   # Restart frontend
   cd frontend && npm start
   ```

---

**Happy Testing! 🎨✨**

*If all tests pass, you're ready to deploy!* 🚀
