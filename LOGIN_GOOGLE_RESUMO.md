# Login com Gmail - Implementação Concluída

## ✅ O que foi feito

### Backend (Node.js/Express)
1. **Novo Endpoint**: `POST /api/users/login-google`
   - Localização: `backend/src/routes/users.js`
   - Controlador: `backend/src/controllers/usersController.js`
   - Função: `loginWithGoogle()`

2. **Funcionamento**:
   - Recebe um token JWT do Google
   - Decodifica o token para extrair email, nome, foto
   - Verifica se o utilizador já existe na base de dados
   - Se não existir, cria automaticamente um novo utilizador
   - Retorna um JWT da aplicação RCNA para aceitar o utilizador

3. **Dados do novo utilizador**:
   - Email: obtido do Google
   - Nome completo: obtido do Google
   - Username: `email_xxxxx` (automático)
   - Tipo: "breeder" (padrão)
   - Verificado: true (porque o Google verificou o email)

### Frontend (React)
1. **Pacotes Instalados**:
   - `@react-oauth/google` - Componente para Google OAuth
   - `jwt-decode` - Para decodificar JWTs

2. **Ficheiros Modificados**:
   - `src/App.js` - Adicionado GoogleOAuthProvider wrapper
   - `src/pages/LoginPage.js` - Adicionado botão Google Login
   - `src/pages/LoginPage.css` - Novo ficheiro com estilos profissionais
   - `.env` - Adicionada variável REACT_APP_GOOGLE_CLIENT_ID

3. **Alterações Detalhadas**:
   ```javascript
   // App.js - Wrapper
   <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
     <Router>
       {/* Rotas... */}
     </Router>
   </GoogleOAuthProvider>

   // LoginPage.js - Novo handler
   const handleGoogleLogin = async (credentialResponse) => {
     // Envia o token para o backend
     // Backend retorna JWT da aplicação
     // Faz login automático
   }
   ```

## 🔧 Configuração Necessária

### 1. Obter Google Client ID
- Siga as instruções no ficheiro `SETUP_GOOGLE_OAUTH.md`
- Local: Google Cloud Console (console.cloud.google.com)

### 2. Configurar Frontend
- Edite `frontend/.env`
- Substitua `SUA_GOOGLE_CLIENT_ID_AQUI` com o Client ID autentico:
  ```
  REACT_APP_GOOGLE_CLIENT_ID=123456789-abcdefghij.apps.googleusercontent.com
  ```

### 3. Reiniciar Aplicação
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

## 🧪 Testando a Funcionalidade

1. **Abrir Login**: Aceda a http://localhost:3000/login
2. **Clique no Botão**: "Sign in with Google"
3. **Autenticar**: Selecione a sua conta Google
4. **Verificar Criação**: Conta RCNA é criada/linked automaticamente
5. **Fazer Login**: É redirecionado para o dashboard

## 📊 Fluxo de Login com Google

```
┌─────────────────────────────────────────────┐
│  Utilizador clica "Sign in with Google"     │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│  Google OAuth 2.0 (popup de autenticação)   │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│  Google retorna JWT Token ao Frontend       │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│  Frontend envia token para                  │
│  POST /api/users/login-google               │
└──────────────┬──────────────────────────────┘
               │
      ┌────────┴────────┐
      │                 │
      ▼                 ▼
  ┌───────────┐   ┌──────────────┐
  │ Utiliza- │   │ Não existe   │
  │ dor já    │   │ - criar novo │
  │ existe    │   │ utilizador   │
  └────┬──────┘   └──────┬───────┘
       │                 │
       └────────┬────────┘
                │
                ▼
┌─────────────────────────────────────────────┐
│  Backend retorna JWT da aplicação           │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│  Frontend armazena JWT em localStorage      │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│  Redirecionamento para /dashboard           │
└─────────────────────────────────────────────┘
```

## 🔐 Segurança

- ✅ Token do Google é validado no backend
- ✅ Email verificado pelo Google (email_verified: true)
- ✅ JWT da aplicação é gerado após validação
- ✅ Client ID é público (é seguro)
- ✅ Client Secret não é necessário no frontend
- ✅ Senhas GOOGLE_AUTH não são armazenadas (login social)

## 📝 Notas Importantes

1. **First Time**: Primeira vez criada automaticamente a conta
2. **Email Existing**: Se email já existe, faz login automático
3. **Username Auto**: Nome de utilizador é gerado automaticamente como `email_xxxxx`
4. **Type Default**: Novo utilizadores são "breeder" por padrão
5. **Verified**: Contas criadas por Google são marcadas como verificadas

## 🎨 Interface

A página de login agora tem:
- ✅ Campo de username tradicional
- ✅ Campo de password tradicional
- ✅ Botão com logo do Google
- ✅ Design profissional com gradiente
- ✅ Opção de registar se não tiver conta

## ❌ Resolução de Problemas

Se encontrar erros:

1. **"Client ID não configurado"**
   - Verifique `.env` tem a variável
   - Reinicie com `npm start`

2. **"Origin não autorizado"**
   - Verifique Google Cloud Console
   - Adicione `http://localhost:3000`

3. **Botão Google não aparece**
   - Verifique console do navegador para erros
   - Verifique se Client ID é válido

4. **Erro ao fazer login**
   - Verifique se backend está a correr
   - Verifique se endpoint `/api/users/login-google` existe
   - Consulte logs do backend

## 📚 Ficheiros Afetados

```
frontend/
├── .env (modificado)
├── src/
│   ├── App.js (modificado)
│   └── pages/
│       ├── LoginPage.js (modificado)
│       └── LoginPage.css (novo)

backend/
├── src/
│   ├── controllers/
│   │   └── usersController.js (adicionada função loginWithGoogle)
│   └── routes/
│       └── users.js (adicionada rota POST /login-google)

docs/
└── SETUP_GOOGLE_OAUTH.md (novo - instruções de configuração)
```

## 🚀 Próximos Passos Opcionais

1. Adicionar login com Facebook/GitHub
2. Vincular múltiplas contas sociais à mesma conta RCNA
3. Atualizar perfil com dados do Google (foto, etc)
4. Oferecer temas escuros para LoginPage
5. Implementar "Remember me" functionality

---

**Status**: ✅ Implementação Concluída e Pronta para Testar
