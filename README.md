# RCNA - Registro de Cães da Angola

Plataforma web para registro e gestão de raças de cães em Angola, similar ao CBKC brasileiro.

## 🚀 Funcionalidades

- ✅ Registro de raças de cães
- ✅ Registro de criadores e utilizadores
- ✅ Registro de cães com ID único gerado automaticamente
- ✅ Gestão de cruzamentos
- ✅ Visualização de pedigree (genealogia até 3 gerações)
- ✅ Verificação de consanguinidade
- ✅ Rastreamento de propriedade
- ✅ Autenticação e autorização por tipos de utilizador (Admin, Criador, Consultor)

## 📋 Requisitos

### Backend
- Node.js 14+ 
- PostgreSQL 12+
- npm

### Frontend
- Node.js 14+
- npm

## 🛠️ Instalação e Setup

### 1. Base de Dados

1. Instale PostgreSQL se ainda não tiver
2. Crie uma base de dados:
```sql
CREATE DATABASE rcna;
```

3. Atualize o arquivo `.env` do backend com suas credenciais do PostgreSQL

### 2. Backend

```bash
cd backend
npm install
cd ..
```

Configure o arquivo `.env`:
```bash
cp backend/.env.example backend/.env
```

Edite `backend/.env` com:
```
DB_HOST=localhost
DB_PORT=5432
DB_USER=seu_usuario_postgres
DB_PASSWORD=sua_senha
DB_NAME=rcna
PORT=5000
JWT_SECRET=sua_chave_secreta_aqui_muito_segura
NODE_ENV=development
```

Execute o setup da base de dados:
```bash
cd backend
npm run db:setup
cd ..
```

### 3. Frontend

```bash
cd frontend
npm install
cd ..
```

## ▶️ Como Executar

### Terminal 1 - Backend

```bash
cd backend
npm run dev
```

O backend estará disponível em `http://localhost:5000`

### Terminal 2 - Frontend

```bash
cd frontend
npm start
```

O frontend abrirá automaticamente em `http://localhost:3000`

## Produção

### O que foi preparado

- Backend pronto para usar PostgreSQL em produção quando `DB_CLIENT=postgres`
- Frontend preparado para build com `REACT_APP_API_URL` correta em tempo de build
- Compose dedicado para produção em [docker-compose.prod.yml](docker-compose.prod.yml)
- Exemplo de variáveis em [.env.production.example](.env.production.example)

### Passos recomendados

1. Crie um ficheiro `.env.production` na raiz com base em [.env.production.example](.env.production.example)
2. Defina uma `JWT_SECRET` forte e troque a password do PostgreSQL
3. Ajuste `FRONTEND_ORIGINS` para o domínio real do frontend
4. Ajuste `REACT_APP_API_URL` para a URL pública real da API
5. Suba os containers:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build
```

6. Verifique saúde dos serviços:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml ps
```

### Observações importantes

- O ficheiro [docker-compose.yml](docker-compose.yml) continua útil para ambiente local, mas não é o ideal para produção porque usa configuração mais próxima de desenvolvimento.
- No frontend React, `REACT_APP_API_URL` precisa estar correta no momento do build do container.
- Se usar um domínio HTTPS com proxy reverso, mantenha o frontend a apontar para a URL pública da API e configure `FRONTEND_ORIGINS` com esse domínio.

## 📚 API Endpoints

### Utilizadores
- `GET /api/users/profile` - Perfil do utilizador autenticado
- `POST /api/users/register` - Registar novo utilizador
- `POST /api/users/login` - Fazer login
- `PUT /api/users/profile` - Atualizar perfil

### Raças
- `GET /api/breeds` - Listar todas as raças
- `GET /api/breeds/:id` - Obter detalhes de uma raça
- `POST /api/breeds` - Criar nova raça (admin)
- `PUT /api/breeds/:id` - Atualizar raça (admin)
- `DELETE /api/breeds/:id` - Deletar raça (admin)

### Cães
- `GET /api/dogs` - Listar cães
- `GET /api/dogs/:id` - Obter detalhes do cão
- `GET /api/dogs/registration/:registration_id` - Buscar por ID de Registro
- `POST /api/dogs` - Registar novo cão
- `PUT /api/dogs/:id` - Atualizar cão
- `DELETE /api/dogs/:id` - Deletar cão

### Cruzamentos
- `GET /api/breedings` - Listar cruzamentos
- `GET /api/breedings/:id` - Obter detalhes do cruzamento
- `POST /api/breedings` - Criar novo cruzamento
- `PUT /api/breedings/:id` - Atualizar cruzamento
- `DELETE /api/breedings/:id` - Deletar cruzamento

### Pedigree
- `GET /api/pedigree/dog/:dog_id` - Obter pedigree por ID
- `GET /api/pedigree/registration/:registration_id` - Obter pedigree por ID de Registro
- `GET /api/pedigree/:dog_id/offspring` - Obter descendentes
- `POST /api/pedigree/check-consanguinity` - Verificar consanguinidade

## 🏗️ Estrutura do Projeto

```
RCNA/
├── backend/                    # API Node.js + Express
│   ├── src/
│   │   ├── controllers/       # Lógica de negócio
│   │   ├── routes/            # Definições de rotas
│   │   ├── middleware/        # Middleware (autenticação, etc)
│   │   └── utils/             # Utilitários
│   ├── database/              # Configuração e scripts DB
│   ├── server.js              # Arquivo principal
│   └── package.json
├── frontend/                   # Aplicação React
│   ├── src/
│   │   ├── components/        # Componentes reutilizáveis
│   │   ├── pages/             # Páginas da aplicação
│   │   ├── api.js             # Configuração do cliente API
│   │   └── App.js             # Componente principal
│   ├── public/
│   └── package.json
└── database/                  # Scripts e configurações DB
```

## 📁 Tipos de Utilizadores

1. **Admin** - Pode gerenciar raças e configurações do sistema
2. **Criador** - Pode registar cães, criar cruzamentos e visualizar pedigree
3. **Consultor** - Pode visualizar informações (sem permissão de escrita)

## 🔒 Autenticação

A autenticação é feita via JWT (JSON Web Token). Após login, o token é armazenado localmente e enviado nas requests subsequentes no header `Authorization: Bearer <token>`.

## 💾 Backup da Base de Dados

```bash
# Backup
pg_dump -U seu_usuario rcna > backup_rcna.sql

# Restaurar
psql -U seu_usuario rcna < backup_rcna.sql
```

## 🐛 Troubleshooting

### Erro de conexão à base de dados
- Verifique se PostgreSQL está rodando
- Confirme as credenciais no `.env`
- Execute `npm run db:setup` novamente

### Port 5000 já em uso
- Mude a port no `.env`: `PORT=5001`
- Ou finalize o processo: `lsof -i :5000` e `kill -9 <PID>`

### CORS Error
- Verifique se a URL da API no frontend está correta
- A URL padrão é `http://localhost:5000/api`

## 📝 Próximas Melhorias

- [ ] Upload de fotos de cães
- [ ] Emissão de certificados PDF
- [ ] Sistema de notificações
- [ ] Relatórios detalhados
- [ ] Integração com SMS/Email
- [ ] App móvel
- [ ] Mapa interativo de criadores

## 📄 Licença

MIT

## 📧 Suporte

Para dúvidas ou reportar bugs, contacte o administrador do sistema.
