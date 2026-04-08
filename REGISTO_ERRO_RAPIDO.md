# ⚡ Erro de Registo - Solução Rápida

## 🎯 Problema Identificado

O banco de dados PostgreSQL não estava configurado. **JÁ fo corrigido!**

---

## 🚀 Fazer Funcionar em 3 Passos

### Passo 1: Criar Base de Dados (1 min)

Abra **PowerShell** e execute:

```powershell
psql -U postgres -c "CREATE DATABASE rcna;"
```

**Se pedir password**, use a que colocou durante instalação do PostgreSQL (padrão: `password`)

### Passo 2: Correr Setup (2 min)

```powershell
cd "c:\Users\josé massano\bb\RCNA\backend"
npm run db:setup
npm run db:seed
```

### Passo 3: Reiniciar Aplicação (1 min)

**Terminal 1 - Backend:**
```powershell
cd "c:\Users\josé massano\bb\RCNA\backend"
npm run dev
```

**Terminal 2 - Frontend:**
```powershell
cd "c:\Users\josé massano\bb\RCNA\frontend"
npm start
```

---

## ✅ Pronto!

1. Navegador abre http://localhost:3000
2. Vá para http://localhost:3000/login
3. Clique "Mostrar Credenciais de Teste"
4. Escolha uma conta e clique "Login"

---

## ❌ Se der Erro em Passo 1

Se `psql` não funcionar:

1. Te sure PostgreSQL está instalado
2. Se está, reinicie o computador
3. Se não está, descarregue aqui: https://www.postgresql.org/download/windows/

---

## 📖 Mais Detalhes

Ver arquivo: **RESOLVER_ERRO_REGISTO.md** para troubleshooting completo

---

**Pronto em ~5 minutos** ⏱️
