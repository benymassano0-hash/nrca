# Arquitetura do Sistema - RCNA

## Diagrama de Camadas

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENTE (Browser)                        │
│                          http://localhost:3000                  │
└────────────────────────────┬─────────────────────────────────────┘
                             │
                    HTTP/HTTPS (fetch/axios)
                             │
┌────────────────────────────▼─────────────────────────────────────┐
│                   FRONTEND (React SPA)                           │
│  ┌──────────────────────────────────────────────────────┐        │
│  │  Pages: Home, Login, Dashboard, Dogs, Breeds...     │        │
│  │  Components: Navbar, PrivateRoute, Forms, Tables    │        │
│  │  API Client: axios com interceptor JWT              │        │
│  │  Storage: localStorage para token                   │        │
│  └──────────────────────────────────────────────────────┘        │
└────────────────────────────┬──────────────────────────────────────┘
                             │
                    REST API Gateway
                    (Bearer Token JWT)
                             │
┌────────────────────────────▼──────────────────────────────────────┐
│                  BACKEND (Node.js + Express)                      │
│                  http://localhost:5000/api                        │
│  ┌──────────────────────────────────────────────────────┐         │
│  │ Routes (5 principais):                               │         │
│  │  • /users      - Autenticação e gestão de conta      │         │
│  │  • /breeds     - Gestão de raças                     │         │
│  │  • /dogs       - Registro de cães                    │         │
│  │  • /breedings  - Gestão de cruzamentos               │         │
│  │  • /pedigree   - Genealogia e consanguinidade        │         │
│  └──────────────────────────────────────────────────────┘         │
│  ┌──────────────────────────────────────────────────────┐         │
│  │ Controllers (Lógica de Negócio):                     │         │
│  │  • usersController        → Auth, Perfil            │         │
│  │  • breedsController       → CRUD Raças              │         │
│  │  • dogsController         → CRUD Cães, ID genoração │         │
│  │  • breedingsController    → CRUD Cruzamentos        │         │
│  │  • pedigreeController     → Genealogia, Análise     │         │
│  └──────────────────────────────────────────────────────┘         │
│  ┌──────────────────────────────────────────────────────┐         │
│  │ Middleware:                                          │         │
│  │  • auth.js - Verificação JWT, Autorização           │         │
│  │  • CORS - Configuração de cross-origin              │         │
│  └──────────────────────────────────────────────────────┘         │
└────────────────────────────┬───────────────────────────────────────┘
                             │
                    PostgreSQL Wire Protocol
                             │
┌────────────────────────────▼───────────────────────────────────────┐
│              DATABASE (PostgreSQL)                                 │
│              localhost:5432/rcna                                   │
│  ┌──────────────────────────────────────────────────────┐          │
│  │ Tabelas:                                             │          │
│  │  • users         - Utilizadores (Admin, Criador)    │          │
│  │  • breeds        - Raças de cães                     │          │
│  │  • dogs          - Cães registados                   │          │
│  │  • breedings     - Cruzamentos                       │          │
│  │  • pedigrees     - Genealogia (cache)                │          │
│  │  • dog_ownership - Histórico de propriedade          │          │
│  │  • + índices para performance                        │          │
│  └──────────────────────────────────────────────────────┘          │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Fluxo de Autenticação

```
┌─────────────────┐
│   User Login    │
│  username/pwd   │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│   POST /api/users/login                 │
│   {username: "user", password: "pwd"}   │
└────────┬────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│  Hash password com bcryptjs      │
│  Compare com hash armazenado     │
└────────┬─────────────────────────┘
         │
    ✓ Match?
    │    │
    │    ▼
    │  ✗ (401 Unauthorized)
    │
    ▼
┌──────────────────────────────────┐
│  Gerar JWT Token (válido 7 dias) │
│  payload: {id, username, type}   │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│  Responder com Token              │
│  {token, user: {...}}             │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│  Client armazena token            │
│  localStorage.setItem('token')    │
└────────┬─────────────────────────┘
         │
         ▼
┌────────────────────────────────────────────┐
│  Próximas requisições incluem:             │
│  Authorization: Bearer eyJhbGc...          │
└────────┬─────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│  Middleware auth.js              │
│  Verifica e valida token         │
└────────┬─────────────────────────┘
         │
   ✓ Válido?  ✗ Expirou ou Inválido
    │              │
    ▼              ▼
Continuar       (403 Forbidden)
```

---

## Fluxo de Registro de um Cão

```
┌──────────────────────────┐
│  Criador preenche form   │
│  • name: "Rex"           │
│  • breed_id: 1           │
│  • gender: "M"           │
│  • birthdate: "2023-01"  │
└────────┬─────────────────┘
         │
         ▼
┌────────────────────────────────────┐
│  POST /api/dogs (com JWT Token)    │
│  Validar dados no controller       │
└────────┬─────────────────────────────┘
         │
         ▼
┌───────────────────────────────────────────┐
│  Gerar Registration ID                    │
│  • Buscar data atual: 2026-03-11          │
│  • Contar cães registrados hoje: 1        │
│  • Formato: REG-260311-0001               │
│  • Armazenar no BD                        │
└────────┬────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Inserir registro na tabela 'dogs'  │
│  __________________________________│
│  | id | registration_id | name     │ ← REG-260311-0001
│  |uuid| REG-260311-0001 | Rex      │
│  | ... | ... | ... |                │
└────────┬──────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Retornar cão criado (201 Created)  │
│  {                                  │
│    "id": "uuid-123",                │
│    "registration_id": "REG-...",    │
│    "name": "Rex",                   │
│    "breed_name": "Pastor Alemão",   │
│    ...                              │
│  }                                  │
└────────┬──────────────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│  Frontend exibe sucesso      │
│  "Cão registado com ID..."   │
└──────────────────────────────┘
```

---

## Fluxo de Consulta de Pedigree

```
┌──────────────────────────┐
│  User busca por ID       │
│  REG-260311-0001         │
└────────┬─────────────────┘
         │
         ▼
┌────────────────────────────────────────┐
│  GET /api/pedigree/registration/:id    │
│  (com JWT Token do utilizador)         │
└────────┬─────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│  Frontend navega para /pedigree/:id      │
│  Componente PedigreePage monta           │
└────────┬───────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────┐
│  Buscar cão e genealogia no BD:        │
│                                        │
│  1. Encontrar cão por registration_id  │
│  2. LEFT JOIN com:                     │
│     - Pai (father_id)                  │
│     - Mãe (mother_id)                  │
│     - Avó/Avô paterno (2 gerações)     │
│     - Avó/Avô materno (2 gerações)     │
└────────┬──────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────┐
│  Resultado (3 gerações):           │
│  ┌─────────────────────┐           │
│  │   Geração 2         │           │
│  │ AvóP  AvóM  AvóM    │           │
│  │       Geração 1     │           │
│  │        Pai   Mãe    │           │
│  │        Geração 0    │           │
│  │          REX        │           │
│  └─────────────────────┘           │
└────────┬──────────────────────────────┘
         │
         ▼
┌────────────────────────────────────┐
│  Renderizar tabela visual          │
│  com árvore genealógica            │
│  (PedigreePage.js)                 │
└────────────────────────────────────┘
```

---

## Fluxo de Verificação de Consanguinidade

```
┌─────────────────────────────┐
│  Criador tenta novo cruzamento:
│  • Seleciona Pai: Rex        │
│  • Seleciona Mãe: Luna       │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  Antes de criar, verificar relação      │
│  POST /api/pedigree/check-consanguinity │
│  {father_id: uuid-rex, mother_id: ...}  │
└────────┬────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│  Buscar ancestrais do pai:           │
│  • Recursive CTE SQL até 3 gerações  │
│  • Coletar IDs em lista              │
└────────┬─────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│  Buscar ancestrais da mãe:           │
│  • Recursive CTE SQL até 3 gerações  │
│  • Coletar IDs em lista              │
└────────┬─────────────────────────────┘
         │
         ▼
┌───────────────────────────────────────┐
│  Comparar listas:                     │
│  list_pai ∩ list_mae = ?              │
└────────┬────────────────────────────┘
         │
   ┌─────┴──────────┐
   │                │
   ▼ Sim            ▼ Não
┌─────────────┐  ┌─────────────────────┐
│ Comum?      │  │ Sem relação comum   │
│ ⚠️  AVISO     │  │ ✓ OK para cruzar    │
│ Consangui-  │  │                     │
│ neidade!    │  │ {                   │
│             │  │  has_common: false, │
│ {           │  │  common_count: 0,   │
│  has_common:│  │  ancestors_ids: []  │
│  true,      │  │ }                   │
│  common_c: 2│  └─────────────────────┘
│  ancestors: │
│  [uuid-1,2] │
│ }           │
└─────────────┘
```

---

## Estrutura de Dados - Exemplo Completo

```
┌─────────────────────────────────────────────────────────┐
│  BREED (Raça)                                           │
├─────────────────────────────────────────────────────────┤
│ id: 1                                                   │
│ name: "Pastor Alemão"                                   │
│ origin: "Alemanha"                                      │
│ min_weight: 25kg                                        │
│ max_weight: 40kg                                        │
│ characteristics: "Inteligente, leal, versátil"          │
└─────────────────────────────────────────────────────────┘
                         ▲
                         │ 1:N
                         │
         ┌───────────────┴──────────────┐
         │                              │
         ▼                              ▼
    ┌─────────────────────┐         ┌──────────────┐
    │  DOG (Cão)          │         │ BREEDING     │
    ├─────────────────────┤         │(Cruzamento)  │
    │ id: uuid1           │         ├──────────────┤
    │ reg_id: REG-260311  │         │ id: uuid-b1  │
    │ name: Rex           │         │ father_id: ◀─┼──┐
    │ breed_id: 1         │         │ mother_id: ◀─┼──┐
    │ birth_date: 2023-01 │         │ breeder_id:  │
    │ gender: M           │         │ breed_date:  │
    │ father_id: null     │         │ status:      │
    │ mother_id: null     │         │ puppies: 6   │
    │ breeder_id: user-2  │         └──────────────┘
    │ owner_id: null      │
    └─────────────────────┘
                │ 1
                │ 
                ├──father_id──┐
                │             │
                └─mother_id───┤
                              │
                         ▼ N:1
                    ┌─────────────┐
                    │ DOG (Rex)   │
                    │ DOG (Luna)  │
                    └─────────────┘

    FILE Pedigree (Genealogia):
    ┌──────────────────────────┐
    │ PEDIGREE (3 gerações)    │
    ├──────────────────────────┤
    │ id: pedigree-uuid        │
    │ dog_id: rex-uuid         │
    │ father_id: thor-uuid     │
    │ mother_id: luna-uuid     │
    │ pat_grandfather: max     │
    │ pat_grandmother: bella   │
    │ mat_grandfather: duke    │
    │ mat_grandmother: daisy   │
    │ generations_back: 2      │
    └──────────────────────────┘
```

---

## Modelo de Segurança

```
┌──────────────────────────────────────────┐
│  SEGURANÇA                               │
├──────────────────────────────────────────┤
│                                          │
│  1. PASSWORD SECURITY                    │
│     • Hash: bcryptjs (10 rounds)         │
│     • Nunca armazenado em plain text     │
│     • Login: comparar hashes             │
│                                          │
│  2. JWT TOKEN                            │
│     • Algoritmo: HS256                   │
│     • Validade: 7 dias                   │
│     • Payload: {id, username, type}     │
│     • Secret: Variável de ambiente       │
│                                          │
│  3. MIDDLEWARE AUTENTICAÇÃO              │
│     • Verificar Bearer Token             │
│     • Validar assinatura                 │
│     • Extrair user info                  │
│                                          │
│  4. AUTORIZAÇÃO POR ROLE                 │
│     • admin   → Tudo                      │
│     • breeder → Seus cães/cruzamentos    │
│     • viewer  → Apenas leitura           │
│                                          │
│  5. CORS POLICY                          │
│     • Frontend: localhost:3000           │
│     • Backend: localhost:5000            │
│                                          │
│  6. VARIÁVEIS DE AMBIENTE                │
│     • JWT_SECRET (seguro)                │
│     • DB credenciais (seguro)            │
│     • .env não commitado no git          │
│                                          │
└──────────────────────────────────────────┘
```

---

## Estratégia de ID para Cães

```
┌────────────────────────────────────┐
│  ID REGISTRATION (Automático)      │
├────────────────────────────────────┤
│  Formato: REG-YYMMDD-XXXX          │
│                                    │
│  REG = Prefixo (Registro)          │
│  YY  = Ano últimos 2 dígitos (26)  │
│  MM  = Mês (01-12)                 │
│  DD  = Dia (01-31)                 │
│  XXXX = Sequência do dia (0001)    │
│                                    │
│  Exemplos:                         │
│  • REG-260311-0001  (11/3/26, 1º)  │
│  • REG-260311-0002  (11/3/26, 2º)  │
│  • REG-260312-0001  (12/3/26, 1º)  │
│  • REG-261201-0050  (1/12/26, 50º) │
│                                    │
│  Vantagens:                        │
│  ✓ Único e sequencial              │
│  ✓ Contém data de registro         │
│  ✓ Fácil de ler e memorizar        │
│  ✓ Inteligível (REG = Registro)    │
│  ✓ Escalável                       │
│                                    │
│  Geração (SQL):                    │
│  1. Extrair data atual             │
│  2. Formatar: REG-YYMMDD           │
│  3. Contar registos do dia         │
│  4. Incrementar sequência          │
│  5. Validar unicidade no BD        │
│                                    │
└────────────────────────────────────┘
```

---

## Performance e Escalabilidade

```
┌──────────────────────────────────────────┐
│  OTIMIZAÇÕES IMPLEMENTADAS              │
├──────────────────────────────────────────┤
│                                          │
│  DATABASE:                               │
│  • Índices em colunas frequentes:       │
│    - breeds.name (busca por raça)       │
│    - dogs.breeder_id (cães do criador)  │
│    - dogs.owner_id (propriedade)        │
│    - breedings.father/mother_id         │
│    - pedigrees.dog_id                   │
│                                          │
│  • Foreign Keys para integridade        │
│  • Constraints: NOT NULL, UNIQUE        │
│  • Triggers possíveis para auditoria    │
│                                          │
│  API:                                    │
│  • Pool de conexões (10 conexões)       │
│  • Paginação (futura)                   │
│  • Cache (Redis - futura)               │
│  • Compressão gzip                      │
│                                          │
│  FRONTEND:                               │
│  • Code splitting (lazy loading)        │
│  • localStorage para token              │
│  • Memoization de componentes           │
│  • Minimal re-renders                   │
│                                          │
│  PREVISÕES:                              │
│  • ~100k cães: OK                       │
│  • ~50k utilizadores: OK                │
│  • ~10k cruzamentos/mês: OK             │
│  • Melhorias futuras: Sharding, Cache   │
│                                          │
└──────────────────────────────────────────┘
```

---

**Versão: 1.0.0**  
**Data: 11 de março de 2026**
