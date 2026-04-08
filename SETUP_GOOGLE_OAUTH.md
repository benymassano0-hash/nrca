# Configuração do Login com Google/Gmail

Este documento explica como configurar o login com Google/Gmail na aplicação RCNA.

## Passo 1: Obter Google Client ID

### a) Aceda ao Google Cloud Console
1. Abra https://console.cloud.google.com/
2. Faça login com a sua conta Google
3. Clique em "Select a Project" (canto superior esquerdo)
4. Clique em "NEW PROJECT"
5. Nome do projeto: `RCNA` (ou à sua escolha)
6. Clique em "CREATE"

### b) Ative a API Google+ (OAuth consent screen)
1. No painel esquerdo, clique em "APIs & Services"
2. Clique em "OAuth consent screen"
3. Escolha "External"
4. Clique em "CREATE"
5. Preencha o formulário:
   - **App name**: RCNA - Registro de Cães da Angola
   - **User support email**: josejoaomasssano@gmail.com
   - **Developer contact**: josejoaomasssano@gmail.com
6. Clique em "SAVE AND CONTINUE"
7. Na página de "Scopes", clique em "SAVE AND CONTINUE"
8. Na página de "Test users", clique em "SAVE AND CONTINUE"

### c) Crie uma credencial OAuth 2.0
1. No painel esquerdo, clique em "Credentials"
2. Clique em "+ CREATE CREDENTIALS"
3. Escolha "OAuth client ID"
4. Escolha "Web application"
5. Nome: `RCNA Web App`
6. Em "Authorized JavaScript origins", adicione:
   - `http://localhost:3000`
   - `http://127.0.0.1:3000`
7. Em "Authorized redirect URIs", adicione:
   - `http://localhost:3000/login`
   - `http://127.0.0.1:3000/login`
8. Clique em "CREATE"
9. **Copie o "Client ID"** (será uma string longa terminada em `.apps.googleusercontent.com`)

## Passo 2: Configurar no Frontend

1. Abra o ficheiro `frontend/.env`
2. Substitua `SUA_GOOGLE_CLIENT_ID_AQUI` com o Client ID que copiou:
   ```
   REACT_APP_GOOGLE_CLIENT_ID=123456789-abcdefghij.apps.googleusercontent.com
   ```
3. Salve o ficheiro

## Passo 3: Reiniciar a Aplicação

```bash
# No diretório frontend
npm start
```

## Passo 4: Testar

1. Abra http://localhost:3000/login
2. Clique no botão "Sign in with Google"
3. Faça login com a sua conta Google
4. Será criada automaticamente uma conta RCNA vinculada ao seu email

## Notas Importantes

- **Client ID**: A string terminada em `.apps.googleusercontent.com`
- **Client Secret**: NÃO copie isto para o frontend! Apenas o Client ID é necessário.
- **Primeira vez**: Quando faz login com Google pela primeira vez, é criada automaticamente uma conta RCNA.
- **Contas existentes**: Se já tem uma conta RCNA com o mesmo email, ela será automaticamente vinculada ao seu login Google.
- **Dados do perfil**: O nome da conta é gerado automaticamente como `email_xxxxx` onde xxxxx é um número aleatório.

## Resolução de Problemas

### Erro: "Client ID não configurado"
- Verifique se a variável `REACT_APP_GOOGLE_CLIENT_ID` está no ficheiro `.env`
- Reinicie a aplicação frontend (`npm start`)

### Erro: "Origin não autorizado"
- Verifique se adicionou `http://localhost:3000` nas "Authorized JavaScript origins" do Google Cloud Console
- Aguarde alguns minutos para que as mudanças se propaguem

### Token inválido
- Certifique-se de que o Client ID é válido
- Tente fazer logout e login novamente
- Limpe o cache do navegador

## Segurança

- O Client ID é público e pode ser visto no navegador
- O verificar do token acontece no backend (endpoint `/api/users/login-google`)
- O backend valida que o token foi emitido pelo Google antes de aceitar o login
