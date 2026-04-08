const pool = require('../../database/pool');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const ONLY_LOGIN_IDENTIFIER = (process.env.ONLY_LOGIN_IDENTIFIER || 'massano').trim().toLowerCase();
const ONLY_LOGIN_EMAIL = (process.env.ONLY_LOGIN_EMAIL || 'benymassano0@gmail.com').trim().toLowerCase();
const ONLY_LOGIN_PIN = process.env.ONLY_LOGIN_PIN || '912345';
const AGENT_USER_TYPE = 'registration_agent';
const normalizeIdentity = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
const ONLY_LOGIN_IDENTIFIER_NORMALIZED = normalizeIdentity(ONLY_LOGIN_IDENTIFIER);
const ADMIN_LOGIN_ALIASES = [
  ONLY_LOGIN_IDENTIFIER_NORMALIZED,
  normalizeIdentity(ONLY_LOGIN_EMAIL),
  'massano',
  'admin',
  'admin massano',
];

// Registar novo utilizador (auto-registo público — apenas criadores)
const registerUser = async (req, res) => {
  const { username, email, password, full_name, phone, address, city, province } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({
      error: 'Campos obrigatórios: username, email, password'
    });
  }

  try {
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Utilizador ou email já existe' });
    }

    const password_hash = await bcrypt.hash(password, 10);

    // Auto-verificar criadores: is_verified = 1 para acesso imediato
    const result = await pool.query(
      `INSERT INTO users
       (username, email, password_hash, full_name, phone, address, city, province, user_type, is_verified)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'breeder', 1)
       RETURNING id, username, email, full_name, user_type, created_at`,
      [username, email, password_hash, full_name || username, phone, address, city, province]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao registar utilizador' });
  }
};

// Login
const loginUser = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ 
      error: 'Utilizador e password são obrigatórios' 
    });
  }

  try {
    // Login do admin principal (José Massano)
    const normalizedIdentifier = normalizeIdentity(username);
    if (ADMIN_LOGIN_ALIASES.includes(normalizedIdentifier)) {
      if (password !== ONLY_LOGIN_PIN) {
        return res.status(401).json({ error: 'PIN inválido' });
      }

      const result = await pool.query(
        `SELECT *
         FROM users
         WHERE LOWER(username) LIKE '%massano%'
            OR LOWER(full_name) LIKE '%massano%'
         ORDER BY id ASC
         LIMIT 20`
      );

      let user = result.rows.find((candidate) => {
        const candidateUsername = normalizeIdentity(candidate.username);
        const candidateFullName = normalizeIdentity(candidate.full_name);
        return (
          candidateUsername === ONLY_LOGIN_IDENTIFIER_NORMALIZED ||
          candidateFullName === ONLY_LOGIN_IDENTIFIER_NORMALIZED
        );
      });

      if (!user) {
        const bootstrapPasswordHash = await bcrypt.hash(ONLY_LOGIN_PIN, 10);
        const bootstrapResult = await pool.query(
          `INSERT INTO users
           (username, email, password_hash, full_name, user_type, is_verified)
           VALUES ($1, $2, $3, $4, 'admin', 1)
           RETURNING *`,
          [ONLY_LOGIN_IDENTIFIER, ONLY_LOGIN_EMAIL, bootstrapPasswordHash, 'Massano']
        );
        user = bootstrapResult.rows[0];
      }

      await pool.query(
        `UPDATE users
         SET is_verified = 1,
             user_type = 'admin',
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [user.id]
      );

      const token = jwt.sign(
        {
          id: user.id,
          username: user.username,
          email: user.email,
          user_type: 'admin'
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          full_name: user.full_name,
          user_type: 'admin',
        },
      });
    }

    // Login de agentes de registo
    const usernameLower = String(username).trim().toLowerCase();
    const agentResult = await pool.query(
      'SELECT * FROM users WHERE LOWER(username) = $1 OR LOWER(email) = $2 LIMIT 1',
      [usernameLower, usernameLower]
    );

    if (agentResult.rows.length === 0) {
      return res.status(401).json({ error: 'Utilizador ou palavra-passe inválidos' });
    }

    const user = agentResult.rows[0];

    if (![AGENT_USER_TYPE, 'admin', 'breeder'].includes(user.user_type)) {
      return res.status(403).json({
        error: 'Tipo de conta sem permissão para fazer login.'
      });
    }

    if ((user.user_type === AGENT_USER_TYPE || user.user_type === 'breeder') && !user.is_verified) {
      return res.status(403).json({ error: 'Conta pendente de aprovação.' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash || '');
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Utilizador ou palavra-passe inválidos' });
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        user_type: user.user_type
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        user_type: user.user_type,
        is_active: user.is_active,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
};

// Criar criador (apenas admin)
const createBreederByAdmin = async (req, res) => {
  const { username, email, password, full_name, phone, address, city, province } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({
      error: 'Campos obrigatórios: username, email, password'
    });
  }

  try {
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Utilizador ou email já existe' });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users
       (username, email, password_hash, full_name, phone, address, city, province, user_type, is_verified)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'breeder', 1)
       RETURNING id, username, email, full_name, user_type, is_verified, created_at`,
      [username, email, password_hash, full_name, phone, address, city, province]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar criador' });
  }
};

// Criar agente de registo (apenas admin)
const createRegistrationAgentByAdmin = async (req, res) => {
  const { username, email, password, full_name, phone, address, city, province } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({
      error: 'Campos obrigatórios: username, email, password'
    });
  }

  try {
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Utilizador ou email já existe' });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users
       (username, email, password_hash, full_name, phone, address, city, province, user_type, is_verified, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 1, $10)
       RETURNING id, username, email, full_name, user_type, is_verified, created_at`,
      [username, email, password_hash, full_name, phone, address, city, province, AGENT_USER_TYPE, req.user.id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar agente de registo' });
  }
};

// Estatísticas mensais de pessoas registadas por agente (admin)
const getAgentsMonthlyStats = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT creator.id as agent_id,
              creator.username as agent_username,
              creator.full_name as agent_full_name,
              strftime('%Y-%m', u.created_at) as month,
              COUNT(*) as registrations
       FROM users u
       JOIN users creator ON u.created_by = creator.id
       WHERE creator.user_type = 'registration_agent'
         AND u.user_type IN ('breeder', 'viewer')
       GROUP BY creator.id, creator.username, creator.full_name, month
       ORDER BY month DESC, registrations DESC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas mensais dos agentes' });
  }
};

// Estatísticas mensais do próprio agente
const getMyMonthlyStats = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT strftime('%Y-%m', created_at) as month,
              COUNT(*) as registrations
       FROM users
       WHERE created_by = $1
         AND user_type IN ('breeder', 'viewer')
       GROUP BY month
       ORDER BY month DESC`,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas mensais do agente' });
  }
};

// Endpoint de teste - Retorna credenciais de demo
const getDemoCredentials = async (req, res) => {
  res.json({
    demo: true,
    message: 'Credenciais de teste para demonstração',
    testAccounts: [
      {
        username: 'teste_reprodutor',
        password: 'Teste@123',
        full_name: 'Utilizador Teste Reprodutor',
        user_type: 'breeder',
        description: 'Conta de reprodutor para testes'
      },
      {
        username: 'teste_visualizador',
        password: 'Teste@123',
        full_name: 'Utilizador Teste Visualizador',
        user_type: 'viewer',
        description: 'Conta de visualizador para testes'
      },
      {
        username: 'admin_teste',
        password: 'Admin@123',
        full_name: 'Administrador Teste',
        user_type: 'admin',
        description: 'Conta de administrador para testes'
      }
    ],
    instructions: 'Use qualquer uma das credenciais acima na página de login para fazer teste da aplicação'
  });
};

// Criar conta de teste automática
const createTestAccount = async (req, res) => {
  const { accountType } = req.body; // 'breeder', 'viewer', ou 'admin'

  const testAccounts = {
    breeder: {
      username: 'teste_reprodutor_' + Date.now(),
      email: `teste_reprodutor_${Date.now()}@test.local`,
      password: 'Teste@123',
      full_name: 'Utilizador Teste Reprodutor',
      user_type: 'breeder'
    },
    viewer: {
      username: 'teste_visualizador_' + Date.now(),
      email: `teste_visualizador_${Date.now()}@test.local`,
      password: 'Teste@123',
      full_name: 'Utilizador Teste Visualizador',
      user_type: 'viewer'
    },
    admin: {
      username: 'admin_teste_' + Date.now(),
      email: `admin_teste_${Date.now()}@test.local`,
      password: 'Admin@123',
      full_name: 'Administrador Teste',
      user_type: 'admin'
    }
  };

  const account = testAccounts[accountType] || testAccounts.breeder;

  try {
    // Hash da password
    const password_hash = await bcrypt.hash(account.password, 10);

    // Criar utilizador
    const result = await pool.query(
      `INSERT INTO users 
       (username, email, password_hash, full_name, phone, address, city, province, user_type, is_verified)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id, username, email, full_name, user_type`,
      [
        account.username,
        account.email,
        password_hash,
        account.full_name,
        '+351 900000000',
        'Endereço de Teste',
        'Luanda',
        'Luanda',
        account.user_type,
        true
      ]
    );

    const user = result.rows[0];

    // Gerar JWT
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        user_type: user.user_type
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        user_type: user.user_type
      },
      credentials: {
        username: account.username,
        password: account.password,
        message: 'Conta de teste criada com sucesso. Use estas credenciais para fazer login futuros.'
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar conta de teste' });
  }
};

// Obter perfil do utilizador
const getUserProfile = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, username, email, full_name, phone, address, city, province, user_type, is_verified, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Utilizador não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar perfil' });
  }
};

// Atualizar perfil do utilizador
const updateUserProfile = async (req, res) => {
  const { full_name, phone, address, city, province } = req.body;

  try {
    const result = await pool.query(
      `UPDATE users 
       SET full_name = COALESCE($1, full_name),
           phone = COALESCE($2, phone),
           address = COALESCE($3, address),
           city = COALESCE($4, city),
           province = COALESCE($5, province),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING id, username, email, full_name, phone, address, city, province, user_type`,
      [full_name, phone, address, city, province, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Utilizador não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar perfil' });
  }
};

// Listar todos os utilizadores (apenas admin)
const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, username, email, full_name, user_type, is_verified, is_active, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar utilizadores' });
  }
};

// Obter utilizador por ID (admin)
const getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'SELECT id, username, email, full_name, phone, address, city, province, user_type, is_verified, is_active, created_at FROM users WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Utilizador não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar utilizador' });
  }
};

// Verificar / aprovar utilizador (apenas admins)
const verifyUser = async (req, res) => {
  const { id } = req.params;
  const { is_verified } = req.body;

  if (typeof is_verified !== 'boolean') {
    return res.status(400).json({ error: 'is_verified deve ser true ou false' });
  }

  try {
    const updateResult = await pool.query(
      `UPDATE users
       SET is_verified = $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [is_verified, id]
    );

    if (!updateResult.rowCount) {
      return res.status(404).json({ error: 'Utilizador não encontrado' });
    }

    const refreshed = await pool.query(
      'SELECT id, username, email, full_name, user_type, is_verified, is_active, created_at FROM users WHERE id = $1',
      [id]
    );

    res.json(refreshed.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar estado de verificação' });
  }
};

// Toggle de ativo/inativo para criadores (apenas admin)
const toggleBreederActive = async (req, res) => {
  const { id } = req.params;
  const { is_active } = req.body;

  if (typeof is_active !== 'boolean') {
    return res.status(400).json({ error: 'is_active deve ser true ou false' });
  }

  try {
    // Verificar se é criador
    const userResult = await pool.query(
      'SELECT id, user_type, username FROM users WHERE id = $1',
      [id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'Utilizador não encontrado' });
    }

    const user = userResult.rows[0];
    if (user.user_type !== 'breeder') {
      return res.status(400).json({ error: 'Só criadores podem ser ativados/desativados' });
    }

    const updateResult = await pool.query(
      `UPDATE users
       SET is_active = $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [is_active, id]
    );

    if (!updateResult.rowCount) {
      return res.status(404).json({ error: 'Utilizador não encontrado' });
    }

    const refreshed = await pool.query(
      'SELECT id, username, email, full_name, user_type, is_verified, is_active, created_at FROM users WHERE id = $1',
      [id]
    );

    res.json(refreshed.rows[0]);
  } catch (error) {
    console.error('Erro ao toggle de ativo/inativo:', error);
    res.status(500).json({ error: 'Erro ao atualizar estado de atividade' });
  }
};

// Eliminar agente de registo (apenas admin)
const deleteRegistrationAgentByAdmin = async (req, res) => {
  const { id } = req.params;

  try {
    const userResult = await pool.query(
      'SELECT id, user_type, username FROM users WHERE id = $1',
      [id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'Agente não encontrado' });
    }

    const agent = userResult.rows[0];
    if (agent.user_type !== AGENT_USER_TYPE) {
      return res.status(400).json({ error: 'Apenas agentes de registo podem ser eliminados nesta rota' });
    }

    await pool.query('DELETE FROM users WHERE id = $1', [id]);

    res.json({
      message: 'Agente eliminado com sucesso',
      deleted_agent_id: agent.id,
      deleted_agent_username: agent.username,
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao eliminar agente de registo' });
  }
};

// Login com Google
const loginWithGoogle = async (req, res) => {
  return res.status(403).json({
    error: 'Login com Google desativado. Apenas José Massano pode fazer login com PIN.'
  });
};

module.exports = {
  registerUser,
  loginUser,
  loginWithGoogle,
  getDemoCredentials,
  createTestAccount,
  getUserProfile,
  updateUserProfile,
  createBreederByAdmin,
  createRegistrationAgentByAdmin,
  getAgentsMonthlyStats,
  getMyMonthlyStats,
  deleteRegistrationAgentByAdmin,
  getAllUsers,
  getUserById,
  verifyUser,
  toggleBreederActive,
};
