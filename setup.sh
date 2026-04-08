#!/bin/bash

# RCNA - Script de setup inicial

echo "🐕 RCNA - Registro de Cães da Angola"
echo "====================================="
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Verificar se Node.js está instalado
echo "📋 Verificando pré-requisitos..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js não está instalado${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js encontrado: $(node -v)${NC}"

# 2. Verificar se PostgreSQL está instalado
if ! command -v psql &> /dev/null; then
    echo -e "${RED}✗ PostgreSQL não está instalado${NC}"
    exit 1
fi
echo -e "${GREEN}✓ PostgreSQL encontrado${NC}"

# 3. Instalar dependências
echo ""
echo "📦 Instalando dependências..."

echo "   Backend..."
cd backend
npm install > /dev/null 2>&1
cd ..
echo -e "   ${GREEN}✓ Backend${NC}"

echo "   Frontend..."
cd frontend
npm install > /dev/null 2>&1
cd ..
echo -e "   ${GREEN}✓ Frontend${NC}"

# 4. Criar arquivo .env se não existir
echo ""
echo "⚙️  Configurando ambiente..."

if [ ! -f backend/.env ]; then
    cp backend/.env.example backend/.env
    echo -e "   ${YELLOW}⚠ Arquivo backend/.env criado. Atualize com suas credenciais PostgreSQL${NC}"
fi

# 5. Mensagem final
echo ""
echo -e "${GREEN}✓ Setup concluído com sucesso!${NC}"
echo ""
echo "📝 Próximos passos:"
echo ""
echo "1. Atualize o arquivo backend/.env com suas credenciais PostgreSQL"
echo ""
echo "2. Execute o setup da base de dados:"
echo "   cd backend && npm run db:setup && cd .."
echo ""
echo "3. Inicie o backend (Terminal 1):"
echo "   cd backend && npm run dev"
echo ""
echo "4. Inicie o frontend (Terminal 2):"
echo "   cd frontend && npm start"
echo ""
echo "5. Acesse a aplicação em http://localhost:3000"
echo ""
