const pool = require('../../database/pool');

let vaccinesSchemaPromise;
const ensureVaccinesSchema = async () => {
  if (!vaccinesSchemaPromise) {
    vaccinesSchemaPromise = (async () => {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS dog_vaccines (
          id SERIAL PRIMARY KEY,
          dog_id UUID NOT NULL REFERENCES dogs(id) ON DELETE CASCADE,
          vaccine_name VARCHAR(255) NOT NULL,
          vaccine_date DATE NOT NULL,
          next_due_date DATE,
          veterinarian_name VARCHAR(255),
          notes TEXT,
          created_by UUID REFERENCES users(id),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
    })().catch((error) => {
      vaccinesSchemaPromise = null;
      throw error;
    });
  }

  await vaccinesSchemaPromise;
};

const canAccessDog = async (user, dogId) => {
  const dogResult = await pool.query(
    'SELECT id, breeder_id, owner_id FROM dogs WHERE id = $1',
    [dogId]
  );

  if (dogResult.rows.length === 0) {
    return { allowed: false, status: 404, error: 'Cão não encontrado' };
  }

  const dog = dogResult.rows[0];
  const isBreeder = user?.user_type === 'breeder';
  const ownsDog = String(dog.breeder_id) === String(user?.id) || String(dog.owner_id) === String(user?.id);

  if (isBreeder && !ownsDog) {
    return { allowed: false, status: 403, error: 'Sem permissão para aceder ao histórico de saúde deste cão' };
  }

  return { allowed: true, dog };
};

const getVaccinesByDog = async (req, res) => {
  const { dog_id } = req.params;

  try {
    await ensureVaccinesSchema();
    const access = await canAccessDog(req.user, dog_id);
    if (!access.allowed) {
      return res.status(access.status).json({ error: access.error });
    }

    const result = await pool.query(
      `SELECT dv.*, u.full_name as created_by_name
       FROM dog_vaccines dv
       LEFT JOIN users u ON dv.created_by = u.id
       WHERE dv.dog_id = $1
       ORDER BY dv.vaccine_date DESC, dv.id DESC`,
      [dog_id]
    );

    return res.json(result.rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao buscar vacinas do cão' });
  }
};

const createVaccine = async (req, res) => {
  const {
    dog_id,
    vaccine_name,
    vaccine_date,
    next_due_date,
    veterinarian_name,
    notes,
  } = req.body;

  if (!dog_id || !vaccine_name || !vaccine_date) {
    return res.status(400).json({
      error: 'Campos obrigatórios: dog_id, vaccine_name, vaccine_date',
    });
  }

  try {
    await ensureVaccinesSchema();
    const access = await canAccessDog(req.user, dog_id);
    if (!access.allowed) {
      return res.status(access.status).json({ error: access.error });
    }

    const insertResult = await pool.query(
      `INSERT INTO dog_vaccines
       (dog_id, vaccine_name, vaccine_date, next_due_date, veterinarian_name, notes, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        dog_id,
        vaccine_name,
        vaccine_date,
        next_due_date || null,
        veterinarian_name || null,
        notes || null,
        req.user?.id || null,
      ]
    );

    let vaccine = insertResult.rows[0];
    if (!vaccine || !vaccine.id) {
      const fallback = await pool.query(
        `SELECT *
         FROM dog_vaccines
         WHERE dog_id = $1
         ORDER BY id DESC
         LIMIT 1`,
        [dog_id]
      );
      vaccine = fallback.rows[0];
    }

    return res.status(201).json(vaccine);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao registar vacina' });
  }
};

module.exports = {
  getVaccinesByDog,
  createVaccine,
};
