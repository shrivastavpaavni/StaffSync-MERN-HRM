@echo off
title StaffSync HRM - System Launcher
echo ========================================================
echo         StaffSync HRM - Enterprise System Launcher      
echo ========================================================
echo.

REM 1. Check if mongod is running, if not start it
echo [1/3] Checking MongoDB...
netstat -ano | findstr 27017 >nul
if %errorlevel% equ 0 (
    echo [✓] MongoDB is already running on port 27017.
) else (
    echo [!] MongoDB is not running on port 27017. Starting MongoDB server...
    if not exist "%~dp0data\db" mkdir "%~dp0data\db"
    start "StaffSync MongoDB" "C:\Program Files\MongoDB\Server\9.0\bin\mongod.exe" --dbpath "%~dp0data\db" --port 27017
    timeout /t 3 /nobreak >nul
    echo [✓] MongoDB launched.
)

REM 2. Start StaffSync Full-Stack App
echo.
echo [2/3] Starting StaffSync Server on http://localhost:5000 ...
echo [✓] Serving React Frontend + Express REST API on http://localhost:5000
echo.
echo ========================================================
echo  StaffSync is ready!
echo  Open your web browser and go to:
echo  ---> http://localhost:5000
echo.
echo  Demo Credentials:
echo    HR Director:        hr@staffsync.com       / password123
echo    Manager:            manager@staffsync.com  / password123
echo    Senior Engineer:    employee@staffsync.com / password123
echo ========================================================
echo.
cd "%~dp0"
node backend/server.js
pause
