@echo off
setlocal enabledelayedexpansion

echo 🐕 RCNA - Registro de Cães da Angola
echo =====================================
echo.

REM Verificar se Node.js está instalado
node --version >nul 2>&1
if errorlevel 1 (
    echo ✗ Node.js não está instalado
    exit /b 1
)
echo ✓ Node.js encontrado: 
node --version

REM Verificar se npm está instalado
npm --version >nul 2>&1
if errorlevel 1 (
    echo ✗ npm não está instalado
    exit /b 1
)
echo ✓ npm encontrado: 
npm --version

REM Instalar dependências
echo.
echo 📦 Instalando dependências...

echo    Backend...
cd backend
call npm install
cd ..
echo ✓ Backend

echo    Frontend...
cd frontend
call npm install
cd ..
echo ✓ Frontend

REM Criar arquivo .env se não existir
echo.
echo ⚙️  Configurando ambiente...

if not exist "backend\.env" (
    copy backend\.env.example backend\.env
    echo    ⚠️  Arquivo backend\.env criado. Atualize com suas credenciais PostgreSQL
)

REM Mensagem final
echo.
echo ✓ Setup concluído com sucesso!
echo.
echo 📝 Próximos passos:
echo.
echo 1. Atualize o arquivo backend\.env com suas credenciais PostgreSQL
echo.
echo 2. Execute o setup da base de dados:
echo    cd backend ^&^& npm run db:setup ^&^& cd ..
echo.
echo 3. Inicie o backend (Terminal 1):
echo    cd backend ^&^& npm run dev
echo.
echo 4. Inicie o frontend (Terminal 2):
echo    cd frontend ^&^& npm start
echo.
echo 5. Acesse a aplicação em http://localhost:3000
echo.

pause
