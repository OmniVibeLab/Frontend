@echo off
echo Starting OmniVibe Development Server...
echo.

echo Starting Backend Server...
start "Backend Server" cmd /k "cd server && npm start"

echo.
echo Waiting for backend to start...
timeout /t 3 /nobreak > nul

echo Starting Frontend Server...
start "Frontend Server" cmd /k "npm run dev"

echo.
echo Both servers are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo.
pause
