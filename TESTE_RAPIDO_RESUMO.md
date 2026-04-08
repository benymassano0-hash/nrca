# 🎉 Sistema de Teste Rápido - Implementado

## ✅ O que foi adicionado

### Método 1: Login com Credenciais Pré-configuradas

Na página `/login`:

```
┌─────────────────────────────────────────────┐
│ 🔓 Login                                    │
├─────────────────────────────────────────────┤
│ Utilizador: [___________]                   │
│ Palavra-passe: [______]                     │
│ [  Login  ]                                 │
├─────────────────────────────────────────────┤
│ Ou login com Google (com botão Google)      │
├─────────────────────────────────────────────┤
│ ▶ Mostrar Credenciais de Teste              │
│   (Clique para expandir)                    │
└─────────────────────────────────────────────┘
```

Após clique em "expandir":

```
┌─────────────────────────────────────────────┐
│ ▼ Esconder Credenciais de Teste             │
│                                             │
│ Use qualquer uma das contas abaixo:         │
│                                             │
│ [Conta Visualizador] [Conta Admin]          │
│ [Conta Reprodutor]                          │
│                                             │
│ Ou criar nova conta automática:             │
│                                             │
│ [Reprodutor] [Visualizador] [Admin]         │
└─────────────────────────────────────────────┘
```

---

## 📋 Credenciais Pré-configuradas

| Tipo | Username | Password | Acesso |
|------|----------|----------|--------|
| 🐕 Reprodutor | `teste_reprodutor` | `Teste@123` | Dashboard, Cães, Eventos |
| 👁️ Visualizador | `teste_visualizador` | `Teste@123` | Dashboard, Visualizar dados |
| 🔑 Admin | `admin_teste` | `Admin@123` | Tudo + Admin Panel |

---

## 🎲 Método 2: Criar Conta Automática

Clique em qualquer um dos 3 botões:

1. **[Reprodutor]** 
   - Cria conta de reprodutor
   - Login automático
   - Exemplos de username gerado: `teste_reprodutor_1710154800`

2. **[Visualizador]**
   - Cria conta de visualizador
   - Login automático
   - Exemplos de username gerado: `teste_visualizador_1710154800`

3. **[Admin]**
   - Cria conta de administrador
   - Login automático
   - Exemplos de username gerado: `admin_teste_1710154800`

---

## 🔧 Atrás das Cenas

### Backend (Node.js)
```javascript
// GET /api/users/demo/credentials
// Retorna lista de credenciais de teste

// POST /api/users/demo/create-test
// Body: { accountType: 'breeder|viewer|admin' }
// Retorna: { token, user, credentials }
// Ação: Cria utilizador, retorna JWT, faz login automático
```

### Frontend (React)
```javascript
// LoginPage.js
- useEffect: Carrega credenciais de teste
- handleQuickLogin: Preenche campos com credenciais
- handleCreateTestAccount: POST para criar conta nova
- showDemo: State para mostrar/esconder secção de teste
```

---

## 📊 Fluxo de Teste

```
┌──────────────────┐
│ http://localhost │
│ :3000/login      │
└────────┬─────────┘
         │
    ┌────▼───────────────────────────┐
    │ Clique "Mostrar Credenciais"    │
    └────┬───────────────────────────┘
         │
    ┌────▼──────────────────────────────────┐
    │ Escolha opção:                        │
    │ A) Preencher campos manualmente       │
    │    1. Clique em credencial            │
    │    2. Clique "Login"                  │
    │    {                                  │
    │ B) Criar conta automática             │
    │    1. Clique botão [Reprodutor]       │
    │    2. Login + Redirect automático     │
    └────┬───────────────────────────────────┘
         │
    ┌────▼──────────┐
    │ /dashboard    │
    │ (Autenticado) │
    └───────────────┘
```

---

## 🎯 Casos de Uso

### Teste 1: Explorar como Reprodutor
1. Na login, clique botão "Reprodutor" pré-configurado
2. Vê dashboard do reprodutor
3. Acesso a funcionalidades de criador

### Teste 2: Testar Admin
1. Na login, clique botão "Admin" pré-configurado
2. Vê dashboard + menu admin
3. Acesso a `/admin/usuarios`

### Teste 3: Criar Múltiplas Contas
1. Clique botão "Reprodutor" → Login automático
2. Logout
3. Clique botão "Reprodutor" novamente → **Nova conta criada**
4. Repeat com "Visualizador" e "Admin"

---

## 🚀 Início Rápido

### Passo 1: Iniciar Backend
```powershell
cd backend
npm run dev
```

### Passo 2: Iniciar Frontend
```powershell
cd frontend
npm start
```

### Passo 3: Abrir http://localhost:3000/login

### Passo 4: Clique em "Mostrar Credenciais de Teste"

### Passo 5: Escolha uma opção e teste!

---

## 📁 Ficheiros Modificados

```
frontend/src/pages/
├── LoginPage.js (MODIFICADO)
│   ├── Nova secção expandível de teste
│   ├── Estado: showDemo, demoCredentials
│   ├── Handler: handleQuickLogin, handleCreateTestAccount
│   └── UI: Botões de teste com cores
└── LoginPage.css (sem alterações)

backend/src/
├── controllers/usersController.js (MODIFICADO)
│   ├── Função: getDemoCredentials()
│   ├── Função: createTestAccount()
│   └── module.exports: adicionadas 2 funções
└── routes/users.js (MODIFICADO)
   ├── GET /demo/credentials
   └── POST /demo/create-test
```

---

## ⚙️ Configurações

Nenhuma configuração externa necessária! O sistema funciona imediatamente após iniciar:

```bash
npm run dev     # Backend
npm start       # Frontend
# Abrir http://localhost:3000/login ✨
```

---

## 🎨 Visual

A secção de teste tem:
- ✅ Botão toggle para expandir/recolher
- ✅ 3 cores de botão diferentes (verde, azul, vermelho)
- ✅ UI limpa e organizada
- ✅ Responsive design
- ✅ Instruções claras

---

## 📖 Documentação

Ver `TESTE_RAPIDO.md` para guia completo com:
- Credenciais exatas
- Guia passo-a-passo
- Resolução de problemas
- Dicas avançadas

---

## ✨ Benefícios

1. **Testar imediatamente** - Sem configurar Google OAuth
2. **Múltiplos papéis** - Reprodutor, Visualizador, Admin
3. **Criar contas** - Automaticamente com 1 clique
4. **Desenvolvimento rápido** - Sem criar manualmente contas
5. **Demo** - Mostrar app a outras pessoas facilmente

---

**Status**: ✅ Pronto para testar agora mesmo!
**Tempo de Setup**: 2 minutos
**Sem dependências externas**: ✅
