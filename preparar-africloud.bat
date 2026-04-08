@echo off
chcp 65001 >nul
echo.
echo =====================================================
echo   RCNA - Preparar pacote para AFRICLOUD
echo =====================================================
echo.

set /p DOMINIO="Qual e o teu dominio no AFRICLOUD (ex: rcna.africloud.ao)? "
if "%DOMINIO%"=="" (
  echo ERRO: Dominio nao pode estar vazio.
  pause
  exit /b 1
)

echo.
echo ^>^> Dominio definido: https://%DOMINIO%
echo.

echo [1/6] Instalando dependencias do backend...
cd /d "%~dp0backend"
call npm install --omit=dev
if errorlevel 1 ( echo ERRO nas dependencias do backend & pause & exit /b 1 )
cd /d "%~dp0"

echo.
echo [2/6] Instalando dependencias do frontend...
cd /d "%~dp0frontend"
call npm install
if errorlevel 1 ( echo ERRO nas dependencias do frontend & pause & exit /b 1 )

echo.
echo [3/6] A compilar frontend para producao...
set REACT_APP_API_URL=https://%DOMINIO%/api
call npm run build
if errorlevel 1 ( echo ERRO no build do frontend & pause & exit /b 1 )
cd /d "%~dp0"

echo.
echo [4/6] A criar .env.production...
(
echo # RCNA - PRODUCAO - AFRICLOUD
echo DB_CLIENT=sqlite
echo PORT=5000
echo HOST=0.0.0.0
echo NODE_ENV=production
echo JWT_SECRET=mude_esta_chave_para_algo_muito_secreto_rcna_2026
echo FRONTEND_ORIGINS=https://%DOMINIO%
echo UPLOAD_DIR=./uploads
) > ".env.production"
echo    Ficheiro .env.production atualizado.

echo.
echo [5/6] A criar pacote final "pacote-africloud"...
if exist "pacote-africloud" rmdir /s /q "pacote-africloud"
mkdir "pacote-africloud"
mkdir "pacote-africloud\backend"
mkdir "pacote-africloud\backend\uploads"
mkdir "pacote-africloud\backend\uploads\dogs"
mkdir "pacote-africloud\backend\uploads\qrcodes"

xcopy /e /i /q "backend\src" "pacote-africloud\backend\src"
xcopy /e /i /q "backend\database" "pacote-africloud\backend\database"
copy "backend\server.js" "pacote-africloud\backend\server.js"
copy "backend\package.json" "pacote-africloud\backend\package.json"
copy "backend\package-lock.json" "pacote-africloud\backend\package-lock.json" 2>nul
xcopy /e /i /q "frontend\build" "pacote-africloud\frontend\build"
copy ".env.production" "pacote-africloud\.env.production"
copy "ecosystem.config.js" "pacote-africloud\ecosystem.config.js" 2>nul
copy "deploy-africloud.sh" "pacote-africloud\deploy-africloud.sh" 2>nul

echo.
echo [6/6] A criar ZIP final...
powershell -NoProfile -Command "if (Test-Path 'RCNA-AFRICLOUD.zip') { Remove-Item 'RCNA-AFRICLOUD.zip' -Force }; Compress-Archive -Path 'pacote-africloud\*' -DestinationPath 'RCNA-AFRICLOUD.zip' -Force"
if errorlevel 1 ( echo ERRO ao criar ZIP final & pause & exit /b 1 )

echo.
echo =====================================================
echo   PRONTO! Pasta "pacote-africloud" e ficheiro
echo   "RCNA-AFRICLOUD.zip" criados.
echo.
echo   LEMBRETE IMPORTANTE:
echo   Edita o JWT_SECRET no ficheiro .env.production
echo   antes de carregar para o servidor!
echo =====================================================
echo.
pause