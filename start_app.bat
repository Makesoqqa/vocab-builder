@echo off
echo ==========================================
echo Starting Telegram Mini App Dev Server...
echo ==========================================
echo.
echo Make sure you have Node.js installed.
echo.
echo Step 1: Navigate to project folder
cd /d "%~dp0"

echo.
echo Step 2: Starting Server...
npm.cmd run dev

pause
