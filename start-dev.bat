@echo off
title College Companion Launcher
echo ===================================================
echo     Launching College Companion Full-Stack App
echo ===================================================
echo.
echo [1/2] Starting Flask Backend on http://127.0.0.1:5000 ...
start "College Companion - Backend" cmd /k "cd /d %~dp0backend && py run.py"

echo [2/2] Starting React + Vite Frontend on http://localhost:3000 ...
start "College Companion - Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ===================================================
echo  Both servers are running in their own windows!
echo  Access the web app at: http://localhost:3000
echo  Admin login: username: admin / password: adminpassword123
echo ===================================================
pause
