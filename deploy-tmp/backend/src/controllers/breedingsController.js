const pool = require('../../database/pool');

// Listar todos os cruzamentos
const getAllBreedings = async (req, res) => {
  const { breeder_id, status } = req.query;
  
  try {
    let query = `
      SELECT b.*, 
             father.name as father_name, 
             father.registration_id as father_registration_id,
             mother.name as mother_name,
             mother.registration_id as mother_registration_id,
             u.full_name as breeder_name
      FROM breedings b
      LEFT JOIN dogs father ON b.father_id = father.id
      LEFT JOIN dogs mother ON b.mother_id = mother.id
      LEFT JOIN users u ON b.breeder_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (breeder_id) {
      const baseIndex = params.length + 1;
      query += ' AND (b.breeder_id = $' + baseIndex + ' OR father.breeder_id = $' + (baseIndex + 1) + ' OR mother.breeder_id = $' + (baseIndex + 2) + ')';
      params.push(breeder_id, breeder_id, breeder_id);
    }
    if (status) {
      query += ' AND b.status = $' + (params.length + 1);
      params.push(status);
    }

    query += ' ORDER BY b.breeding_date DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar cruzamentos' });
  }
};

// Obter detalhes de um cruzamento
const getBreedingById = async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await pool.query(
      `SELECT b.*, 
              father.name as father_name, 
              father.registration_id as father_registration_id,
              mother.name as mother_name,
              mother.registration_id as mother_registration_id,
              u.full_name as breeder_name
       FROM breedings b
       LEFT JOIN dogs father ON b.father_id = father.id
       LEFT JOIN dogs mother ON b.mother_id = mother.id
       LEFT JOIN users u ON b.breeder_id = u.id
       WHERE b.id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cruzamento não encontrado' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar cruzamento' });
  }
};

// Criar novo cruzamento
const createBreeding = async (req, res) => {
  const { father_id, mother_id, breeding_date, expected_puppies_count, notes } = req.body;

  if (!father_id || !mother_id || !breeding_date) {
    return res.status(400).json({ 
      error: 'Campos obrigatórios: father_id, mother_id, breeding_date' 
    });
  }

  try {
    // Validar que pai e mãe existem e são do sexo correto
    const fatherCheck = await pool.query(
      'SELECT id, gender, breeder_id FROM dogs WHERE id = $1',
      [father_id]
    );
    const motherCheck = await pool.query(
      'SELECT id, gender, breeder_id FROM dogs WHERE id = $1',
      [mother_id]
    );

    if (fatherCheck.rows.length === 0 || fatherCheck.rows[0].gender !== 'M') {
      return res.status(400).json({ error: 'Pai inválido ou não é macho' });
    }
    if (motherCheck.rows.length === 0 || motherCheck.rows[0].gender !== 'F') {
      return res.status(400).json({ error: 'Mãe inválida ou não é fêmea' });
    }

    const fatherDog = fatherCheck.rows[0];
    const motherDog = motherCheck.rows[0];
    let breedingBreederId = req.user.id;

    if (fatherDog.breeder_id && motherDog.breeder_id && String(fatherDog.breeder_id) === String(motherDog.breeder_id)) {
      breedingBreederId = fatherDog.breeder_id;
    } else if (fatherDog.breeder_id) {
      breedingBreederId = fatherDog.breeder_id;
    } else if (motherDog.breeder_id) {
      breedingBreederId = motherDog.breeder_id;
    }

    const result = await pool.query(
      `INSERT INTO breedings 
       (father_id, mother_id, breeder_id, breeding_date, expected_puppies_count, status, notes)
       VALUES ($1, $2, $3, $4, $5, 'planned', $6)
       RETURNING *`,
      [father_id, mother_id, breedingBreederId, breeding_date, expected_puppies_count, notes]
    );

    res.status(201).json({
      ...result.rows[0],
      registration_fee_kz: 10000,
      registration_fee_label: '10.000 Kz',
      message: 'Cruzamento registado com sucesso. Taxa de registo de ninhada: 10.000 Kz.'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar cruzamento' });
  }
};

// Atualizar cruzamento
const updateBreeding = async (req, res) => {
  const { id } = req.params;
  const { status, actual_puppies_count, notes } = req.body;

  try {
    const result = await pool.query(
      `UPDATE breedings 
       SET status = COALESCE($1, status),
           actual_puppies_count = COALESCE($2, actual_puppies_count),
           notes = COALESCE($3, notes),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING *`,
      [status, actual_puppies_count, notes, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cruzamento não encontrado' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar cruzamento' });
  }
};

// Confirmação do criador sobre o cruzamento (fiz / não fiz)
const confirmBreeding = async (req, res) => {
  const { id } = req.params;
  const { confirmed, note } = req.body;

  if (typeof confirmed !== 'boolean') {
    return res.status(400).json({ error: 'Campo confirmed deve ser true ou false' });
  }

  try {
    const breedingResult = await pool.query(
      `SELECT b.id, b.breeder_id,
              father.breeder_id as father_breeder_id,
              mother.breeder_id as mother_breeder_id
       FROM breedings b
       LEFT JOIN dogs father ON b.father_id = father.id
       LEFT JOIN dogs mother ON b.mother_id = mother.id
       WHERE b.id = $1`,
      [id]
    );

    if (breedingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Cruzamento não encontrado' });
    }

    const breeding = breedingResult.rows[0];

    // Criador só pode confirmar cruzamentos onde está envolvido.
    if (req.user?.user_type === 'breeder') {
      const breederId = Number(req.user.id);
      const isInvolved = [breeding.breeder_id, breeding.father_breeder_id, breeding.mother_breeder_id]
        .filter((value) => value !== null && value !== undefined)
        .some((value) => Number(value) === breederId);

      if (!isInvolved) {
        return res.status(403).json({ error: 'Sem permissão para confirmar este cruzamento' });
      }
    }

    const nextStatus = confirmed ? 'confirmed' : 'cancelled';

    const updateResult = await pool.query(
      `UPDATE breedings
       SET breeder_confirmed = $1,
           breeder_confirmation_note = $2,
           breeder_confirmation_at = CURRENT_TIMESTAMP,
           status = $3,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4`,
      [confirmed, note || null, nextStatus, id]
    );

    if (!updateResult.rowCount) {
      return res.status(404).json({ error: 'Cruzamento não encontrado' });
    }

    const refreshed = await pool.query(
      `SELECT b.*, 
              father.name as father_name, 
              father.registration_id as father_registration_id,
              mother.name as mother_name,
              mother.registration_id as mother_registration_id,
              u.full_name as breeder_name,
              u.username as breeder_username
       FROM breedings b
       LEFT JOIN dogs father ON b.father_id = father.id
       LEFT JOIN dogs mother ON b.mother_id = mother.id
       LEFT JOIN users u ON b.breeder_id = u.id
       WHERE b.id = $1`,
      [id]
    );

    res.json({
      message: confirmed ? 'Cruzamento confirmado pelo criador' : 'Cruzamento marcado como não realizado',
      breeding: refreshed.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao confirmar cruzamento' });
  }
};

// Deletar cruzamento
const deleteBreeding = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM breedings WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cruzamento não encontrado' });
    }
    res.json({ message: 'Cruzamento deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar cruzamento' });
  }
};

module.exports = {
  getAllBreedings,
  getBreedingById,
  createBreeding,
  updateBreeding,
  confirmBreeding,
  deleteBreeding,
};
