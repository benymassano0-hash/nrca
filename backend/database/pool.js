const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();
const getPgConfig = require('./connectionConfig');

const DB_CLIENT = (process.env.DB_CLIENT || 'sqlite').toLowerCase();

const toSqliteSql = (sql) => String(sql || '').replace(/\$\d+/g, '?');

const createSqliteAdapter = () => {
  const Database = require('better-sqlite3');
  const dbFile = process.env.SQLITE_PATH || path.join(__dirname, '..', 'rcna.db');
  const db = new Database(dbFile);
  db.pragma('foreign_keys = ON');

  const execute = (sql, params = []) => {
    const normalizedSql = String(sql || '').trim();
    const sqliteSql = toSqliteSql(normalizedSql).replace(/\s+FOR\s+UPDATE\b/gi, '');
    const boundParams = (params || []).map((value) => {
      if (typeof value === 'boolean') {
        return value ? 1 : 0;
      }
      return value;
    });
    const upper = normalizedSql.toUpperCase();

    if (upper === 'BEGIN' || upper === 'BEGIN TRANSACTION') {
      db.exec('BEGIN TRANSACTION');
      return { rows: [], rowCount: 0 };
    }
    if (upper === 'COMMIT') {
      db.exec('COMMIT');
      return { rows: [], rowCount: 0 };
    }
    if (upper === 'ROLLBACK') {
      db.exec('ROLLBACK');
      return { rows: [], rowCount: 0 };
    }

    if (upper.startsWith('SELECT') || upper.startsWith('PRAGMA') || upper.includes(' RETURNING ')) {
      const stmt = db.prepare(sqliteSql);
      const rows = stmt.all(boundParams);
      return { rows, rowCount: rows.length };
    }

    const stmt = db.prepare(sqliteSql);
    const info = stmt.run(boundParams);
    return {
      rows: [],
      rowCount: Number(info.changes || 0),
      lastInsertRowid: info.lastInsertRowid,
    };
  };

  const adapter = {
    query: async (sql, params = []) => execute(sql, params),
    connect: async () => ({
      query: async (sql, params = []) => execute(sql, params),
      release: () => {},
    }),
    end: async () => db.close(),
  };

  return adapter;
};

if (DB_CLIENT === 'postgres' || DB_CLIENT === 'pg') {
  const pool = new Pool(getPgConfig());

  pool.on('error', (err) => {
    console.error('Erro na pool de conexão:', err);
  });

  module.exports = pool;
} else {
  console.log('⚠️  PostgreSQL não configurado, usando SQLite como fallback');
  module.exports = createSqliteAdapter();
}
