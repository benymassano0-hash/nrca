# ⚡ Teste Rápido da Aplicação

Para testar rapidamente a aplicação RCNA sem configurar Google OAuth, agora tem várias opções:

## 🎯 Opção 1: Login com Credenciais Pré-definidas (RECOMENDADO)

### Como Funciona?
- Clique em **"Mostrar Credenciais de Teste"** na página de login
- Escolha uma conta (Reprodutor, Visualizador, Admin)
- Clique no botão para preencher automático os campos
- Clique "Login"

### Credenciais Disponíveis:

**Reprodutor (Breeder)**
- Username: `teste_reprodutor`
- Password: `Teste@123`

**Visualizador (Viewer)**
- Username: `teste_visualizador`
- Password: `Teste@123`

**Administrador (Admin)**
- Username: `admin_teste`
- Password: `Admin@123`

---

## 🎲 Opção 2: Criar Nova Conta de Teste Automática

Na página de login:

1. Clique em **"Mostrar Credenciais de Teste"**
2. Clique em um dos 3 botões:
   - **Reprodutor** - Cria conta de reprodutor
   - **Visualizador** - Cria conta de visualizador
   - **Admin** - Cria conta de administrador

**O que acontece?**
- Uma nova conta é criada automaticamente
- Você é autenticado imediatamente
- Redirecionado para o dashboard

**Credenciais geradas?**
- Username: `tipo_data` (ex: `teste_reprodutor_1710154800`)
- Password: `Teste@123` ou `Admin@123` (conforme o tipo)
- Email: Gerado automaticamente (ex: `teste_reprodutor_1710154800@test.local`)

---

## 🚀 Início Rápido

### 1. Terminal 1 - Iniciar Backend
```powershell
cd "c:\Users\josé massano\bb\RCNA\backend"
npm run dev
```

### 2. Terminal 2 - Iniciar Frontend
```powershell
cd "c:\Users\josé massano\bb\RCNA\frontend"
npm start
```

### 3. Abrir Navegador
- http://localhost:3000/login

### 4. Testar
- Clique em "Mostrar Credenciais de Teste"
- Escolha uma opção
- Clique "Login"

---

## 🎭 Testar Diferentes Papéis

### Como Reprodutor (Breeder)
- Login com `teste_reprodutor` / `Teste@123`
- Acesso a: Dashboard, Cães, Pedigree, Registos, Eventos
- Pode: Registar cães, criar eventos, ver pedigrees

### Como Visualizador (Viewer)
- Login com `teste_visualizador` / `Teste@123`
- Acesso a: Dashboard, Cães, Pedigree
- Pode: Ver informações, consultar dados
- Não pode: Criar, editar, eliminar

### Como Admin
- Login com `admin_teste` / `Admin@123`
- Acesso a: Tudo + Admin Panel
- Pode: Gerir utilizadores, aprovar eventos, ver estatísticas

---

## 🔄 Fluxo de Teste Recomendado

1. **Fazer Login como Reprodutor**
   - Testar navegação geral do site

2. **Ver Dashboard**
   - Verificar funcionalidades disponíveis

3. **Fazer Logout**
   - Clicar em sair (ou fechar browser)

4. **Fazer Login como Admin**
   - Testar painel de administração
   - Ver lista de utilizadores

5. **Criar Nova Conta de Teste**
   - Clicar em "Criar" para gerar conta automática
   - Testar login com a nova conta

---

## 💡 Dicas

- ✅ Pode testar múltiplas contas abrindo várias abas
- ✅ As contas são reais e armazenadas na base de dados
- ✅ Use a mesma conta para testes continuados
- ✅ Admin pode apagar contas de teste quando necessário
- ✅ Cada clique em "Criar" gera uma conta NOVA

---

## 🆘 Se Não Funcionar

### Erro: "Credenciais de Teste não aparecem"
- Verifique se backend está a correr (`npm run dev`)
- Abra DevTools (F12) na aba Console para erros
- Atualize a página (Ctrl+R)

### Erro: "Utilizador ou password inválido"
- Copie as credenciais **exatamente** (maiúsculas/minúsculas importam)
- Verifique se backend está a correr

### Erro: "Erro ao criar conta de teste"
- Verifique conexão com base de dados
- Veja logs do backend para erro específico

---

## 🎓 Próximos Passos

Depois de testar o básico:

1. **Configurar Google OAuth** (ver `QUICKSTART_GMAIL.md`)
2. **Registar novo utilizador** (página `/register`)
3. **Testar eventos** (criar, aprovar, ver)
4. **Explorar pedigrees** (ver dados genéticos)

---

**Status**: ✅ Pronto para Testar
**Tempo de Setup**: ~2 minutos
**Sem configuração externa necessária** ✨
