#!/usr/bin/env bash
set -euo pipefail

echo "[Render start] A preparar base de dados..."
cd backend
node database/setup.js

echo "[Render start] A executar seed inicial (idempotente)..."
node database/seed.js || echo "[Render start] Aviso: seed nao executado"

echo "[Render start] A iniciar servidor..."
exec node server.js