const pool = require('../../database/pool');

const parseSettingValue = (rawValue) => {
  if (rawValue === 'true') return true;
  if (rawValue === 'false') return false;

  if (typeof rawValue === 'string') {
    const trimmed = rawValue.trim();
    if (trimmed !== '' && /^-?\d+(\.\d+)?$/.test(trimmed)) {
      return Number(trimmed);
    }
  }

  return rawValue;
};

const serializeSettingValue = (value) => {
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }

  if (value === null || value === undefined) {
    return '';
  }

  return String(value);
};

// Obter uma configuração
const getSetting = async (req, res) => {
  const { key } = req.params;

  try {
    const result = await pool.query(
      'SELECT setting_key, setting_value FROM system_settings WHERE setting_key = $1',
      [key]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Configuração não encontrada' });
    }

    res.json({
      key: result.rows[0].setting_key,
      value: parseSettingValue(result.rows[0].setting_value)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar configuração' });
  }
};

// Atualizar uma configuração (apenas admin)
const updateSetting = async (req, res) => {
  const { key } = req.params;
  const { value } = req.body;

  // Verificar se o utilizador é admin
  if (req.user?.user_type !== 'admin') {
    return res.status(403).json({ error: 'Apenas administradores podem alterar configurações' });
  }

  try {
    const serializedValue = serializeSettingValue(value);

    const updateResult = await pool.query(
      `UPDATE system_settings 
       SET setting_value = $1, updated_by = $2, updated_at = CURRENT_TIMESTAMP
       WHERE setting_key = $3
       RETURNING setting_key, setting_value`,
      [serializedValue, req.user.id, key]
    );

    if (!updateResult.rowCount) {
      await pool.query(
        `INSERT INTO system_settings (setting_key, setting_value, description, updated_by)
         VALUES ($1, $2, $3, $4)`,
        [key, serializedValue, 'Configuração criada automaticamente', req.user.id]
      );
    }

    const result = await pool.query(
      'SELECT setting_key, setting_value FROM system_settings WHERE setting_key = $1 LIMIT 1',
      [key]
    );

    res.json({
      message: 'Configuração atualizada com sucesso',
      key: result.rows[0].setting_key,
      value: parseSettingValue(result.rows[0].setting_value)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar configuração' });
  }
};

// Obter todas as configurações (apenas admin)
const getAllSettings = async (req, res) => {
  if (req.user?.user_type !== 'admin') {
    return res.status(403).json({ error: 'Apenas administradores podem ver configurações' });
  }

  try {
    const result = await pool.query(
      'SELECT setting_key, setting_value, description FROM system_settings ORDER BY setting_key'
    );

    const settings = result.rows.map(row => ({
      key: row.setting_key,
      value: parseSettingValue(row.setting_value),
      description: row.description
    }));

    res.json(settings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar configurações' });
  }
};

module.exports = {
  getSetting,
  updateSetting,
  getAllSettings
};
