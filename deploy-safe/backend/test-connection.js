require('dotenv').config();
const pool = require('./database/pool');

const testConnection = async () => {
  console.log('\n📋 Testando Configuração do RCNA\n');
  console.log('Variáveis de Ambiente:');
  console.log(`  DB_HOST: ${process.env.DB_HOST}`);
  console.log(`  DB_PORT: ${process.env.DB_PORT}`);
  console.log(`  DB_USER: ${process.env.DB_USER}`);
  console.log(`  DB_NAME: ${process.env.DB_NAME}`);
  console.log();

  try {
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Conexão ao PostgreSQL: OK');
    console.log(`   Data/Hora do servidor: ${result.rows[0].now}\n`);

    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    console.log('📊 Tabelas na Base de Dados:');
    if (tablesResult.rows.length === 0) {
      console.log('   ❌ Nenhuma tabela encontrada!');
      console.log('   Execute: npm run db:setup\n');
    } else {
      tablesResult.rows.forEach(row => {
        console.log(`   ✓ ${row.table_name}`);
      });
      console.log();

      const usersResult = await pool.query('SELECT COUNT(*) as count FROM users');
      console.log(`👥 Utilizadores na BD: ${usersResult.rows[0].count}`);
      console.log();
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao conectar:');
    console.error(`   Mensagem: ${error.message}`);
    console.error(`   Código: ${error.code}\n`);
    console.error('Solução:');
    console.error('   1. Verifique se PostgreSQL está a correr');
    console.error('   2. Verifique as credenciais em .env');
    console.error('   3. Execute: psql -U postgres -c "CREATE DATABASE rcna;"');
    console.log();
    process.exit(1);
  }
};

testConnection();
