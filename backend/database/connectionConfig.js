require('dotenv').config();

const parseBoolean = (value, fallback = false) => {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  return String(value).trim().toLowerCase() === 'true';
};

const getSslConfig = () => {
  const useSsl = parseBoolean(process.env.DB_SSL, false);
  return useSsl ? { rejectUnauthorized: false } : false;
};

const getPgConfig = () => {
  if (process.env.DATABASE_URL) {
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: getSslConfig(),
    };
  }

  return {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'rcna',
    ssl: getSslConfig(),
  };
};

module.exports = getPgConfig;