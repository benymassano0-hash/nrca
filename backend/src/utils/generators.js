const { v4: uuidv4 } = require('uuid');

const generateRegistrationId = async (breed, pool) => {
  // Formato: BRD-YYMMDD-XXXX (exemplo: BRD-260311-0001)
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  
  const prefix = `REG-${year}${month}${day}`;

  // Buscar o maior número já emitido hoje para evitar colisões após eliminações.
  const result = await pool.query(
    `SELECT registration_id
     FROM dogs
     WHERE registration_id LIKE $1
     ORDER BY registration_id DESC
     LIMIT 1`,
    [`${prefix}%`]
  );

  const latestRegistrationId = result.rows[0]?.registration_id || result.rows[0]?.REGISTRATION_ID || Object.values(result.rows[0] || {})[0] || null;
  const latestSequence = latestRegistrationId
    ? parseInt(String(latestRegistrationId).split('-').pop(), 10) || 0
    : 0;
  const sequence = String(latestSequence + 1).padStart(4, '0');
  
  return `${prefix}-${sequence}`;
};

const generateUUID = () => uuidv4();

module.exports = {
  generateRegistrationId,
  generateUUID,
};
