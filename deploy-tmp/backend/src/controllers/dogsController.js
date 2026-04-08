const pool = require('../../database/pool');
const { generateRegistrationId } = require('../utils/generators');
const path = require('path');
const fs = require('fs');
const QRCode = require('qrcode');

const qrDir = path.join(__dirname, '..', '..', 'uploads', 'qrcodes');
if (!fs.existsSync(qrDir)) {
  fs.mkdirSync(qrDir, { recursive: true });
}

// Listar todos os cães
const getAllDogs = async (req, res) => {
  const { breed_id, breeder_id } = req.query;
  
  try {
    let query = `
      SELECT d.*, 
             b.name as breed_name,
             u.full_name as breeder_name,
             father.name as father_name,
             mother.name as mother_name
      FROM dogs d
      LEFT JOIN breeds b ON d.breed_id = b.id
      LEFT JOIN users u ON d.breeder_id = u.id
      LEFT JOIN dogs father ON d.father_id = father.id
      LEFT JOIN dogs mother ON d.mother_id = mother.id
      WHERE 1=1
    `;
    const params = [];

    if (breed_id) {
      query += ' AND d.breed_id = $' + (params.length + 1);
      params.push(breed_id);
    }
    if (breeder_id) {
      query += ' AND d.breeder_id = $' + (params.length + 1);
      params.push(breeder_id);
    }

    query += ' ORDER BY d.created_at DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar cães' });
  }
};

// Obter detalhes de um cão por ID único
const getDogById = async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await pool.query(
      `SELECT d.*, 
              b.name as breed_name,
              u.full_name as breeder_name,
              father.name as father_name,
              mother.name as mother_name
       FROM dogs d
       LEFT JOIN breeds b ON d.breed_id = b.id
       LEFT JOIN users u ON d.breeder_id = u.id
       LEFT JOIN dogs father ON d.father_id = father.id
       LEFT JOIN dogs mother ON d.mother_id = mother.id
       WHERE d.id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cão não encontrado' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar cão' });
  }
};

// Buscar cão por ID de Registro (registration_id)
const getDogByRegistrationId = async (req, res) => {
  const { registration_id } = req.params;
  
  try {
    const result = await pool.query(
      `SELECT d.*, 
              b.name as breed_name,
              u.full_name as breeder_name,
              father.name as father_name,
              mother.name as mother_name
       FROM dogs d
       LEFT JOIN breeds b ON d.breed_id = b.id
       LEFT JOIN users u ON d.breeder_id = u.id
       LEFT JOIN dogs father ON d.father_id = father.id
       LEFT JOIN dogs mother ON d.mother_id = mother.id
       WHERE d.registration_id = $1`,
      [registration_id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cão não encontrado' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar cão' });
  }
};

// Obter próximo ID de registo para pré-visualização no formulário
const getNextRegistrationId = async (req, res) => {
  try {
    const registration_id = await generateRegistrationId(null, pool);
    res.json({ registration_id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao gerar próximo ID de registo' });
  }
};

// Criar novo cão
const createDog = async (req, res) => {
  const { name, breed_id, birth_date, gender, color, microchip_id, 
          father_id, mother_id, health_status, notes, breeder_name } = req.body;
  const photo_url = req.file ? `/uploads/dogs/${req.file.filename}` : null;

  if (!name || !breed_id || !gender) {
    return res.status(400).json({ error: 'Campos obrigatórios: name, breed_id, gender' });
  }

  try {
    let breeder;

    if (req.user?.user_type === 'breeder') {
      const settingsResult = await pool.query(
        `SELECT setting_value
         FROM system_settings
         WHERE setting_key = $1
         LIMIT 1`,
        ['breeders_can_register_dogs']
      );

      const globalEnabled = settingsResult.rows[0]?.setting_value === 'true';
      if (!globalEnabled) {
        return res.status(403).json({ error: 'Registo de cães para criadores está desligado pelo administrador.' });
      }

      const requesterResult = await pool.query(
        `SELECT id, full_name, username, is_active
         FROM users
         WHERE id = $1 AND user_type = 'breeder'
         LIMIT 1`,
        [req.user.id]
      );

      if (requesterResult.rows.length === 0) {
        return res.status(403).json({ error: 'Conta de criador não encontrada.' });
      }

      const requester = requesterResult.rows[0];
      if (Number(requester.is_active) === 0) {
        return res.status(403).json({ error: 'A sua conta de criador está desligada para registo. Contacte o administrador.' });
      }

      breeder = requester;
    } else {
      if (!String(breeder_name || '').trim()) {
        return res.status(400).json({ error: 'Campos obrigatórios: breeder_name' });
      }

      const breederInput = String(breeder_name).trim();
      const breederNameNormalized = breederInput.toLowerCase();
      let breederResult = await pool.query(
        `SELECT id, full_name, username
         FROM users
         WHERE user_type IN ('breeder', 'admin')
           AND (
             LOWER(COALESCE(full_name, '')) = $1
              OR LOWER(COALESCE(username, '')) = $2
             OR LOWER(COALESCE(email, '')) = $3
           )
         LIMIT 1`,
        [breederNameNormalized, breederNameNormalized, breederNameNormalized]
      );

      // Fallback tolerante: permite procura parcial por nome/username/email.
      if (breederResult.rows.length === 0) {
        const likeTerm = `%${breederNameNormalized}%`;
        const fallbackResult = await pool.query(
          `SELECT id, full_name, username
           FROM users
           WHERE user_type IN ('breeder', 'admin')
             AND (
               LOWER(COALESCE(full_name, '')) LIKE $1
               OR LOWER(COALESCE(username, '')) LIKE $2
               OR LOWER(COALESCE(email, '')) LIKE $3
             )
           ORDER BY id ASC
           LIMIT 5`,
          [likeTerm, likeTerm, likeTerm]
        );

        if (fallbackResult.rows.length === 1) {
          breederResult = { rows: [fallbackResult.rows[0]] };
        } else if (fallbackResult.rows.length > 1) {
          return res.status(400).json({
            error: `Foram encontrados vários criadores para "${breederInput}". Use o username exato: ${fallbackResult.rows
              .map((candidate) => candidate.username)
              .filter(Boolean)
              .join(', ')}`,
          });
        }
      }

      if (breederResult.rows.length === 0) {
        return res.status(404).json({ error: 'Criador não encontrado. Informe o nome de criador registado.' });
      }

      breeder = breederResult.rows[0];
    }

    // Gerar ID de registro
    const registration_id = await generateRegistrationId(null, pool);

    let qrCodeUrl = null;
    try {
      const qrPayload = JSON.stringify({
        registration_id,
        name,
        breeder_id: breeder.id,
      });
      const qrFileName = `${registration_id}.png`;
      const qrPath = path.join(qrDir, qrFileName);
      await QRCode.toFile(qrPath, qrPayload, {
        margin: 1,
        width: 320,
      });
      qrCodeUrl = `/uploads/qrcodes/${qrFileName}`;
    } catch (qrError) {
      console.error('Erro ao gerar QR code:', qrError.message);
    }

    const result = await pool.query(
      `INSERT INTO dogs 
       (registration_id, name, breed_id, birth_date, gender, color, microchip_id, 
        father_id, mother_id, breeder_id, owner_id, health_status, notes, photo_url, qr_code_url)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
       RETURNING *`,
      [registration_id, name, breed_id, birth_date, gender, color, microchip_id, 
       father_id, mother_id, breeder.id, breeder.id, health_status, notes, photo_url, qrCodeUrl]
    );

    // Fallback para SQLite wrapper quando RETURNING não devolve a linha completa.
    let createdDog = result.rows[0];
    if (!createdDog || !createdDog.registration_id) {
      const createdResult = await pool.query(
        'SELECT * FROM dogs WHERE registration_id = $1',
        [registration_id]
      );
      createdDog = createdResult.rows[0];
    }

    res.status(201).json({
      ...createdDog,
      registration_fee_kz: 10000,
      registration_fee_label: '10.000 Kz',
      message: 'Cão registado com sucesso. Taxa de registo de cão: 10.000 Kz.'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar cão' });
  }
};

// Atualizar cão
const updateDog = async (req, res) => {
  const { id } = req.params;
  const { name, breed_id, birth_date, gender, color, microchip_id, 
          father_id, mother_id, health_status, notes } = req.body;
  const photo_url = req.file ? `/uploads/dogs/${req.file.filename}` : null;

  try {
    const dogCheck = await pool.query(
      'SELECT id, breeder_id, owner_id FROM dogs WHERE id = $1',
      [id]
    );

    if (dogCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Cão não encontrado' });
    }

    const dog = dogCheck.rows[0];
    const isBreeder = req.user?.user_type === 'breeder';
    const breederOwnsDog = String(dog.breeder_id) === String(req.user?.id) || String(dog.owner_id) === String(req.user?.id);
    if (isBreeder && !breederOwnsDog) {
      return res.status(403).json({ error: 'Sem permissão para editar este cão' });
    }

    const updateResult = await pool.query(
      `UPDATE dogs 
       SET name = COALESCE($1, name),
           breed_id = COALESCE($2, breed_id),
           birth_date = COALESCE($3, birth_date),
           gender = COALESCE($4, gender),
           color = COALESCE($5, color),
           microchip_id = COALESCE($6, microchip_id),
           father_id = COALESCE($7, father_id),
           mother_id = COALESCE($8, mother_id),
           health_status = COALESCE($9, health_status),
           notes = COALESCE($10, notes),
             photo_url = COALESCE($11, photo_url),
           updated_at = CURRENT_TIMESTAMP
           WHERE id = $12`,
      [name, breed_id, birth_date, gender, color, microchip_id, 
           father_id, mother_id, health_status, notes, photo_url, id]
    );

    if (!updateResult.rowCount) {
      return res.status(404).json({ error: 'Cão não encontrado' });
    }

    const refreshed = await pool.query(
      `SELECT d.*, 
              b.name as breed_name,
              u.full_name as breeder_name,
              father.name as father_name,
              mother.name as mother_name
       FROM dogs d
       LEFT JOIN breeds b ON d.breed_id = b.id
       LEFT JOIN users u ON d.breeder_id = u.id
       LEFT JOIN dogs father ON d.father_id = father.id
       LEFT JOIN dogs mother ON d.mother_id = mother.id
       WHERE d.id = $1`,
      [id]
    );

    res.json(refreshed.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar cão' });
  }
};

// Deletar cão
const deleteDog = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM dogs WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cão não encontrado' });
    }
    res.json({ message: 'Cão deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar cão' });
  }
};

// Transferir cão para outro criador
const transferDog = async (req, res) => {
  const { dog_id, new_breeder_id } = req.body;
  const current_user_id = req.user.id;
  const current_user_type = req.user.user_type;

  if (!dog_id || !new_breeder_id) {
    return res.status(400).json({ error: 'Campos obrigatórios: dog_id, new_breeder_id' });
  }

  try {
    // Verificar que o cão existe e que o utilizador atual é o criador
    const dogCheck = await pool.query(
      'SELECT * FROM dogs WHERE id = $1',
      [dog_id]
    );

    if (dogCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Cão não encontrado' });
    }

    const dog = dogCheck.rows[0];
    const canTransferAnyDog = current_user_type === 'admin' || current_user_type === 'registration_agent';
    if (!canTransferAnyDog && String(dog.breeder_id) !== String(current_user_id)) {
      return res.status(403).json({ error: 'Apenas o criador atual pode fazer a transferência' });
    }

    // Verificar que o novo criador existe
    const newBreederCheck = await pool.query(
      'SELECT id, full_name FROM users WHERE id = $1 AND user_type IN (\'breeder\', \'admin\')',
      [new_breeder_id]
    );

    if (newBreederCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Novo criador não encontrado ou não é um criador válido' });
    }

    // Atualizar criador e dono para refletir a transferência em todas as consultas
    const result = await pool.query(
      `UPDATE dogs 
       SET breeder_id = $1,
           owner_id = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING id`,
      [new_breeder_id, new_breeder_id, dog_id]
    );

    if ((result.rowCount || result.rows.length) === 0) {
      return res.status(500).json({ error: 'Erro ao atualizar transferência' });
    }

    const oldBreederResult = await pool.query(
      'SELECT full_name FROM users WHERE id = $1',
      [dog.breeder_id]
    );
    const oldBreederName = oldBreederResult.rows[0]?.full_name || 'Criador anterior';

    const updatedDogResult = await pool.query(
      'SELECT id, name, registration_id, updated_at FROM dogs WHERE id = $1',
      [dog_id]
    );
    const updatedDog = updatedDogResult.rows[0];

    await pool.query(
      `INSERT INTO dog_transfers
       (dog_id, old_breeder_id, new_breeder_id, transferred_by, transfer_fee_kz)
       VALUES ($1, $2, $3, $4, $5)`,
      [dog_id, dog.breeder_id || null, new_breeder_id, current_user_id, 5000]
    );

    res.json({
      message: 'Cão transferido com sucesso. Taxa aplicável: 5.000 Kz.',
      transfer_fee_kz: 5000,
      transfer: {
        id: updatedDog?.id || dog_id,
        name: updatedDog?.name || dog.name,
        dog_name: updatedDog?.name || dog.name,
        registration_id: updatedDog?.registration_id,
        old_breeder_name: oldBreederName,
        new_breeder_name: newBreederCheck.rows[0].full_name,
        updated_at: updatedDog?.updated_at || new Date().toISOString(),
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao transferir cão' });
  }
};

// Obter visão do criador: cães transferidos para ele + cães atuais no canil
const getBreederTransferOverview = async (req, res) => {
  if (req.user?.user_type !== 'breeder') {
    return res.status(403).json({ error: 'Apenas criadores podem aceder a esta visão' });
  }

  try {
    const breederId = req.user.id;

    const [receivedTransfersResult, kennelDogsResult] = await Promise.all([
      pool.query(
        `SELECT dt.id,
                dt.created_at as transfer_date,
                dt.transfer_fee_kz,
                d.id as dog_id,
                d.name as dog_name,
                d.registration_id,
                d.gender,
                b.name as breed_name,
                old_u.full_name as old_breeder_name,
                old_u.username as old_breeder_username,
                trans_u.full_name as transferred_by_name,
                trans_u.username as transferred_by_username
         FROM dog_transfers dt
         JOIN dogs d ON dt.dog_id = d.id
         LEFT JOIN breeds b ON d.breed_id = b.id
         LEFT JOIN users old_u ON dt.old_breeder_id = old_u.id
         LEFT JOIN users trans_u ON dt.transferred_by = trans_u.id
         WHERE dt.new_breeder_id = $1
         ORDER BY dt.created_at DESC`,
        [breederId]
      ),
      pool.query(
        `SELECT d.id,
                d.name,
                d.registration_id,
                d.gender,
                d.birth_date,
                d.color,
                d.created_at,
                b.name as breed_name
         FROM dogs d
         LEFT JOIN breeds b ON d.breed_id = b.id
         WHERE d.breeder_id = $1
         ORDER BY d.created_at DESC`,
        [breederId]
      ),
    ]);

    res.json({
      received_transfers: receivedTransfersResult.rows,
      kennel_dogs: kennelDogsResult.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao carregar visão de transferências do criador' });
  }
};

// Obter criadores disponíveis (para o dropdown de transferência)
const getAvailableBreeders = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, full_name, email 
       FROM users 
       WHERE user_type IN ('breeder', 'admin') 
       AND id != $1
       ORDER BY full_name`,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar criadores' });
  }
};

module.exports = {
  getAllDogs,
  getDogById,
  getDogByRegistrationId,
  getNextRegistrationId,
  createDog,
  updateDog,
  deleteDog,
  transferDog,
  getAvailableBreeders,
  getBreederTransferOverview,
};
