# 🚀 Setup Inicial - Passo a Passo Completo

Siga **exatamente** nesta ordem para configurar e iniciar a RCNA.

---

## ✅ Pré-Requisitos

Certifique-se que tem:

- [ ] Node.js instalado (`node --version`)
- [ ] PostgreSQL instalado e rodando
- [ ] Arquivo `.env` configurado no `backend/`

---

## 📋 Verificar Passos Anteriores

### 1. Verifique o `.env`

Abra: `backend/.env`

Deve ter:

```
NODE_ENV=development
PORT=5000
HOST=0.0.0.0

DB_HOST=localhost
DB_PORT=5432
DB_USER=josé joão massano
DB_PASSWORD=MODELO,2007
DB_NAME=rcna

JWT_SECRET=sua_chave_secreta_aqui_123
JWT_EXPIRY=7d
```

### 2. Crie a Base de Dados (Se Ainda Não Existe)

Abra **PowerShell como Administrador**:

```powershell
psql -U "josé joão massano" -h localhost -c "CREATE DATABASE rcna;"
```

Se pedir senha: `MODELO,2007`

---

## 🔧 3. Inicializar Banco de Dados (Tabelas)

```powershell
cd c:\Users\josé massano\bb\RCNA\backend

npm run db:setup
```

**Resultado esperado:**
```
✅ Base de dados inicializada com sucesso!
```

---

## 👤 4. Criar Usuário Admin

```powershell
npm run db:seed
```

**Resultado esperado:**
```
✅ Usuário Admin criado com sucesso!

📋 Detalhes do Admin:
   Nome: josé joão massano
   Username: jmassano
   Email: josejoaomasssano@gmail.com
   Telefone: +351 935013630
   Tipo: admin

🔐 Dados de Login:
   Email: josejoaomasssano@gmail.com
   Senha: Admin@2026
```

---

## 🎮 5. Instalar Dependências Frontend

Num novo PowerShell:

```powershell
cd c:\Users\josé massano\bb\RCNA\frontend

npm install
```

---

## ▶️ 6. Iniciar Backend

Terminal 1 (Backend):

```powershell
cd c:\Users\josé massano\bb\RCNA\backend

npm run dev
```

**Resultado esperado:**
```
✓ RCNA Backend rodando na porta 5000
✓ Host: 0.0.0.0
ℹ️  Acesso permitido de qualquer país/IP
```

---

## ▶️ 7. Iniciar Frontend

Terminal 2 (Frontend):

```powershell
cd c:\Users\josé massano\bb\RCNA\frontend

npm start
```

**Resultado esperado:**
```
Compiled successfully!
You can now view rcna in the browser.
  http://localhost:3000
```

O navegador abre automaticamente em `http://localhost:3000`

---

## 🔓 8. Fazer Login

1. Clique em **"Login"** (canto superior)
2. Digite o email de admin:
   ```
   Email: josejoaomasssano@gmail.com
   ```
3. Digite a senha:
   ```
   Senha: Admin@2026
   ```
4. Clique **"Entrar"**

---

## 🔐 9. MUITO IMPORTANTE: Mudar Senha!

Após login bem-sucedido:

1. Clique no seu perfil (canto superior direito)
2. Selecione **"Alterar Senha"**
3. Mude para uma **senha forte e pessoal**
4. Nunca use `Admin@2026` novamente

---

## ✨ 10. Próximos Passos

Agora pode:

**Registar Raças:**
- Menu → Raças → Adicionar Raça

**Registar Cães:**
- Menu → Cães → Registar Novo Cão
- Recebe ID automático: `REG-YYMMDD-XXXX`

**Registar Cruzamentos:**
- Menu → Cruzamentos → Novo Cruzamento

**Ver Genealogia:**
- Menu → Pedigree → Selecionar Cão → Ver Árvore Genealógica

---

## 🚨 Troubleshooting

### Erro: "ECONNREFUSED" ou "Connect Failed"

**Problema:** PostgreSQL não está rodando

**Solução:**

```powershell
# Windows - Iniciar serviço PostgreSQL
net start postgresql-x64-XX

# Ou abrir Windows Services e procurar "postgresql"
```

### Erro: "Database does not exist"

**Problema:** Banco `rcna` não foi criado

**Solução:**

```powershell
psql -U "josé joão massano" -h localhost -c "CREATE DATABASE rcna;"
```

### Erro: "permission denied" na senha

**Problema:** A senha não é `MODELO,2007`

**Solução:** Verifique `.env`:

```
DB_PASSWORD=MODELO,2007
```

### Erro: "npm: command not found"

**Problema:** Node não está instalado

**Solução:** Instale Node.js de https://nodejs.org

---

## ✅ Checklist Final

- [ ] `.env` configurado com credentials
- [ ] Base de dados `rcna` criada
- [ ] `npm run db:setup` executado
- [ ] `npm run db:seed` executado
- [ ] Backend rodando em porta 5000
- [ ] Frontend rodando em porta 3000
- [ ] Login bem-sucedido com admin
- [ ] Senha de admin alterada

---

## 🎉 Pronto!

Seu sistema **RCNA** está **100% operacional**!

- ✅ Admin registado
- ✅ 5 raças populares importadas
- ✅ Pronto para registar cães
- ✅ Pronto para registar cruzamentos
- ✅ Pronto para ver genealogias

**Aproveite! 🚀**
