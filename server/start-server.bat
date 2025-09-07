@echo off
title OmniVibe Backend Server
color 0A
echo.
echo ================================================
echo           OmniVibe Backend Server
echo ================================================
echo.
echo Starting server...
echo.
cd /d "d:\web apps\omnivibe\server"

REM Check if node_modules exists
if not exist "node_modules" (
    echo Dependencies not found. Installing...
    npm install
    if errorlevel 1 (
        echo.
        echo Failed to install dependencies
        pause
        exit /b 1
    )
)

echo.
echo Starting development server...
npm run dev

if errorlevel 1 (
    echo.
    echo Server failed to start
    pause
    exit /b 1
)

pause