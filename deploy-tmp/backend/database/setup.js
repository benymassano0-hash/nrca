const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const queries = `
  -- Tabela de Raças
  CREATE TABLE IF NOT EXISTS breeds (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    origin VARCHAR(100),
    characteristics TEXT,
    min_weight DECIMAL(5, 2),
    max_weight DECIMAL(5, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  -- Tabela de Utilizadores (Criadores/Admin)
  CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    province VARCHAR(100),
    user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('breeder', 'admin', 'viewer')),
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  -- Tabela de Cães
  CREATE TABLE IF NOT EXISTS dogs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_id VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    breed_id INTEGER NOT NULL REFERENCES breeds(id),
    birth_date DATE,
    gender VARCHAR(10) NOT NULL CHECK (gender IN ('M', 'F')),
    color VARCHAR(100),
    microchip_id VARCHAR(50),
    father_id UUID REFERENCES dogs(id),
    mother_id UUID REFERENCES dogs(id),
    breeder_id UUID NOT NULL REFERENCES users(id),
    owner_id UUID REFERENCES users(id),
    health_status TEXT,
    certifications TEXT,
    photo_url VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  -- Tabela de Cruzamentos
  CREATE TABLE IF NOT EXISTS breedings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    father_id UUID NOT NULL REFERENCES dogs(id),
    mother_id UUID NOT NULL REFERENCES dogs(id),
    breeder_id UUID NOT NULL REFERENCES users(id),
    breeding_date DATE NOT NULL,
    expected_puppies_count INTEGER,
    actual_puppies_count INTEGER,
    status VARCHAR(20) NOT NULL CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled')),
    notes TEXT,
    certifications TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  -- Tabela de Pedigree (Genealogia)
  CREATE TABLE IF NOT EXISTS pedigrees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dog_id UUID NOT NULL REFERENCES dogs(id),
    father_id UUID REFERENCES dogs(id),
    mother_id UUID REFERENCES dogs(id),
    paternal_grandfather_id UUID REFERENCES dogs(id),
    paternal_grandmother_id UUID REFERENCES dogs(id),
    maternal_grandfather_id UUID REFERENCES dogs(id),
    maternal_grandmother_id UUID REFERENCES dogs(id),
    generations_back INTEGER DEFAULT 2,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  -- Tabela de Histórico de Propriedade
  CREATE TABLE IF NOT EXISTS dog_ownership (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dog_id UUID NOT NULL REFERENCES dogs(id),
    owner_id UUID NOT NULL REFERENCES users(id),
    from_date DATE NOT NULL,
    to_date DATE,
    status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'transferred', 'deceased')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  -- Tabela de Eventos de Canicultura
  CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL CHECK (category IN ('Exposição', 'Competição', 'Evento Educativo', 'Encontro Profissional', 'Show de Filhotes', 'Outro')),
    event_date DATE NOT NULL,
    event_time TIME,
    location VARCHAR(255) NOT NULL,
    province VARCHAR(100),
    image_url VARCHAR(255),
    video_url VARCHAR(255),
    attendees_count INTEGER DEFAULT 0,
    max_attendees INTEGER,
    is_approved BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) NOT NULL CHECK (status IN ('draft', 'published', 'cancelled', 'completed')) DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  -- Tabela de Configurações do Sistema
  CREATE TABLE IF NOT EXISTS system_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES users(id),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  -- Inserir configurações padrão
  INSERT INTO system_settings (setting_key, setting_value, description) 
  VALUES ('breeders_can_register_dogs', 'true', 'Controla se criadores podem registar novos cães no sistema')
  ON CONFLICT (setting_key) DO NOTHING;

  -- Índices para melhor performance
  CREATE INDEX IF NOT EXISTS idx_dogs_breed_id ON dogs(breed_id);
  CREATE INDEX IF NOT EXISTS idx_dogs_breeder_id ON dogs(breeder_id);
  CREATE INDEX IF NOT EXISTS idx_dogs_owner_id ON dogs(owner_id);
  CREATE INDEX IF NOT EXISTS idx_breedings_father_id ON breedings(father_id);
  CREATE INDEX IF NOT EXISTS idx_breedings_mother_id ON breedings(mother_id);
  CREATE INDEX IF NOT EXISTS idx_pedigrees_dog_id ON pedigrees(dog_id);
  CREATE INDEX IF NOT EXISTS idx_events_creator_id ON events(creator_id);
  CREATE INDEX IF NOT EXISTS idx_events_event_date ON events(event_date);
  CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
`;

async function setupDatabase() {
  try {
    console.log('Iniciando setup da base de dados...');
    const client = await pool.connect();
    
    await client.query(queries);
    
    client.release();
    console.log('✓ Base de dados configurada com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('Erro ao configurar a base de dados:', error);
    process.exit(1);
  }
}

setupDatabase();
