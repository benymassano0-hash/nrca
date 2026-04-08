@echo off
chcp 65001 >nul
setlocal

echo.
echo =====================================================
echo   RCNA - Publicar no GitHub para deploy no Render
echo =====================================================
echo.

where git >nul 2>nul
if errorlevel 1 (
  echo ERRO: Git nao encontrado. Instale o Git primeiro.
  pause
  exit /b 1
)

set /p REPO_URL="Cole a URL do repositorio GitHub (ex: https://github.com/usuario/rcna.git): "
if "%REPO_URL%"=="" (
  echo ERRO: a URL do repositorio nao pode estar vazia.
  pause
  exit /b 1
)

cd /d "%~dp0"

if not exist ".git" (
  echo [1/5] A iniciar repositorio Git...
  git init
) else (
  echo [1/5] Repositorio Git ja existe.
)

echo [2/5] A configurar branch principal...
git branch -M main

echo [3/5] A configurar remote origin...
git remote remove origin >nul 2>nul
git remote add origin %REPO_URL%

echo [4/5] A preparar commit...
git add .
git commit -m "Preparar deploy automatico no Render" >nul 2>nul

echo [5/5] A enviar para GitHub...
git push -u origin main
if errorlevel 1 (
  echo.
  echo ERRO ao enviar para o GitHub.
  echo Verifique as credenciais e se o repositorio ja foi criado no GitHub.
  pause
  exit /b 1
)

echo.
echo =====================================================
echo   CODIGO PUBLICADO COM SUCESSO NO GITHUB.
echo   Agora pode ligar o repositorio no Render.
echo =====================================================
echo.
pause