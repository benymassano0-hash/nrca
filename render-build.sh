#!/usr/bin/env bash
set -euo pipefail

echo "[Render build] Instalando dependencias do backend..."
cd backend
if [ -f package-lock.json ]; then
  npm ci --omit=dev --omit=optional
else
  npm install --omit=dev --omit=optional
fi

echo "[Render build] Instalando dependencias do frontend..."
cd ../frontend
if [ -f package-lock.json ]; then
  npm ci
else
  npm install
fi

echo "[Render build] Compilando frontend..."
npm run build

echo "[Render build] Build concluido"