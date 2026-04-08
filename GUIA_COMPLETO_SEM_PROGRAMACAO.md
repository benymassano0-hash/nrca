# 🐕 GUIA COMPLETO PARA INICIANTES - RCNA

## ℹ️ O Que É Este Projeto?

É uma **plataforma web** (como um site) para registar cães em Angola, similar ao CBKC brasileiro. Funciona via navegador (Chrome, Firefox, Edge).

---

## 📋 ÍNDICE

1. [Preparação Inicial](#preparação-inicial)
2. [Instalação Passo a Passo](#instalação-passo-a-passo)
3. [Iniciar o Projeto](#iniciar-o-projeto)
4. [Acessar a Web](#acessar-a-web)
5. [Registar e Usar](#registar-e-usar)
6. [Operações Principais](#operações-principais)
7. [Perguntas Frequentes](#perguntas-frequentes)

---

# 🖥️ PREPARAÇÃO INICIAL

## O Que Precisa?

1. **Node.js** (programa necessário)
2. **PostgreSQL** (base de dados)
3. **Navegador** (Chrome, Firefox, Edge)
4. **Pasta do Projeto** (já tem)

## Verificar se Tem Node.js Instalado

1. Abra **Windows PowerShell** (clicar direita no ícone do Windows)
2. Cole isto:
```powershell
node --version
```
3. Se aparecer algo como `v18.15.0` → Tem! ✅
4. Se aparecer `comando não reconhecido` → Instale em: https://nodejs.org/

## Verificar se Tem PostgreSQL Instalado

1. Abra **Windows PowerShell** (clicar direita no ícone do Windows)
2. Cole isto:
```powershell
psql --version
```
3. Se aparecer algo como `psql (PostgreSQL) 14.2` → Tem! ✅
4. Se aparecer `comando não reconhecido` → Instale em: https://www.postgresql.org/download/

---

# 💾 INSTALAÇÃO PASSO A PASSO

## Passo 1: Abrir a Pasta do Projeto

1. Pressione `Win + R` no teclado
2. Escreva:
```
c:\Users\josé massano\bb\RCNA
```
3. Clique em OK
4. A pasta abre no explorador

---

## Passo 2: Abrir PowerShell Nesta Pasta

1. Na pasta aberta, clique na **barra de endereço** (onde escreve o caminho)
2. Tipo `powershell` e pressione Enter
3. Abre um terminal preto (PowerShell)

---

## Passo 3: Executar o Setup Automático

No PowerShell que acabou de abrir, copie e cole isto:

```powershell
setup.bat
```

Depois pressione Enter. Vai esperar 2-3 minutos enquanto baixa e instala tudo.

**O que está a fazer:**
- Baixa todas as bibliotecas necessárias
- Configura a pasta do backend
- Configura a pasta do frontend
- Cria arquivo `.env` para credenciais

---

## Passo 4: Configurar o Banco de Dados

Agora precisa de criar a base de dados e adicionar as credenciais.

### 4.1: Criar Base de Dados

No PowerShell, copie e cole isto:

```powershell
createdb rcna
```

Pressione Enter. (Não aparece nada se funcionar - é normal!)

### 4.2: Configurar Credenciais

1. Abra a pasta: `c:\Users\josé massano\bb\RCNA\backend`
2. Procure o arquivo `.env` (arquivo sem nome, com ponto)
3. Clique direita → **Abrir com** → **Bloco de Notas**

Dentro vai ver algo assim:
```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=rcna
PORT=5000
JWT_SECRET=your_secret_key_here
NODE_ENV=development
UPLOAD_DIR=./uploads
```

**Substitua estas linhas:**

Altere:
```
DB_USER=postgres
```

Para:
```
DB_USER=José joão Massano
```

Altere:
```
DB_PASSWORD=your_password
```

Para:
```
DB_PASSWORD=MODELO,2007
```

Altere:
```
JWT_SECRET=your_secret_key_here
```

Para (escolha uma palavra complicada):
```
JWT_SECRET=minha_chave_super_segura_12345xyz
```

Depois pressione **Ctrl + S** para guardar.

### 4.3: Configurar a Base de Dados

Abra PowerShell na pasta `c:\Users\josé massano\bb\RCNA` e execute:

```powershell
cd backend
npm run db:setup
cd ..
```

Verá mensagens. Se aparecer `✓ Base de dados configurada com sucesso!` → Funcionou! ✅

---

# ⚡ INICIAR O PROJETO

## Passo 5: Abrir 2 PowerShells

Agora precisa de **2 janelas PowerShell abertas ao mesmo tempo**.

### PowerShell 1 - Servidor (Backend)

1. Abra PowerShell
2. Navegue para a pasta:
```powershell
cd c:\Users\josé massano\bb\RCNA
```
3. Depois:
```powershell
cd backend
```
4. Depois:
```powershell
npm run dev
```

Vai ver mensagens. Quando aparecer:
```
✓ RCNA Backend rodando na porta 5000
✓ URL: http://localhost:5000
```

→ Deixe esta janela aberta! Não feche.

### PowerShell 2 - Website (Frontend)

1. Abra **outro** PowerShell (janela nova)
2. Navegue para a pasta:
```powershell
cd c:\Users\josé massano\bb\RCNA
```
3. Depois:
```powershell
cd frontend
```
4. Depois:
```powershell
npm start
```

Verá mensagens e depois abre automaticamente uma aba no navegador com:
```
http://localhost:3000
```

Se não abrir, abra manualmente no navegador este endereço.

---

# 🌐 ACESSAR A WEB

Se chegou aqui, **o projeto já está a funcionar!** 🎉

Veja no seu navegador:

```
http://localhost:3000
```

Deve ver uma página como esta:

```
┌─────────────────────────────────────────┐
│  🐕 RCNA                                │
│  Bem-vindo ao RCNA                      │
│  Registro de Cães da Angola             │
│                                         │
│  [Login]  [Registar]                    │
└─────────────────────────────────────────┘
```

---

# 📝 REGISTAR E USAR

## Criar Sua Conta

1. Na página inicial, clique em **[Registar]**
2. Preencha:
   - **Utilizador**: Um nome único (ex: `criador_joao`)
   - **Email**: Seu email (ex: `joao@example.com`)
   - **Palavra-passe**: Uma senha segura (ex: `Senha123!`)
   - **Nome Completo**: Seu nome (ex: `João Silva`)
   - **Telefone**: Seu telefone (ex: `+244920000000`)
   - **Endereço**: Seu endereço
   - **Cidade**: Sua cidade (ex: `Luanda`)
   - **Província**: Sua província
   - **Tipo de Conta**: Escolha `Criador`
3. Clique em **[Registar]**

Pronto! Sua conta foi criada.

## Fazer Login

1. Clique em **[Login]**
2. Escreva o utilizador e senha que criou
3. Clique em **[Login]**

Vê agora um **Dashboard** com opções.

---

# 🐕 OPERAÇÕES PRINCIPAIS

## Operação 1: Registar um Cão

### Passo a Passo:

1. No menu superior, clique em **[Cães]**
2. Clique em **[+ Adicionar Cão]**
3. Preencha o formulário:
   - **Nome**: Nome do seu cão (ex: `Rex`)
   - **Raça**: Escolha uma da lista (ex: `Pastor Alemão`)
   - **Data de Nascimento**: Clique no campo e escolha a data
   - **Sexo**: Escolha `Macho` ou `Fêmea`
   - **Cor**: Cor do cão (ex: `Castanho e Preto`)
   - **Microchip ID**: Se tiver (opcional)

4. Clique em **[Registar Cão]**

### O Que Acontece:

- O sistema **gera automaticamente um ID único**
- Formato: `REG-260311-0001`
- Exemplo: `REG` = Registro, `26` = ano 2026, `03` = mês, `11` = dia, `0001` = ordem do dia
- Verá este ID na lista de cães

---

## Operação 2: Ver Pedigree (Genealogia)

### Passo a Passo:

1. Aceda a **[Cães]** no menu
2. Encontre o cão na tabela
3. Clique em **[Pedigree]**

### O Que Vê:

Uma árvore genealógica assim:

```
             Avó Paternal  │  Avó Maternal
                   ↓            ↓
              Pai ─────── Mãe
                   ↓
                 Rex (seu cão)
```

Mostra até 3 gerações:
- **Geração 2**: Avós (pai e mãe dos pais)
- **Geração 1**: Pais
- **Geração 0**: O seu cão

---

## Operação 3: Registar um Cruzamento

### Passo a Passo:

1. No menu, clique em **[Cruzamentos]**
2. Clique em **[+ Novo Cruzamento]**
3. Preencha:
   - **Pai (Macho)**: Escolha um cão macho da lista (ex: `Rex`)
   - **Mãe (Fêmea)**: Escolha um cão fêmea da lista (ex: `Luna`)
   - **Data do Cruzamento**: Quando foi o acasalamento
   - **Número Esperado de Filhotes**: Quantos filhotes espera (opcional)

4. Clique em **[Registar Cruzamento]**

### O Que Acontece:

- O sistema **detecta automaticamente se há consanguinidade**
- Consanguinidade = cruzamento entre parentes
- Se houver aviso, significa que têm ancestrais em comum
- O cruzamento fica com status `planned` (planejado)

---

## Operação 4: Registar Raças (Admin Apenas)

Se tiver acesso de Admin (peça ao administrador):

1. No menu, clique em **[Raças]**
2. Clique em **[+ Adicionar Raça]**
3. Preencha:
   - **Nome**: Nome da raça (ex: `Dogo Argentino`)
   - **Descrição**: Informações sobre a raça
   - **Origem**: País de origem
   - **Características**: Traços físicos
   - **Peso Mínimo/Máximo**: Em kg

4. Clique em **[Adicionar Raça]**

---

# ❓ PERGUNTAS FREQUENTES

## P: Como parar o programa?

R: Nos PowerShells, pressione `Ctrl + C` para parar.

---

## P: Quero parar e depois voltar a começar. O que faço?

R: 
1. Feche os PowerShells (Ctrl + C)
2. Abra 2 PowerShells novos
3. PowerShell 1: `cd c:\Users\josé massano\bb\RCNA\backend` depois `npm run dev`
4. PowerShell 2: `cd c:\Users\josé massano\bb\RCNA\frontend` depois `npm start`
5. Pronto!

---

## P: Aparecer um erro "Port already in use"?

R: Significa que a porta 5000 ou 3000 já está em uso.

Solução rápida:
1. Feche todos os PowerShells
2. Espere 30 segundos
3. Abra tudo de novo

---

## P: Esqueci-me da senha. Como reset?

R: Infelizmente nesta versão não há sistema de reset. Pode:
1. Registar uma nova conta com outro utilizador
2. Pedir ao admin para deletar sua conta

---

## P: Os dados são guardados?

R: Sim! Tudo é guardado na base de dados PostgreSQL.

Se fechar a janela e reabrir depois, todos os cães e cruzamentos continuam lá.

---

## P: Posso usar em móvel?

R: Não nesta versão. É apenas para computador.

---

## P: Como faço backup dos dados?

R: Copie o arquivo da base de dados ou execute:

```powershell
pg_dump -U "José joão Massano" rcna > backup.sql
```

---

## P: Preciso de internet?

R: Não! Está tudo local no seu computador. Funciona sem internet.

---

## P: Como convido outras pessoas a usar?

R: Enquanto o PowerShell estiver rodando:
1. As outras pessoas precisam estar na mesma rede Wi-Fi
2. Descubra o IP do seu PC: `ipconfig` no PowerShell
3. Exemplo: `192.168.1.5:3000`
4. Elas acedem em: `http://192.168.1.5:3000`

---

# 🆘 PROBLEMAS COMUNS

## Problema 1: "Cannot connect to database"

**Causa**: PostgreSQL não está rodando ou credenciais erradas.

**Solução**:
1. Verificar se PostgreSQL está instalado
2. Verificar credenciais no arquivo `.env`
3. Verificar se a database `rcna` foi criada:
   ```powershell
   psql -U "José joão Massano" -d rcna -c "SELECT 1"
   ```

---

## Problema 2: "Module not found"

**Causa**: Bibliotecas não foram instaladas.

**Solução**:
```powershell
cd c:\Users\josé massano\bb\RCNA\backend
npm install
cd ..
cd frontend
npm install
```

---

## Problema 3: Vejo HTML em branco no navegador

**Causa**: Frontend ainda está a compilar.

**Solução**:
1. Espere 30 segundos
2. Atualize a página (Pressione F5)
3. Se continuar, reinicie o PowerShell do frontend

---

## Problema 4: "Address already in use"

**Causa**: Porta 3000 ou 5000 já estão em uso.

**Solução**:
1. Feche todos os PowerShells
2. Se problema persistir:
   ```powershell
   Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process
   ```

---

# ✅ CHECKLIST FINAL

Antes de começar, certifique-se que:

- [ ] Node.js instalado
- [ ] PostgreSQL instalado  
- [ ] Pasta do projeto existe
- [ ] Executou `setup.bat` com sucesso
- [ ] Criou a database: `createdb rcna`
- [ ] Configurou `.env` com credenciais
- [ ] Executou `npm run db:setup`
- [ ] Backend rodando na porta 5000
- [ ] Frontend rodando na porta 3000
- [ ] Pode abrir http://localhost:3000 no navegador
- [ ] Registou-se com sucesso

---

# 🎉 PARABÉNS!

Se conseguiu chegar aqui, **seu projeto RCNA está funcionando!**

Agora pode:
- ✅ Registar cães
- ✅ Ver pedigree
- ✅ Registar cruzamentos
- ✅ Detectar consanguinidade
- ✅ Gerenciar raças

**Aproveite! 🐕**

---

**Dúvidas?** Releia este guia ou consulte os outros arquivos de documentação.

**Última atualização:** 11 de março de 2026
