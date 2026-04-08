const pool = require('../../database/pool');
const { v4: uuidv4 } = require('uuid');

// ─── Listar todos os criadores verificados (para pesquisa) ───────────────────
exports.getBreeders = async (req, res) => {
  try {
    const myId = req.user.id;
    const result = await pool.query(
      `SELECT id, username, full_name, kennel_name, city, province
       FROM users
       WHERE user_type = 'breeder'
         AND is_verified = TRUE
         AND is_active = TRUE
         AND id != $1
       ORDER BY full_name ASC`,
      [myId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar criadores:', error);
    res.status(500).json({ error: 'Erro ao listar criadores' });
  }
};

// ─── Listar minhas parcerias (activas + pedidos pendentes) ───────────────────
exports.getMyPartnerships = async (req, res) => {
  try {
    const myId = req.user.id;
    const result = await pool.query(
      `SELECT
         p.id,
         p.status,
         p.message,
         p.created_at,
         p.updated_at,
         CASE WHEN p.requester_id = $1 THEN 'sent' ELSE 'received' END AS direction,
         CASE WHEN p.requester_id = $1 THEN addr.id ELSE req.id END AS partner_id,
         CASE WHEN p.requester_id = $1 THEN addr.username ELSE req.username END AS partner_username,
         CASE WHEN p.requester_id = $1 THEN addr.full_name ELSE req.full_name END AS partner_full_name,
         CASE WHEN p.requester_id = $1 THEN addr.kennel_name ELSE req.kennel_name END AS partner_kennel,
         CASE WHEN p.requester_id = $1 THEN addr.city ELSE req.city END AS partner_city,
         CASE WHEN p.requester_id = $1 THEN addr.province ELSE req.province END AS partner_province
       FROM kennel_partnerships p
       JOIN users req ON req.id = p.requester_id
       JOIN users addr ON addr.id = p.addressee_id
       WHERE (p.requester_id = $1 OR p.addressee_id = $1)
         AND p.status != 'rejected'
       ORDER BY p.updated_at DESC`,
      [myId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar parcerias:', error);
    res.status(500).json({ error: 'Erro ao listar parcerias' });
  }
};

// ─── Enviar pedido de parceria ───────────────────────────────────────────────
exports.requestPartnership = async (req, res) => {
  try {
    const requesterId = req.user.id;
    const { addressee_id, message } = req.body;

    if (!addressee_id) {
      return res.status(400).json({ error: 'ID do destinatário é obrigatório' });
    }
    if (requesterId === addressee_id) {
      return res.status(400).json({ error: 'Não pode enviar parceria para si próprio' });
    }

    // Verificar se o destinatário existe e é criador verificado
    const targetRes = await pool.query(
      `SELECT id FROM users WHERE id = $1 AND user_type = 'breeder' AND is_verified = TRUE`,
      [addressee_id]
    );
    if (targetRes.rows.length === 0) {
      return res.status(404).json({ error: 'Criador não encontrado ou não verificado' });
    }

    // Verificar se já existe uma parceria entre os dois (em qualquer direcção)
    const existing = await pool.query(
      `SELECT id, status FROM kennel_partnerships
       WHERE (requester_id = $1 AND addressee_id = $2)
          OR (requester_id = $2 AND addressee_id = $1)`,
      [requesterId, addressee_id]
    );
    if (existing.rows.length > 0) {
      const st = existing.rows[0].status;
      if (st === 'accepted') return res.status(409).json({ error: 'Parceria já activa' });
      if (st === 'pending') return res.status(409).json({ error: 'Pedido de parceria já enviado' });
      // se rejected, permite re-envio: apaga o registo antigo e cria novo
      await pool.query(`DELETE FROM kennel_partnerships WHERE id = $1`, [existing.rows[0].id]);
    }

    const id = uuidv4();
    const result = await pool.query(
      `INSERT INTO kennel_partnerships (id, requester_id, addressee_id, status, message)
       VALUES ($1, $2, $3, 'pending', $4)
       RETURNING *`,
      [id, requesterId, addressee_id, message || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao enviar pedido de parceria:', error);
    res.status(500).json({ error: 'Erro ao enviar pedido de parceria' });
  }
};

// ─── Aceitar pedido de parceria ──────────────────────────────────────────────
exports.acceptPartnership = async (req, res) => {
  try {
    const myId = req.user.id;
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE kennel_partnerships
       SET status = 'accepted', updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND addressee_id = $2 AND status = 'pending'
       RETURNING *`,
      [id, myId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pedido não encontrado ou sem permissão' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao aceitar parceria:', error);
    res.status(500).json({ error: 'Erro ao aceitar parceria' });
  }
};

// ─── Recusar / cancelar / desfazer parceria ──────────────────────────────────
exports.removePartnership = async (req, res) => {
  try {
    const myId = req.user.id;
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM kennel_partnerships
       WHERE id = $1
         AND (requester_id = $2 OR addressee_id = $2)
       RETURNING id`,
      [id, myId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Parceria não encontrada ou sem permissão' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao remover parceria:', error);
    res.status(500).json({ error: 'Erro ao remover parceria' });
  }
};
