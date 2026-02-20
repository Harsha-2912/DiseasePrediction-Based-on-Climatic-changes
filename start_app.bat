@echo off
echo ==================================================
echo   Starting Climate Disease Predictor Application
echo ==================================================

echo 1. Starting Backend Server (Port 5000)...
start "Backend Server" cmd /k "cd backend && node server.js"

echo 2. Starting Frontend Application...
start "Frontend Application" cmd /k "cd frontend && npm run dev"

echo ==================================================
echo   Application Launched!
echo   - Backend: http://localhost:5000
echo   - Frontend: http://localhost:5173
echo ==================================================
echo.
echo Please allow a few seconds for servers to initialize.
echo Press any key to exit this launcher (servers will stay open).
pause
