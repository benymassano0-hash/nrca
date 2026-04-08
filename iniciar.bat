@echo off
REM Script para iniciar RCNA - Backend e Frontend
REM Requer Windows com PowerShell

color 0B
title RCNA - Registro de Caes da Angola

echo.
echo ╔══════════════════════════════════════════════╗
echo ║  RCNA - Registro de Caes da Angola          ║
echo ║  Iniciando Backend + Frontend...            ║
echo ╚══════════════════════════════════════════════╝
echo.

REM Matar processos Node anteriores
echo Limpando processos anteriores...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak 1>nul

REM Iniciar Backend em janela separada
echo.
echo [1/2] Iniciando Backend SQL...
cd /d "c:\Users\josé massano\bb\RCNA\backend"
start "RCNA Backend" cmd /k "npm run dev"
timeout /t 3 /nobreak 1>nul

REM Iniciar Frontend em janela separada
echo [2/2] Iniciando Frontend...
cd /d "c:\Users\josé massano\bb\RCNA\frontend"
start "RCNA Frontend" cmd /k "npm start"

echo.
echo ╔══════════════════════════════════════════════╗
echo ║  ✅ Aplicacao iniciada!                      ║
echo ║                                              ║
echo ║  Frontend: http://localhost:3000             ║
echo ║  Backend:  http://localhost:5000             ║
echo ║                                              ║
echo ║  Abra agora o navegador!                     ║
echo ╚══════════════════════════════════════════════╝
echo.
pause
