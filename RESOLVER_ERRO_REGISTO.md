# 🚨 Erro de Registo - Solução Completa

## O Problema

O backend não estava completamente configurado. Agora foi corrigido. Para fazer o registo funcionar, precisa:

1. ✅ **Dependências instaladas** 
2. ⏳ **Criar base de dados PostgreSQL**
3. ⏳ **Correr setup para criar tabelas**
4. ⏳ **Iniciar backend**

---

## 🔧 Passo 1: Instalar PostgreSQL

### Se ainda não tem PostgreSQL instalado:

1. Descarregue: https://www.postgresql.org/download/windows/
2. Execute o instalador
3. Quando pedir password, use: `password` (ou a que colocou no .env)
4. Deixe a porta como 5432

### Se já tem PostgreSQL:

Salte para o Passo 2.

---

## 📊 Passo 2: Criar Base de Dados

### PowerShell (recomendado):

```powershell
# Conectar ao PostgreSQL e criar a base de dados RCNA
psql -U postgres -c "CREATE DATABASE rcna;"
```

**Se pedir password**: Use a password que colocou durante instalação (padrão: `password`)

### Ou usando pgAdmin (alternativa):

1. Abra pgAdmin (vem com PostgreSQL)
2. Clique botão direito em "Databases"
3. Create → Database
4. Nome: `rcna`
5. Clique "Save"

---

## 🏗️ Passo 3: Criar Tabelas (Setup)

Abra **PowerShell** e execute:

```powershell
cd "c:\Users\josé massano\bb\RCNA\backend"
npm run db:setup
```

**Deverá ver:**
```
🔄 Criando tabelas do RCNA...
✓ Tabela users criada
✓ Tabela breeds criada
✓ Tabela dogs criada
✓ Tabela pedigrees criada
✓ Tabela breedings criada
✓ Tabela dog_ownership criada
✓ Tabela events criada

✅ Base de dados configurada com sucesso!
```

---

## 🌱 Passo 4: Alimentar Base de Dados (Seed)

Abra **PowerShell** e execute:

```powershell
cd "c:\Users\josé massano\bb\RCNA\backend"
npm run db:seed
```

**Deverá ver:**
```
🌱 Alimentando base de dados com dados de teste...
✓ Utilizador admin criado
✓ Raças criadas

✅ Base de dados alimentada com sucesso!
```

---

## 🚀 Passo 5: Iniciar Aplicação

Abra **2 PowerShell** novos:

### Terminal 1 - Backend:
```powershell
cd "c:\Users\josé massano\bb\RCNA\backend"
npm run dev
```

**Deverá ver:**
```
✓ RCNA Backend rodando na porta 5000
✓ Host: 0.0.0.0
```

### Terminal 2 - Frontend:
```powershell
cd "c:\Users\josé massano\bb\RCNA\frontend"
npm start
```

Navegador abre automaticamente em http://localhost:3000

---

## ✨ Passo 6: Testar Registo

### Opção 1: Usar Credenciais de Teste (Recomendado)

1. Na página de login, clique "Mostrar Credenciais de Teste"
2. Clique em um dos botões (Reprodutor, Visualizador, Admin)
3. Clique "Login"

### Opção 2: Registar Nova Conta

1. Vá para http://localhost:3000/register
2. Preencha o formulário:
   - **Utilizador**: seu_username
   - **Email**: seu_email@example.com
   - **Password**: Suamotasenha123
   - **Nome Completo**: Seu Nome
   - **Tipo de Conta**: Reprodutor ou Visualizador
3. Marque "Aceito Termos"
4. Clique "Registar"

---

## 🆘 Se Ainda Tiver Erro

### Erro 1: "Não consegue conectar a PostgreSQL"

**Solução:**
```powershell
# Verifique se PostgreSQL está a correr
# Ou reinicie o serviço PostgreSQL:

# Abra Services (Win+R → services.msc)
# Procure "postgresql-x64-XX"
# Clique botão direito → Restart
```

### Erro 2: "Database rcna já existe"

**Solução:**
```powershell
# Elimine a base de dados antiga:
psql -U postgres -c "DROP DATABASE IF EXISTS rcna;"

# Depois crie novamente:
psql -U postgres -c "CREATE DATABASE rcna;"

# E corra novamente:
npm run db:setup
npm run db:seed
```

### Erro 3: "Erro ao registar" na UI

**Solução:**
1. Verifique se backend está a correr (Terminal 1)
2. Abra DevTools (F12) → Console
3. Procure por mensagem de erro
4. Verifique logs do backend

### Erro 4: "Credenciais inválidas"

**Solução:**
- Username e password são **case-sensitive**
- Se usou credenciais de teste, deve ter:
  - `teste_reprodutor` / `Teste@123`
  - `teste_visualizador` / `Teste@123`
  - `admin_teste` / `Admin@123`

---

## 📋 Variáveis de Ambiente

Ficheiro: `backend/.env`

Se precisar mudar alguma coisa:

```env
# Database
DB_HOST=localhost        # Se está noutra máquina: seu_ip
DB_PORT=5432             # Porta do PostgreSQL
DB_USER=postgres         # User do PostgreSQL (padrão)
DB_PASSWORD=password     # Password que colocou
DB_NAME=rcna             # Nome da base de dados

# Server
PORT=5000                # Porta do backend
HOST=0.0.0.0             # Aceita de qualquer IP
NODE_ENV=development     # Modo desenvolvimento

# JWT
JWT_SECRET=sua_chave_secreta_jwt_super_segura_2026  # Chave secreta
```

---

## ✅ Checklist de Verificação

- [ ] PostgreSQL instalado e a correr
- [ ] Base de dados `rcna` criada
- [ ] `npm run db:setup` executado com sucesso
- [ ] `npm run db:seed` executado com sucesso
- [ ] Backend a correr (`npm run dev`) sem erros
- [ ] Frontend a correr (`npm start`) sem erros
- [ ] http://localhost:3000 abre no navegador
- [ ] Consegue fazer login com credenciais de teste
- [ ] Consegue registar nova conta

---

## 📞 Próximos Passos

Depois de tudo funcionar:

1. **Configurar Google OAuth** (opcional)
   - Ver: `QUICKSTART_GMAIL.md`

2. **Explorar Funcionalidades**
   - Dashboard
   - Registar cães
   - Ver pedigrees
   - Criar eventos (como reprodutor)

3. **Admin Panel** 
   - Login como `admin_teste`
   - Ir a `/admin/usuarios`
   - Ver utilizadores registados

---

**Tempo Total**: ~15 minutos
**Sem custos**: ✅ (PostgreSQL é gratuito)
**Sem configuração complexa**: ✅

---

Se ainda tiver problemas, contacte suporte com:
- Mensagem de erro exata (screenshots úteis)
- Logs do backend (copie e cole)
- Sistema operativo (Windows, Mac, Linux)
