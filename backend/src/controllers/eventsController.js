const pool = require('../../database/pool');
const { v4: uuidv4 } = require('uuid');

// Obter todos os eventos publicados
exports.getPublishedEvents = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT e.*, u.full_name, u.username 
       FROM events e
       JOIN users u ON e.creator_id = u.id
       WHERE e.status = 'published' AND e.is_approved = true
       ORDER BY e.event_date DESC`
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao obter eventos:', error);
    res.status(500).json({ error: 'Erro ao obter eventos' });
  }
};

// Obter eventos do criador logado
exports.getCreatorEvents = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await pool.query(
      `SELECT * FROM events 
       WHERE creator_id = $1
       ORDER BY event_date DESC`,
      [userId]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao obter eventos do criador:', error);
    res.status(500).json({ error: 'Erro ao obter eventos' });
  }
};

// Obter um evento específico
exports.getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      `SELECT e.*, u.full_name, u.phone, u.email, u.address, u.city, u.province
       FROM events e
       JOIN users u ON e.creator_id = u.id
       WHERE e.id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Evento não encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao obter evento:', error);
    res.status(500).json({ error: 'Erro ao obter evento' });
  }
};

// Criar novo evento (criador)
exports.createEvent = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      title,
      description,
      category,
      event_date,
      event_time,
      location,
      province,
      image_url,
      video_url,
      max_attendees
    } = req.body;

    // Validações
    if (!title || !category || !event_date || !location) {
      return res.status(400).json({ error: 'Campos obrigatórios em falta' });
    }

    const id = uuidv4();
    
    const result = await pool.query(
      `INSERT INTO events (
        id, creator_id, title, description, category, 
        event_date, event_time, location, province, 
        image_url, video_url, max_attendees, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *`,
      [
        id, userId, title, description, category,
        event_date, event_time, location, province,
        image_url, video_url, max_attendees, 'draft'
      ]
    );

    res.status(201).json({
      message: 'Evento criado com sucesso! Aguardando aprovação do administrador.',
      event: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao criar evento:', error);
    res.status(500).json({ error: 'Erro ao criar evento' });
  }
};

// Atualizar evento (criador proprietário)
exports.updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const {
      title,
      description,
      category,
      event_date,
      event_time,
      location,
      province,
      image_url,
      video_url,
      max_attendees
    } = req.body;

    // Verificar propriedade do evento
    const eventCheck = await pool.query(
      'SELECT creator_id FROM events WHERE id = $1',
      [id]
    );

    if (eventCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Evento não encontrado' });
    }

    if (eventCheck.rows[0].creator_id !== userId && req.user.user_type !== 'admin') {
      return res.status(403).json({ error: 'Sem permissão para editar este evento' });
    }

    const result = await pool.query(
      `UPDATE events SET 
        title = COALESCE($2, title),
        description = COALESCE($3, description),
        category = COALESCE($4, category),
        event_date = COALESCE($5, event_date),
        event_time = COALESCE($6, event_time),
        location = COALESCE($7, location),
        province = COALESCE($8, province),
        image_url = COALESCE($9, image_url),
        video_url = COALESCE($10, video_url),
        max_attendees = COALESCE($11, max_attendees),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [id, title, description, category, event_date, event_time, location, province, image_url, video_url, max_attendees]
    );

    res.json({
      message: 'Evento atualizado com sucesso!',
      event: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao atualizar evento:', error);
    res.status(500).json({ error: 'Erro ao atualizar evento' });
  }
};

// Publicar evento (criador)
exports.publishEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verificar propriedade
    const eventCheck = await pool.query(
      'SELECT creator_id FROM events WHERE id = $1',
      [id]
    );

    if (eventCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Evento não encontrado' });
    }

    if (eventCheck.rows[0].creator_id !== userId && req.user.user_type !== 'admin') {
      return res.status(403).json({ error: 'Sem permissão' });
    }

    const result = await pool.query(
      `UPDATE events SET status = 'published' WHERE id = $1 RETURNING *`,
      [id]
    );

    res.json({
      message: 'Evento publicado! Aguardando aprovação do administrador.',
      event: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao publicar evento:', error);
    res.status(500).json({ error: 'Erro ao publicar evento' });
  }
};

// Aprovar evento (admin only)
exports.approveEvent = async (req, res) => {
  try {
    if (req.user.user_type !== 'admin') {
      return res.status(403).json({ error: 'Apenas administradores podem aprovar eventos' });
    }

    const { id } = req.params;

    const result = await pool.query(
      `UPDATE events SET is_approved = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Evento não encontrado' });
    }

    res.json({
      message: 'Evento aprovado com sucesso!',
      event: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao aprovar evento:', error);
    res.status(500).json({ error: 'Erro ao aprovar evento' });
  }
};

// Cancelar evento (criador ou admin)
exports.cancelEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const eventCheck = await pool.query(
      'SELECT creator_id FROM events WHERE id = $1',
      [id]
    );

    if (eventCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Evento não encontrado' });
    }

    if (eventCheck.rows[0].creator_id !== userId && req.user.user_type !== 'admin') {
      return res.status(403).json({ error: 'Sem permissão para cancelar este evento' });
    }

    const result = await pool.query(
      `UPDATE events SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
      [id]
    );

    res.json({
      message: 'Evento cancelado com sucesso!',
      event: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao cancelar evento:', error);
    res.status(500).json({ error: 'Erro ao cancelar evento' });
  }
};

// Obter eventos pendentes de aprovação (admin)
exports.getPendingEvents = async (req, res) => {
  try {
    if (req.user.user_type !== 'admin') {
      return res.status(403).json({ error: 'Apenas administradores podem ver eventos pendentes' });
    }

    const result = await pool.query(
      `SELECT e.*, u.full_name, u.username 
       FROM events e
       JOIN users u ON e.creator_id = u.id
       WHERE e.is_approved = false AND e.status = 'published'
       ORDER BY e.created_at ASC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao obter eventos pendentes:', error);
    res.status(500).json({ error: 'Erro ao obter eventos pendentes' });
  }
};

// Deletar evento (criador ou admin)
exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const eventCheck = await pool.query(
      'SELECT creator_id FROM events WHERE id = $1',
      [id]
    );

    if (eventCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Evento não encontrado' });
    }

    if (eventCheck.rows[0].creator_id !== userId && req.user.user_type !== 'admin') {
      return res.status(403).json({ error: 'Sem permissão para deletar este evento' });
    }

    await pool.query('DELETE FROM events WHERE id = $1', [id]);

    res.json({ message: 'Evento deletado com sucesso!' });
  } catch (error) {
    console.error('Erro ao deletar evento:', error);
    res.status(500).json({ error: 'Erro ao deletar evento' });
  }
};
