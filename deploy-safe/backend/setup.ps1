# Script de Setup Automático do RCNA
# Executar com: powershell -ExecutionPolicy Bypass -File setup.ps1

Write-Host "╔════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  RCNA - Setup Automático              ║" -ForegroundColor Cyan
Write-Host "║  Registro de Cães da Angola           ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Verificar se PostgreSQL está instalado
Write-Host "🔍 Verificando PostgreSQL..." -ForegroundColor Yellow
$psqlExists = Get-Command psql -ErrorAction SilentlyContinue

if (-not $psqlExists) {
    Write-Host "❌ PostgreSQL não está instalado!" -ForegroundColor Red
    Write-Host "📥 Descarregue em: https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
    Read-Host "Pressione ENTER quando instalado para continuar"
}

# Criar base de dados
Write-Host "📊 Criando base de dados RCNA..." -ForegroundColor Yellow
try {
    psql -U postgres -c "CREATE DATABASE rcna;" 2>$null
    Write-Host "✅ Base de dados criada/verificada" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Erro ao criar base de dados (pode já existir)" -ForegroundColor Yellow
}

# Correr setup
Write-Host "`n🏗️  Criando tabelas..." -ForegroundColor Yellow
Set-Location "c:\Users\josé massano\bb\RCNA\backend"
npm run db:setup
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Tabelas criadas com sucesso" -ForegroundColor Green
} else {
    Write-Host "❌ Erro ao criar tabelas" -ForegroundColor Red
    exit 1
}

# Correr seed
Write-Host "`n🌱 Alimentando base de dados..." -ForegroundColor Yellow
npm run db:seed
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Base de dados alimentada com sucesso" -ForegroundColor Green
} else {
    Write-Host "❌ Erro ao alimentar base de dados" -ForegroundColor Red
    exit 1
}

Write-Host "`n╔════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  ✅ Setup Completo!                   ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Green

Write-Host "`n🚀 Próximas Passos:" -ForegroundColor Cyan
Write-Host "`n1️⃣  Abra Terminal 1 e execute:" -ForegroundColor White
Write-Host "   cd `"c:\Users\josé massano\bb\RCNA\backend`"" -ForegroundColor Yellow
Write-Host "   npm run dev" -ForegroundColor Yellow

Write-Host "`n2️⃣  Abra Terminal 2 e execute:" -ForegroundColor White
Write-Host "   cd `"c:\Users\josé massano\bb\RCNA\frontend`"" -ForegroundColor Yellow
Write-Host "   npm start" -ForegroundColor Yellow

Write-Host "`n3️⃣  Abra navegador em:" -ForegroundColor White
Write-Host "   http://localhost:3000/login" -ForegroundColor Cyan

Write-Host "`n4️⃣  Clique em 'Mostrar Credenciais de Teste'" -ForegroundColor White
Write-Host "   e escolha uma conta para testar!" -ForegroundColor White

Write-Host "`n" -ForegroundColor White
Read-Host "Pressione ENTER para sair"
