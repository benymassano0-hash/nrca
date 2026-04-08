-- Dados de exemplo para a base de dados RCNA

-- Inserir raças de exemplo
INSERT INTO breeds (name, description, origin, characteristics, min_weight, max_weight)
VALUES
  ('Pastor Alemão', 'Raça versátil, inteligente e leal', 'Alemanha', 'Grande porte, cor tipicamente castanha e preta', 25, 40),
  ('Labrador Retriever', 'Raça amigável e energética', 'Canadá', 'Grande porte, cores sólidas (preto, chocolate, amarelo)', 25, 36),
  ('Não-Se-Toca (NST)', 'Raça brasileira, mestiço', 'Brasil', 'Porte variado, pelagem curta', 15, 30),
  ('Bulldog', 'Raça robusta e corajosa', 'Grã-Bretanha', 'Pequeno porte, cabeça grande, face achatada', 18, 25),
  ('Poodle', 'Raça inteligente e elegante', 'França', 'Portes variados, pelagem encaracolada', 4, 70);

-- Inserir utilizadores de exemplo
INSERT INTO users (username, email, password_hash, full_name, phone, address, city, province, user_type, is_verified)
VALUES
  ('admin', 'admin@rcna.ao', '$2a$10$e3gSRhgrT1NNv5.XqKXqweFdQsxEnnVYdKfAqGOZjVJgvBCeFl9e6', 'Administrador RCNA', '+244920000000', 'Av. Agostinho Neto', 'Luanda', 'Luanda', 'admin', true),
  ('criador1', 'criador1@rcna.ao', '$2a$10$e3gSRhgrT1NNv5.XqKXqweFdQsxEnnVYdKfAqGOZjVJgvBCeFl9e6', 'João Silva', '+244921111111', 'Rua da Esperança, 123', 'Luanda', 'Luanda', 'breeder', true),
  ('criador2', 'criador2@rcna.ao', '$2a$10$e3gSRhgrT1NNv5.XqKXqweFdQsxEnnVYdKfAqGOZjVJgvBCeFl9e6', 'Maria Santos', '+244922222222', 'Avenida Independência, 456', 'Benguela', 'Benguela', 'breeder', true);
