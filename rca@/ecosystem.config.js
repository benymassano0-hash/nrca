// ecosystem.config.js – PM2 para Angoweb / VPS
// Usado para manter o servidor Node.js sempre activo
module.exports = {
  apps: [
    {
      name: 'rcna',
      script: './backend/server.js',
      cwd: '/home/USUARIO_ANGOWEB/public_html', // <- ajustar caminho no servidor
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
        HOST: '0.0.0.0',
      },
    },
  ],
};
