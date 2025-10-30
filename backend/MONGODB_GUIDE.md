# MongoDB Database Guide

## ✅ Database Configuration

**MongoDB Connection String:**
```
mongodb+srv://dhilip_02:Dhilip2005p@cluster0.wetcol6.mongodb.net/?appName=Cluster0
```

**Database:** test (default)

**Location:** `.env` file in backend folder

---

## 📊 Current Database State

### Collections:
1. **users** - 2 documents
2. **sessions** - 3 documents  
3. **students** - 1 document (legacy test data)

### Sample Users:
- John Doe (john@example.com) - password: `password123`
- Jane Smith (jane@example.com) - password: `password123`

### Sample Sessions:
- Team Brainstorming Session (2 drawing items)
- Project Planning (1 drawing item)
- Design Review (0 drawing items)

---

## 🛠️ Available Scripts

### View Database Data
Run this command to see all data in your MongoDB collections:
```bash
npm run view-db
```
or
```bash
node view-all-data.js
```

### Add Sample Data
To populate the database with sample users and sessions:
```bash
npm run add-sample-data
```
or
```bash
node add-sample-data.js
```

---

## 🌐 View Data in MongoDB Atlas

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Log in with your credentials
3. Select your cluster: **Cluster0**
4. Click "Browse Collections"
5. You'll see:
   - **test** database (or stromboard)
   - **users** collection
   - **sessions** collection

---

## 🔌 API Endpoints

### Users
- **Register:** `POST http://localhost:5000/api/auth/signup`
  ```json
  {
    "name": "Your Name",
    "email": "your@email.com",
    "password": "yourpassword"
  }
  ```

- **Login:** `POST http://localhost:5000/api/auth/login`
  ```json
  {
    "email": "your@email.com",
    "password": "yourpassword"
  }
  ```

### Sessions
- **Create Session:** `POST http://localhost:5000/api/sessions`
  ```json
  {
    "sessionName": "My Whiteboard Session"
  }
  ```

- **Get All Sessions:** `GET http://localhost:5000/api/sessions`

- **Get Session by ID:** `GET http://localhost:5000/api/sessions/:id`

---

## 📝 Database Models

### User Schema
```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (hashed),
  provider: String (default: 'email'),
  photoURL: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Session Schema
```javascript
{
  sessionName: String (required),
  drawingData: Array (default: []),
  createdAt: Date
}
```

---

## 🚀 Quick Start

1. **Start the backend server:**
   ```bash
   cd backend
   npm start
   ```

2. **View your data:**
   ```bash
   npm run view-db
   ```

3. **Access MongoDB Atlas:**
   - Visit: https://cloud.mongodb.com/
   - Login and browse your collections

---

## 💡 Tips

- The password for sample users is: `password123`
- All passwords are hashed using bcrypt
- Drawing data is stored as JSON array in sessions
- Use the view-db script anytime to check your data
- The backend connects to MongoDB automatically on startup

---

## 📁 Files Created

- `view-all-data.js` - View all collections and documents
- `view-db-data.js` - View users and sessions with schema info
- `add-sample-data.js` - Populate database with sample data
- `MONGODB_GUIDE.md` - This guide

---

**Last Updated:** October 30, 2025
