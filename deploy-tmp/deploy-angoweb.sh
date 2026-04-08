#!/usr/bin/env bash
set -euo pipefail

echo "[1/7] Verificando estrutura..."
if [ ! -d "backend" ]; then
  echo "Erro: pasta backend nao encontrada."
  echo "Execute este script na raiz do projeto (onde existem backend/ e frontend/)."
  exit 1
fi

if [ ! -f "backend/package.json" ]; then
  echo "Erro: backend/package.json nao encontrado."
  exit 1
fi

echo "[2/7] Preparando .env do backend..."
if [ -f ".env.production" ] && [ ! -f "backend/.env" ]; then
  cp .env.production backend/.env
  echo "Copiado .env.production para backend/.env"
fi

if [ ! -f "backend/.env" ]; then
  echo "Aviso: backend/.env nao existe. Crie manualmente se necessario."
fi

echo "[3/7] Instalando dependencias do backend..."
cd backend
npm install --omit=dev

echo "[4/7] Preparando base de dados..."
node database/setup.js
node database/seed.js || true

cd ..

echo "[5/7] Garantindo PM2..."
if ! command -v pm2 >/dev/null 2>&1; then
  npm install -g pm2
fi

echo "[6/7] Iniciando aplicacao com PM2..."
pm2 delete rcna >/dev/null 2>&1 || true
pm2 start ./backend/server.js --name rcna --cwd "$(pwd)" --update-env
pm2 save

echo "[7/7] Deploy concluido"
echo "Verificar status: pm2 list"
echo "Ver logs: pm2 logs rcna"
