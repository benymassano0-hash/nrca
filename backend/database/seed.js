const { Pool } = require('pg');
const bcryptjs = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();
const getPgConfig = require('./connectionConfig');

const pool = new Pool(getPgConfig());

async function seedDatabase() {
  try {
    console.log('🌱 Iniciando seed do banco de dados...\n');

    // Dados do Admin
    const adminData = {
      id: uuidv4(),
      username: 'jmassano',
      email: 'josejoaomasssano@gmail.com',
      full_name: 'josé joão massano',
      phone: '+351 935013630',
      password: 'Admin@2026', // Senha padrão - MUD ISTO NA PRIMEIRA VEZ!
      user_type: 'admin',
    };

    // Hash da senha
    const hashedPassword = await bcryptjs.hash(adminData.password, 10);

    // Verificar se o admin já existe
    const checkAdmin = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [adminData.email]
    );

    if (checkAdmin.rows.length > 0) {
      console.log('✅ Admin já existe no banco de dados');
      console.log(`   Email: ${adminData.email}`);
   } else {
      // Inserir o admin
      await pool.query(
        `INSERT INTO users (id, username, email, password_hash, login_pin, full_name, phone, user_type, is_verified) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          adminData.id,
          adminData.username,
          adminData.email,
          hashedPassword,
          adminData.password,
          adminData.full_name,
          adminData.phone,
          adminData.user_type,
          true,
        ]
      );

      console.log('✅ Usuário Admin criado com sucesso!\n');
      console.log('📋 Detalhes do Admin:');
      console.log(`   Nome: ${adminData.full_name}`);
      console.log(`   Username: ${adminData.username}`);
      console.log(`   Email: ${adminData.email}`);
      console.log(`   Telefone: ${adminData.phone}`);
      console.log(`   Tipo: ${adminData.user_type}`);
      console.log(`\n🔐 Dados de Login (Mude a senha na primeira vez!):`);
      console.log(`   Email: ${adminData.email}`);
      console.log(`   Senha: ${adminData.password}`);
      console.log(`\n⚠️  IMPORTANTE: Mude a senha imediatamente após fazer login!\n`);
    }

    // Raças populares iniciais
    const breedsData = [
      {
        name: 'Labrador Retriever',
        description: 'Cão descritivo e amigável',
        origin: 'Canadá',
        characteristics: 'Inteligente, leal, energético',
        min_weight: 25,
        max_weight: 36,
      },
      {
        name: 'Pastor Alemão',
        description: 'Cão versátil e inteligente',
        origin: 'Alemanha',
        characteristics: 'Leal, confiante, corajoso',
        min_weight: 22,
        max_weight: 40,
      },
      {
        name: 'Buldogue',
        description: 'Cão compacto e musculoso',
        origin: 'Reino Unido',
        characteristics: 'Amigável, paciente, determinado',
        min_weight: 18,
        max_weight: 25,
      },
      {
        name: 'Poodle',
        description: 'Cão inteligente e elegante',
        origin: 'França',
        characteristics: 'Inteligente, ativo, elegante',
        min_weight: 3,
        max_weight: 30,
      },
      {
        name: 'Golden Retriever',
        description: 'Cão dócil e afetuoso',
        origin: 'Reino Unido',
        characteristics: 'Inteligente, amigável, devotado',
        min_weight: 25,
        max_weight: 34,
      },
    ];

    // Verificar e inserir raças
    for (const breed of breedsData) {
      const checkBreed = await pool.query(
        'SELECT * FROM breeds WHERE name = $1',
        [breed.name]
      );

      if (checkBreed.rows.length === 0) {
        await pool.query(
          `INSERT INTO breeds (name, description, origin, characteristics, min_weight, max_weight) 
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            breed.name,
            breed.description,
            breed.origin,
            breed.characteristics,
            breed.min_weight,
            breed.max_weight,
          ]
        );
      }
    }

    console.log(`✅ ${breedsData.length} raças populares adicionadas (ou já existiam)\n`);

    console.log('✅ SEED DO BANCO DE DADOS CONCLUÍDO COM SUCESSO!\n');
    console.log('🚀 Próximos passos:');
    console.log('   1. Inicie o servidor: npm run dev');
    console.log('   2. Aceda: http://localhost:3000');
    console.log('   3. Login com o email de admin');
    console.log('   4. Mude a senha imediatamente\n');

  } catch (error) {
    console.error('❌ Erro ao fazer seed do banco de dados:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Executar o seed
seedDatabase();
