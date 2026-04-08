const pool = require('../../database/pool');

const toTitleCase = (value) =>
  String(value || '')
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

// Listar todas as raças
const getAllBreeds = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM breeds ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar raças' });
  }
};

// Obter detalhes de uma raça
const getBreedById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM breeds WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Raça não encontrada' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar raça' });
  }
};

// Criar nova raça (apenas admin)
const createBreed = async (req, res) => {
  const { name, description, origin, characteristics, min_weight, max_weight } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Nome da raça é obrigatório' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO breeds (name, description, origin, characteristics, min_weight, max_weight)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [name, description, origin, characteristics, min_weight, max_weight]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Raça já existe' });
    }
    res.status(500).json({ error: 'Erro ao criar raça' });
  }
};

// Atualizar raça
const updateBreed = async (req, res) => {
  const { id } = req.params;
  const { name, description, origin, characteristics, min_weight, max_weight } = req.body;

  try {
    const result = await pool.query(
      `UPDATE breeds 
       SET name = COALESCE($1, name), 
           description = COALESCE($2, description),
           origin = COALESCE($3, origin),
           characteristics = COALESCE($4, characteristics),
           min_weight = COALESCE($5, min_weight),
           max_weight = COALESCE($6, max_weight)
       WHERE id = $7
       RETURNING *`,
      [name, description, origin, characteristics, min_weight, max_weight, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Raça não encontrada' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar raça' });
  }
};

// Deletar raça
const deleteBreed = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM breeds WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Raça não encontrada' });
    }
    res.json({ message: 'Raça deletada com sucesso' });
  } catch (error) {
    if (error.code === '23503') {
      return res.status(400).json({ error: 'Não é possível deletar raça com cães registados' });
    }
    res.status(500).json({ error: 'Erro ao deletar raça' });
  }
};

// Importar raças globais automaticamente (apenas admin)
const importGlobalBreeds = async (req, res) => {
  try {
    const response = await fetch('https://dog.ceo/api/breeds/list/all');
    if (!response.ok) {
      return res.status(502).json({ error: 'Falha ao consultar catálogo global de raças' });
    }

    const payload = await response.json();
    if (!payload || payload.status !== 'success' || !payload.message) {
      return res.status(502).json({ error: 'Resposta inválida do catálogo global de raças' });
    }

    const importedNames = [];
    Object.entries(payload.message).forEach(([breed, subbreeds]) => {
      const breedName = toTitleCase(breed);
      if (Array.isArray(subbreeds) && subbreeds.length > 0) {
        subbreeds.forEach((sub) => {
          importedNames.push(`${toTitleCase(sub)} ${breedName}`);
        });
      } else {
        importedNames.push(breedName);
      }
    });

    const manualBreeds = [
      'American Bully',
      'American Bull',
      'American Pit Bull Terrier',
    ];

    const uniqueImported = [...new Set([...importedNames, ...manualBreeds])]
      .sort((a, b) => a.localeCompare(b));

    const existingResult = await pool.query('SELECT name FROM breeds');
    const existingSet = new Set(
      existingResult.rows
        .map((row) => String(row.name || '').trim().toLowerCase())
        .filter(Boolean)
    );

    let inserted = 0;
    for (const name of uniqueImported) {
      const key = name.toLowerCase();
      if (existingSet.has(key)) continue;

      await pool.query(
        'INSERT INTO breeds (name, description, origin) VALUES ($1, $2, $3)',
        [
          name,
          'Raça importada automaticamente do catálogo global.',
          'Global'
        ]
      );
      existingSet.add(key);
      inserted++;
    }

    return res.json({
      message: 'Importação concluída com sucesso',
      total_source_breeds: uniqueImported.length,
      inserted,
      skipped_existing: uniqueImported.length - inserted,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro ao importar raças globais' });
  }
};

module.exports = {
  getAllBreeds,
  getBreedById,
  createBreed,
  updateBreed,
  deleteBreed,
  importGlobalBreeds,
};
