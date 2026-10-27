@echo off
title StaffSync HRM - Development Mode
echo ========================================================
echo         StaffSync HRM - Live Development Mode
echo ========================================================
echo.

REM 1. Check MongoDB
netstat -ano | findstr 27017 >nul
if %errorlevel% equ 0 (
    echo [✓] MongoDB is running on port 27017.
) else (
    echo [*] Starting MongoDB...
    if not exist "%~dp0data\db" mkdir "%~dp0data\db"
    start "StaffSync MongoDB" "C:\Program Files\MongoDB\Server\9.0\bin\mongod.exe" --dbpath "%~dp0data\db" --port 27017
    timeout /t 3 /nobreak >nul
)

REM 2. Start Backend API
echo [*] Starting Backend API on http://localhost:5000 ...
start "StaffSync Backend API" cmd /k "cd /d %~dp0 && node backend/server.js"
timeout /t 2 /nobreak >nul

REM 3. Start Frontend Vite Server
echo [*] Starting Frontend Vite Server on http://localhost:3000 ...
start "StaffSync React Vite" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ========================================================
echo Both Backend (port 5000) and Frontend (port 3000) started!
echo Open your browser at: http://localhost:3000
echo ========================================================
pause
