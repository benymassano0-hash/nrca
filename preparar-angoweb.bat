@echo off
chcp 65001 >nul
echo.
echo =====================================================
echo   RCNA - Preparar pacote para Angoweb
echo =====================================================
echo.

:: ---- 1. Pede o dominio ao utilizador ----
set /p DOMINIO="Qual e o teu dominio no Angoweb (ex: rcna.angoweb.ao)? "
if "%DOMINIO%"=="" (
  echo ERRO: Dominio nao pode estar vazio.
  pause
  exit /b 1
)

echo.
echo >> Dominio definido: https://%DOMINIO%
echo.

:: ---- 2. Instalar dependencias do backend ----
echo [1/5] Instalando dependencias do backend...
cd /d "%~dp0backend"
call npm install --omit=dev
if errorlevel 1 ( echo ERRO nas dependencias do backend & pause & exit /b 1 )
cd /d "%~dp0"

:: ---- 3. Instalar dependencias do frontend ----
echo.
echo [2/5] Instalando dependencias do frontend...
cd /d "%~dp0frontend"
call npm install
if errorlevel 1 ( echo ERRO nas dependencias do frontend & pause & exit /b 1 )

:: ---- 4. Fazer build do frontend com URLs de producao ----
echo.
echo [3/5] A compilar frontend para producao...
set REACT_APP_API_URL=https://%DOMINIO%/api
call npm run build
if errorlevel 1 ( echo ERRO no build do frontend & pause & exit /b 1 )
cd /d "%~dp0"

:: ---- 5. Criar .env de producao com o dominio certo ----
echo.
echo [4/5] A atualizar .env.production com o dominio...
(
echo # RCNA - PRODUCAO - Angoweb
echo DB_CLIENT=sqlite
echo PORT=5000
echo HOST=0.0.0.0
echo NODE_ENV=production
echo JWT_SECRET=mude_esta_chave_para_algo_muito_secreto_rcna_2026
echo FRONTEND_ORIGINS=https://%DOMINIO%
echo UPLOAD_DIR=./uploads
) > ".env.production"
echo    Ficheiro .env.production atualizado.

:: ---- 6. Criar pasta de entrega ----
echo.
echo [5/5] A criar pacote final "pacote-angoweb"...
if exist "pacote-angoweb" rmdir /s /q "pacote-angoweb"
mkdir "pacote-angoweb"
mkdir "pacote-angoweb\backend"
mkdir "pacote-angoweb\backend\uploads"
mkdir "pacote-angoweb\backend\uploads\dogs"

:: -- Copiar backend (sem node_modules) --
xcopy /e /i /q "backend\src" "pacote-angoweb\backend\src"
xcopy /e /i /q "backend\database" "pacote-angoweb\backend\database"
copy "backend\server.js" "pacote-angoweb\backend\server.js"
copy "backend\package.json" "pacote-angoweb\backend\package.json"
copy "backend\package-lock.json" "pacote-angoweb\backend\package-lock.json" 2>nul

:: -- Copiar frontend/build dentro do backend (o servidor serve-o) --
xcopy /e /i /q "frontend\build" "pacote-angoweb\frontend\build"
xcopy /e /i /q "frontend\build" "pacote-angoweb\backend\..\frontend\build" 2>nul

:: -- Ficheiros de configuracao --
copy ".env.production" "pacote-angoweb\.env.production"
copy "ecosystem.config.js" "pacote-angoweb\ecosystem.config.js" 2>nul
copy "ANGOWEB_DEPLOY.md" "pacote-angoweb\ANGOWEB_DEPLOY.md" 2>nul

echo.
echo =====================================================
echo   PRONTO! Pasta "pacote-angoweb" criada.
echo.
echo   LEMBRETE IMPORTANTE:
echo   Edita o JWT_SECRET no ficheiro .env.production
echo   antes de carregar para o servidor!
echo =====================================================
echo.
pause
