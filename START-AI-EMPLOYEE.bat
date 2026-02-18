@echo off
title AI Employee - Starting...
color 0A
echo ========================================
echo    AI EMPLOYEE SYSTEM STARTING...
echo ========================================
echo.

echo [1/2] Starting Backend API Server...
start "AI Employee - Backend" cmd /k "cd /d %~dp0backend && set OPENROUTER_API_KEY=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 && set VAULT_PATH=./vault && python -c \"from api_server import app; app.run(debug=False, port=8000)\""

timeout /t 5 /nobreak >nul

echo [2/2] Starting Frontend Server...
start "AI Employee - Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo    SYSTEM STARTED SUCCESSFULLY!
echo ========================================
echo.
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:8000
echo.
echo Close this window anytime.
pause
