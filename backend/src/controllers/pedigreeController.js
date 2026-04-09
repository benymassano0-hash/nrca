const pool = require('../../database/pool');

const assertPedigreeAccess = async (req, res, dogIdentifier, identifierField = 'id') => {
  const dogResult = await pool.query(
    `SELECT id, breeder_id, owner_id
     FROM dogs
     WHERE ${identifierField} = $1`,
    [dogIdentifier]
  );

  if (dogResult.rows.length === 0) {
    res.status(404).json({ error: 'Cão não encontrado' });
    return null;
  }

  const dog = dogResult.rows[0];
  const isBreeder = req.user?.user_type === 'breeder';
  const hasAccess = !isBreeder || String(dog.breeder_id) === String(req.user.id) || String(dog.owner_id) === String(req.user.id);

  if (!hasAccess) {
    res.status(403).json({ error: 'Sem permissão para ver o pedigree deste cão' });
    return null;
  }

  return dog;
};

// Obter pedigree completo de um cão
const getPedigreeById = async (req, res) => {
  const { dog_id } = req.params;
  
  try {
    const dogAccess = await assertPedigreeAccess(req, res, dog_id);
    if (!dogAccess) {
      return;
    }

    const result = await pool.query(
      `SELECT d.*, 
              b.name as breed_name,
              father.name as father_name, 
              father.id as father_id,
              father.registration_id as father_registration_id,
              father.photo_url as father_photo_url,
              mother.name as mother_name,
              mother.id as mother_id,
              mother.registration_id as mother_registration_id,
              mother.photo_url as mother_photo_url,
              paternal_grandfather.name as paternal_grandfather_name,
              paternal_grandfather.registration_id as paternal_grandfather_registration_id,
              paternal_grandfather.photo_url as paternal_grandfather_photo_url,
              paternal_grandmother.name as paternal_grandmother_name,
              paternal_grandmother.registration_id as paternal_grandmother_registration_id,
              paternal_grandmother.photo_url as paternal_grandmother_photo_url,
              maternal_grandfather.name as maternal_grandfather_name,
              maternal_grandfather.registration_id as maternal_grandfather_registration_id,
              maternal_grandfather.photo_url as maternal_grandfather_photo_url,
              maternal_grandmother.name as maternal_grandmother_name,
              maternal_grandmother.registration_id as maternal_grandmother_registration_id,
              maternal_grandmother.photo_url as maternal_grandmother_photo_url
       FROM dogs d
       LEFT JOIN breeds b ON d.breed_id = b.id
       LEFT JOIN dogs father ON d.father_id = father.id
       LEFT JOIN dogs mother ON d.mother_id = mother.id
       LEFT JOIN dogs paternal_grandfather ON father.father_id = paternal_grandfather.id
       LEFT JOIN dogs paternal_grandmother ON father.mother_id = paternal_grandmother.id
       LEFT JOIN dogs maternal_grandfather ON mother.father_id = maternal_grandfather.id
       LEFT JOIN dogs maternal_grandmother ON mother.mother_id = maternal_grandmother.id
       WHERE d.id = $1`,
      [dog_id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cão não encontrado' });
    }

    const pedigree = result.rows[0];
    res.json(pedigree);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar pedigree' });
  }
};

// Obter pedigree por registration_id
const getPedigreeByRegistrationId = async (req, res) => {
  const { registration_id } = req.params;
  
  try {
    const dogAccess = await assertPedigreeAccess(req, res, registration_id, 'registration_id');
    if (!dogAccess) {
      return;
    }

    const dog_id = dogAccess.id;

    const result = await pool.query(
      `SELECT d.*, 
              b.name as breed_name,
              father.name as father_name, 
              father.id as father_id,
              father.registration_id as father_registration_id,
              father.photo_url as father_photo_url,
              mother.name as mother_name,
              mother.id as mother_id,
              mother.registration_id as mother_registration_id,
              mother.photo_url as mother_photo_url,
              paternal_grandfather.name as paternal_grandfather_name,
              paternal_grandfather.registration_id as paternal_grandfather_registration_id,
              paternal_grandfather.photo_url as paternal_grandfather_photo_url,
              paternal_grandmother.name as paternal_grandmother_name,
              paternal_grandmother.registration_id as paternal_grandmother_registration_id,
              paternal_grandmother.photo_url as paternal_grandmother_photo_url,
              maternal_grandfather.name as maternal_grandfather_name,
              maternal_grandfather.registration_id as maternal_grandfather_registration_id,
              maternal_grandfather.photo_url as maternal_grandfather_photo_url,
              maternal_grandmother.name as maternal_grandmother_name,
              maternal_grandmother.registration_id as maternal_grandmother_registration_id,
              maternal_grandmother.photo_url as maternal_grandmother_photo_url
       FROM dogs d
       LEFT JOIN breeds b ON d.breed_id = b.id
       LEFT JOIN dogs father ON d.father_id = father.id
       LEFT JOIN dogs mother ON d.mother_id = mother.id
       LEFT JOIN dogs paternal_grandfather ON father.father_id = paternal_grandfather.id
       LEFT JOIN dogs paternal_grandmother ON father.mother_id = paternal_grandmother.id
       LEFT JOIN dogs maternal_grandfather ON mother.father_id = maternal_grandfather.id
       LEFT JOIN dogs maternal_grandmother ON mother.mother_id = maternal_grandmother.id
       WHERE d.id = $1`,
      [dog_id]
    );

    const pedigree = result.rows[0];
    res.json(pedigree);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar pedigree' });
  }
};

// Obter descendentes de um cão (filhos)
const getOffspring = async (req, res) => {
  const { dog_id } = req.params;
  
  try {
    const dogAccess = await assertPedigreeAccess(req, res, dog_id);
    if (!dogAccess) {
      return;
    }

    const result = await pool.query(
      `SELECT d.*, 
              b.name as breed_name,
              u.full_name as breeder_name
       FROM dogs d
       LEFT JOIN breeds b ON d.breed_id = b.id
       LEFT JOIN users u ON d.breeder_id = u.id
       WHERE d.father_id = $1 OR d.mother_id = $1
       ORDER BY d.birth_date DESC`,
      [dog_id]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar descendentes' });
  }
};

// Validar se existe consanguinidade (mesmo ancestral em ambos os lados)
const checkConsanguinity = async (req, res) => {
  const { father_id, mother_id } = req.body;

  if (!father_id || !mother_id) {
    return res.status(400).json({ 
      error: 'father_id e mother_id são obrigatórios' 
    });
  }

  try {
    // Buscar ancestrais do pai (até 3 gerações atrás)
    const fatherAncestors = await pool.query(
      `WITH RECURSIVE ancestors AS (
        SELECT id, father_id, mother_id, 1 as generation
        FROM dogs
        WHERE id = $1
        UNION ALL
        SELECT d.id, d.father_id, d.mother_id, a.generation + 1
        FROM dogs d
        JOIN ancestors a ON (d.id = a.father_id OR d.id = a.mother_id)
        WHERE a.generation < 3
      )
      SELECT DISTINCT id FROM ancestors`,
      [father_id]
    );

    const fatherAncestorIds = fatherAncestors.rows.map(r => r.id);

    // Buscar ancestrais da mãe
    const motherAncestors = await pool.query(
      `WITH RECURSIVE ancestors AS (
        SELECT id, father_id, mother_id, 1 as generation
        FROM dogs
        WHERE id = $1
        UNION ALL
        SELECT d.id, d.father_id, d.mother_id, a.generation + 1
        FROM dogs d
        JOIN ancestors a ON (d.id = a.father_id OR d.id = a.mother_id)
        WHERE a.generation < 3
      )
      SELECT DISTINCT id FROM ancestors`,
      [mother_id]
    );

    const motherAncestorIds = motherAncestors.rows.map(r => r.id);

    // Encontrar ancestrais em comum
    const commonAncestors = fatherAncestorIds.filter(id => motherAncestorIds.includes(id));

    res.json({
      has_common_ancestry: commonAncestors.length > 0,
      common_ancestors_count: commonAncestors.length,
      common_ancestor_ids: commonAncestors,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao verificar consanguinidade' });
  }
};

// Registar pedigree base para um cão (apenas admin)
const registerPedigree = async (req, res) => {
  const { dog_id, father_id, mother_id, notes } = req.body;

  if (!dog_id || !father_id || !mother_id) {
    return res.status(400).json({
      error: 'Campos obrigatórios: dog_id, father_id, mother_id'
    });
  }

  try {
    const dogResult = await pool.query('SELECT id FROM dogs WHERE id = $1', [dog_id]);
    if (dogResult.rows.length === 0) {
      return res.status(404).json({ error: 'Cão não encontrado' });
    }

    const fatherResult = await pool.query('SELECT id FROM dogs WHERE id = $1', [father_id]);
    const motherResult = await pool.query('SELECT id FROM dogs WHERE id = $1', [mother_id]);

    if (fatherResult.rows.length === 0 || motherResult.rows.length === 0) {
      return res.status(404).json({ error: 'Pai ou mãe não encontrados' });
    }

    // Limpar registo anterior e gravar o novo pedigree básico
    await pool.query('DELETE FROM pedigrees WHERE dog_id = $1', [dog_id]);
    await pool.query(
      `INSERT INTO pedigrees (dog_id, father_id, mother_id, notes)
       VALUES ($1, $2, $3, $4)`,
      [dog_id, father_id, mother_id, notes || null]
    );

    // Tentar sincronizar pai/mãe diretamente no cão para manter consultas atuais funcionais
    try {
      await pool.query(
        `UPDATE dogs
         SET father_id = $1,
             mother_id = $2,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $3`,
        [father_id, mother_id, dog_id]
      );
    } catch (syncError) {
      // Ignorar erros de sincronização para manter compatibilidade entre esquemas.
    }

    res.status(201).json({
      message: 'Pedigree registado com sucesso',
      pedigree: {
        dog_id,
        father_id,
        mother_id,
        notes: notes || null
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao registar pedigree' });
  }
};

// Busca pública de pedigrees (sem autenticação)
const searchPublicPedigree = async (req, res) => {
  const { dog_name, dog_id, breeder_name, kennel_name } = req.query;

  // Validar que pelo menos um parâmetro foi fornecido
  if (!dog_name && !dog_id && !breeder_name && !kennel_name) {
    return res.status(400).json({
      error: 'Forneça pelo menos: dog_name (nome do cão), dog_id (ID do cão), breeder_name (nome do criador), ou kennel_name (nome do canil)'
    });
  }

  try {
    // Se é busca por canil, primeiro encontrar o utilizador com esse canil
    if (kennel_name && !dog_name && !dog_id && !breeder_name) {
      const userResult = await pool.query(
        `SELECT id, full_name, email, phone, kennel_name, city, province
         FROM users
         WHERE kennel_name ILIKE '%' || $1 || '%' AND user_type != 'viewer'`,
        [kennel_name]
      );

      if (userResult.rows.length === 0) {
        return res.json({
          message: 'Nenhum canil encontrado com esse nome',
          results: []
        });
      }

      // Para cada utilizador encontrado, buscar seus cães
      const allDogs = [];
      for (const kennelOwner of userResult.rows) {
        const dogsResult = await pool.query(
          `SELECT d.id, 
                  d.name,
                  d.registration_id,
                  d.birth_date,
                  d.gender,
                  d.color,
                  d.photo_url,
                  d.kennel_name,
                  b.name as breed_name,
                  $1::UUID as breeder_id,
                  $2::TEXT as breeder_name,
                  $3::TEXT as email,
                  $4::TEXT as phone,
                  $5::TEXT as city,
                  $6::TEXT as province,
                  father.name as father_name,
                  father.registration_id as father_registration_id,
                  father.photo_url as father_photo_url,
                  mother.name as mother_name,
                  mother.registration_id as mother_registration_id,
                  mother.photo_url as mother_photo_url
           FROM dogs d
           LEFT JOIN breeds b ON d.breed_id = b.id
           LEFT JOIN dogs father ON d.father_id = father.id
           LEFT JOIN dogs mother ON d.mother_id = mother.id
           WHERE (d.owner_id = $1 OR d.breeder_id = $1)
           ORDER BY d.created_at DESC`,
          [kennelOwner.id, kennelOwner.full_name, kennelOwner.email, kennelOwner.phone, kennelOwner.city, kennelOwner.province]
        );

        allDogs.push(...dogsResult.rows);
      }

      return res.json({
        count: allDogs.length,
        results: allDogs,
        kennelInfo: userResult.rows
      });
    }

    // Busca padrão (por nome, ID ou criador)
    let query = `
      SELECT d.id, 
             d.name,
             d.registration_id,
             d.birth_date,
             d.gender,
             d.color,
              d.photo_url,
             b.name as breed_name,
             u.full_name as breeder_name,
             u.id as breeder_id,
             u.kennel_name,
             u.email,
             u.phone,
             u.city,
             u.province,
             father.name as father_name,
             father.registration_id as father_registration_id,
              father.photo_url as father_photo_url,
             mother.name as mother_name,
              mother.registration_id as mother_registration_id,
              mother.photo_url as mother_photo_url
      FROM dogs d
      LEFT JOIN breeds b ON d.breed_id = b.id
      LEFT JOIN users u ON d.owner_id = u.id
      LEFT JOIN dogs father ON d.father_id = father.id
      LEFT JOIN dogs mother ON d.mother_id = mother.id
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 0;

    if (dog_name) {
      paramCount++;
      // Use case-insensitive search
      query += ` AND d.name ILIKE '%' || $${paramCount} || '%'`;
      params.push(dog_name);
    }

    if (dog_id) {
      paramCount++;
      query += ` AND (CAST(d.id AS TEXT) = $${paramCount} OR d.registration_id = $${paramCount})`;
      params.push(dog_id);
    }

    if (breeder_name) {
      paramCount++;
      query += ` AND u.full_name ILIKE '%' || $${paramCount} || '%'`;
      params.push(breeder_name);
    }

    query += ` ORDER BY d.created_at DESC LIMIT 50`;

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.json({
        message: 'Nenhum cão encontrado com esses critérios',
        results: []
      });
    }

    res.json({
      count: result.rows.length,
      results: result.rows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar pedigree' });
  }
};

// Obter pedigree público completo (sem autenticação)
const getPublicPedigreeDetail = async (req, res) => {
  const { dog_id } = req.params;

  try {
    const result = await pool.query(
      `SELECT d.*, 
              b.name as breed_name,
              u.full_name as breeder_name,
              u.id as breeder_id,
              father.name as father_name, 
              father.id as father_id,
              father.registration_id as father_registration_id,
              father.photo_url as father_photo_url,
              mother.name as mother_name,
              mother.id as mother_id,
              mother.registration_id as mother_registration_id,
              mother.photo_url as mother_photo_url,
              paternal_grandfather.name as paternal_grandfather_name,
              paternal_grandfather.registration_id as paternal_grandfather_registration_id,
              paternal_grandfather.photo_url as paternal_grandfather_photo_url,
              paternal_grandmother.name as paternal_grandmother_name,
              paternal_grandmother.registration_id as paternal_grandmother_registration_id,
              paternal_grandmother.photo_url as paternal_grandmother_photo_url,
              maternal_grandfather.name as maternal_grandfather_name,
              maternal_grandfather.registration_id as maternal_grandfather_registration_id,
              maternal_grandfather.photo_url as maternal_grandfather_photo_url,
              maternal_grandmother.name as maternal_grandmother_name,
              maternal_grandmother.registration_id as maternal_grandmother_registration_id,
              maternal_grandmother.photo_url as maternal_grandmother_photo_url
       FROM dogs d
       LEFT JOIN breeds b ON d.breed_id = b.id
       LEFT JOIN users u ON d.owner_id = u.id
       LEFT JOIN dogs father ON d.father_id = father.id
       LEFT JOIN dogs mother ON d.mother_id = mother.id
       LEFT JOIN dogs paternal_grandfather ON father.father_id = paternal_grandfather.id
       LEFT JOIN dogs paternal_grandmother ON father.mother_id = paternal_grandmother.id
       LEFT JOIN dogs maternal_grandfather ON mother.father_id = maternal_grandfather.id
       LEFT JOIN dogs maternal_grandmother ON mother.mother_id = maternal_grandmother.id
       WHERE d.id = $1`,
      [dog_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cão não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar pedigree' });
  }
};

module.exports = {
  getPedigreeById,
  getPedigreeByRegistrationId,
  getOffspring,
  checkConsanguinity,
  registerPedigree,
  searchPublicPedigree,
  getPublicPedigreeDetail,
};
