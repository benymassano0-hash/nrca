# ⚡ Quick Start - Login com Gmail

## 🎯 O que fazer agora

### 1️⃣ Obter Google Client ID (5 minutos)

Siga **exatamente** estes passos:

1. Abra https://console.cloud.google.com/
2. Faça login com Google
3. Canto superior esquerdo: "Select a Project" → "NEW PROJECT"
4. Nome: `RCNA` → "CREATE"
5. Painel esquerdo: "APIs & Services"
6. "OAuth consent screen" → "EXTERNAL" → "CREATE"
7. Preencha:
   - **App name**: RCNA
   - **User support email**: josejoaomasssano@gmail.com
   - **Developer contact**: josejoaomasssano@gmail.com
8. "SAVE AND CONTINUE" (salte tudo o resto)
9. Painel esquerdo: "Credentials"
10. "+ CREATE CREDENTIALS" → "OAuth client ID" → "Web application"
11. Nome: `RCNA`
12. Em "Authorized JavaScript origins" → "+ ADD URI" → adicione:
    - `http://localhost:3000`
13. Em "Authorized redirect URIs" → "+ ADD URI" → adicione:
    - `http://localhost:3000/login`
14. "CREATE"
15. **COPIE o "Client ID"** (aquela string comprida com `.apps.googleusercontent.com`)

### 2️⃣ Colocar Client ID na app (2 minutos)

1. Abra: `c:\Users\josé massano\bb\RCNA\frontend\.env`
2. Encontre a linha com `REACT_APP_GOOGLE_CLIENT_ID=`
3. Substitua `SUA_GOOGLE_CLIENT_ID_AQUI` com o Client ID copiado
4. Salve o ficheiro
5. **IMPORTANTE**: Feche e reabra o terminal (para ler o novo .env)

### 3️⃣ Iniciar aplicação (3 minutos)

Abra **2 terminais** PowerShell:

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

Aguarde até ver:
- Backend: `✓ RCNA Backend rodando na porta 5000`
- Frontend: Abre http://localhost:3000 automaticamente

### 4️⃣ Testar (2 minutos)

1. Navegue para http://localhost:3000/login
2. Clique em "Sign in with Google"
3. Selecione a sua conta Google
4. ✅ Deve entrar no dashboard automático

## 🆘 Se não funcionar

**Erro 1: Botão Google não aparece**
- Abra DevTools (F12)
- Veja a aba "Console" para mensagens de erro
- Client ID inválido? Volta ao passo 1

**Erro 2: "Unauthorized origin"**
- Volte ao Google Cloud Console
- Verifique se `http://localhost:3000` está em "Authorized JavaScript origins"
- Aguarde 5 minutos que as mudanças se propaguem

**Erro 3: Login falha com erro genérico**
- Verifique se backend está a correr (`npm run dev`)
- Veja os logs do backend para erros

## 📋 Resumo técnico

- ✅ Backend: Novo endpoint `/api/users/login-google`
- ✅ Frontend: Botão Google no LoginPage
- ✅ Database: Cria utilizador automaticamente
- ✅ Segurança: Token validado no backend
- ✅ Username: Gerado automaticamente como `email_xxxx`

## 📚 Mais Informações

Se precisar de detalhes mais completos:
- Abra `SETUP_GOOGLE_OAUTH.md` para instruções detalhadas
- Abra `LOGIN_GOOGLE_RESUMO.md` para resumo técnico completo

---

**Tempo Total de Setup: ~12 minutos** ⏱️
