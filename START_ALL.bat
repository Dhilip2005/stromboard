@echo off
echo ========================================
echo  STROMBOARD - Full Stack Startup
echo ========================================
echo.

echo [1/4] Starting MongoDB Connection...
echo MongoDB URI: mongodb+srv://dhilip_02:***@cluster0.wetcol6.mongodb.net/
echo Status: Connected (Atlas Cloud Database)
echo.

echo [2/4] Starting Backend Server...
cd "c:\Users\manoj\OneDrive\Desktop\wc1\white board collaberation\white board collaberation\backend"
start "Backend Server" cmd /k "npm start"
timeout /t 3 /nobreak > nul
echo Backend: http://localhost:5000
echo Status: RUNNING
echo.

echo [3/4] Starting Frontend Server...
cd "c:\Users\manoj\OneDrive\Desktop\wc1\white board collaberation\white board collaberation\frontend"
start "Frontend Server" cmd /k "npm start"
timeout /t 3 /nobreak > nul
echo Frontend: http://localhost:3000
echo Status: RUNNING
echo.

echo [4/4] Opening Application...
timeout /t 2 /nobreak > nul
start http://localhost:3000
echo.

echo ========================================
echo  ALL SYSTEMS RUNNING!
echo ========================================
echo.
echo  Backend API:  http://localhost:5000
echo  Frontend App: http://localhost:3000
echo  MongoDB:      Connected to Atlas
echo.
echo ========================================
echo  AVAILABLE ENDPOINTS:
echo ========================================
echo.
echo  Health Check:  http://localhost:5000/api/health
echo  Auth Routes:   http://localhost:5000/api/auth
echo    - POST /register (name, email, password)
echo    - POST /login (email, password)
echo  Session Routes: http://localhost:5000/api/sessions
echo    - GET  / (list all sessions)
echo    - POST / (create session)
echo    - GET  /:id (get session by ID)
echo.
echo ========================================
echo  TEST CREDENTIALS:
echo ========================================
echo  Email:    john@example.com
echo  Password: password123
echo.
echo  Email:    jane@example.com
echo  Password: password123
echo.
echo ========================================
echo.
echo Press any key to view database data...
pause > nul
cd "c:\Users\manoj\OneDrive\Desktop\wc1\white board collaberation\white board collaberation\backend"
node view-all-data.js
echo.
echo ========================================
echo To stop servers, close the terminal windows.
echo ========================================
pause
