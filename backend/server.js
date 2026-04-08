const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Importar rotas
const breedsRoutes = require('./src/routes/breeds');
const usersRoutes = require('./src/routes/users');
const dogsRoutes = require('./src/routes/dogs');
const breedingsRoutes = require('./src/routes/breedings');
const pedigreeRoutes = require('./src/routes/pedigree');
const eventsRoutes = require('./src/routes/events');
const vaccinesRoutes = require('./src/routes/vaccines');
const settingsRoutes = require('./src/routes/settings');
const partnershipsRoutes = require('./src/routes/partnerships');

const app = express();
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

const defaultAllowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3001',
];

const allowedOrigins = process.env.FRONTEND_ORIGINS
  ? process.env.FRONTEND_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean)
  : defaultAllowedOrigins;

// Middleware
// CORS: Aceita origens configuradas por ambiente e mantém localhost para desenvolvimento.
app.use(cors({
  origin: (origin, callback) => {
    const isLocalTunnel = typeof origin === 'string' && origin.endsWith('.loca.lt');
    if (!origin || allowedOrigins.includes(origin) || isLocalTunnel) {
      return callback(null, true);
    }
    return callback(new Error(`Origem não permitida por CORS: ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const uploadsDir = path.join(__dirname, 'uploads');
const dogUploadsDir = path.join(uploadsDir, 'dogs');
if (!fs.existsSync(dogUploadsDir)) {
  fs.mkdirSync(dogUploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'RCNA Backend is running' });
});

// Rotas
app.use('/api/breeds', breedsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/dogs', dogsRoutes);
app.use('/api/breedings', breedingsRoutes);
app.use('/api/pedigree', pedigreeRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/vaccines', vaccinesRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/partnerships', partnershipsRoutes);

// Servir Frontend React (build de produção)
const frontendBuild = path.join(__dirname, '..', 'frontend', 'build');
app.use(express.static(frontendBuild));
app.get('*', (req, res) => {
  const indexFile = path.join(frontendBuild, 'index.html');
  res.sendFile(indexFile, (err) => {
    if (err) {
      // Se o build ainda não existe, retornar info útil
      res.status(200).json({ message: 'Backend RCNA online. Frontend build em falta.' });
    }
  });
});

// Rota 404 (só alcançada se nenhuma rota acima responder)
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Erro no servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Erro interno'
  });
});

app.listen(PORT, HOST, () => {
  console.log(`✓ RCNA Backend rodando na porta ${PORT}`);
  console.log(`✓ Host: ${HOST}`);
  console.log(`✓ URL Local: http://localhost:${PORT}`);
  console.log(`✓ URL Rede: http://<seu-ip>:${PORT}`);
  console.log(`✓ Origens CORS permitidas: ${allowedOrigins.join(', ')}`);
});
