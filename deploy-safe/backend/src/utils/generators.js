const { v4: uuidv4 } = require('uuid');

const generateRegistrationId = async (breed, pool) => {
  // Formato: BRD-YYMMDD-XXXX (exemplo: BRD-260311-0001)
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  
  const prefix = `REG-${year}${month}${day}`;
  
  // Contar quantos cães foram registados hoje
  const result = await pool.query(
    `SELECT COUNT(*) FROM dogs 
     WHERE registration_id LIKE $1`,
    [`${prefix}%`]
  );

  const firstRow = result.rows[0] || {};
  const rawCount = firstRow.count !== undefined ? firstRow.count : Object.values(firstRow)[0] || 0;
  const count = parseInt(rawCount, 10) + 1;
  const sequence = count.toString().padStart(4, '0');
  
  return `${prefix}-${sequence}`;
};

const generateUUID = () => uuidv4();

module.exports = {
  generateRegistrationId,
  generateUUID,
};
