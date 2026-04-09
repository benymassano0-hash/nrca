const pool = require('../../database/pool');

let analyticsSchemaPromise;
const ensureAnalyticsSchema = async () => {
  if (!analyticsSchemaPromise) {
    analyticsSchemaPromise = (async () => {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS app_visits (
          id SERIAL PRIMARY KEY,
          visitor_id VARCHAR(120) NOT NULL,
          page_path VARCHAR(255) NOT NULL,
          user_type VARCHAR(30),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await pool.query('CREATE INDEX IF NOT EXISTS idx_app_visits_created_at ON app_visits(created_at)');
      await pool.query('CREATE INDEX IF NOT EXISTS idx_app_visits_visitor_id ON app_visits(visitor_id)');
      await pool.query('CREATE INDEX IF NOT EXISTS idx_app_visits_path ON app_visits(page_path)');
    })().catch((error) => {
      analyticsSchemaPromise = null;
      throw error;
    });
  }

  await analyticsSchemaPromise;
};

const trackVisit = async (req, res) => {
  try {
    await ensureAnalyticsSchema();

    const visitorId = String(req.body?.visitor_id || '').trim();
    const pagePath = String(req.body?.page_path || '').trim();
    const userType = req.body?.user_type ? String(req.body.user_type).trim() : null;

    if (!visitorId || !pagePath) {
      return res.status(400).json({ error: 'visitor_id e page_path são obrigatórios' });
    }

    await pool.query(
      'INSERT INTO app_visits (visitor_id, page_path, user_type) VALUES ($1, $2, $3)',
      [visitorId.slice(0, 120), pagePath.slice(0, 255), userType ? userType.slice(0, 30) : null]
    );

    return res.status(201).json({ ok: true });
  } catch (error) {
    console.error('Erro ao registar visita:', error);
    return res.status(500).json({ error: 'Erro ao registar visita' });
  }
};

const getVisitsSummary = async (req, res) => {
  try {
    await ensureAnalyticsSchema();

    const result = await pool.query(
      'SELECT visitor_id, page_path, created_at FROM app_visits ORDER BY created_at DESC'
    );

    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    const weekMs = 7 * dayMs;

    const uniqueVisitors = new Set();
    const uniqueVisitors24h = new Set();
    let visitsLast7Days = 0;

    const byPath = {};

    for (const row of result.rows) {
      const visitorId = String(row.visitor_id || '');
      const path = String(row.page_path || '/');
      const createdAt = new Date(row.created_at).getTime();
      const age = now - createdAt;

      if (visitorId) {
        uniqueVisitors.add(visitorId);
        if (age <= dayMs) {
          uniqueVisitors24h.add(visitorId);
        }
      }

      if (age <= weekMs) {
        visitsLast7Days += 1;
      }

      byPath[path] = (byPath[path] || 0) + 1;
    }

    const topPages = Object.entries(byPath)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([path, visits]) => ({ path, visits }));

    return res.json({
      total_visits: result.rows.length,
      unique_visitors: uniqueVisitors.size,
      unique_visitors_24h: uniqueVisitors24h.size,
      visits_last_7_days: visitsLast7Days,
      top_pages: topPages,
    });
  } catch (error) {
    console.error('Erro ao obter resumo de visitas:', error);
    return res.status(500).json({ error: 'Erro ao obter resumo de visitas' });
  }
};

module.exports = {
  trackVisit,
  getVisitsSummary,
};
