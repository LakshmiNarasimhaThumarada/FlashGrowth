@echo off
echo ========================================
echo   Flash Growth - Setup Script
echo ========================================
echo.
echo Installing dependencies...
cd /d "%~dp0"
node copy-images.js
call npm install
echo.
echo ========================================
echo   Starting development server...
echo ========================================
echo.
call npm run dev
