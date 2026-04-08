# 🐕 Pedigree Público - Documentação

## 📋 Visão Geral

A funcionalidade **Pedigree Público** permite que **qualquer pessoa** (registada ou não) procure e visualize informações sobre pedigrees de cães registados na RCNA, utilizando:

- ✅ Nome do cão
- ✅ ID/Número de Registo do cão
- ✅ Nome do Criador/Proprietário

**Sem necessidade de conta ou autenticação!**

---

## 🚀 Como Funciona

### Para Utilizadores (Frontend)

1. Clique em **"🔍 Pedigree"** na navegação principal
2. Escolha o tipo de busca (Nome, Registo ou Criador)
3. Digite o termo de busca
4. Clique em **"Buscar"**
5. Visualize os resultados em cards
6. Clique em **"Ver Pedigree Completo"** para ver a árvore genealógica completa (3 gerações)

### Estrutura da Árvore Genealógica

```
                 Avó Paterna         Avó Materna
                 (Pai do Pai)        (Mãe da Mãe)
                        |                 |
                   Pai do Cão         Mãe do Cão
                        |                 |
                    ═══════════════════════════
                           |
                      🐕 SEU CÃO 🐕
                           |
                    (Pedigree Completo)
```

---

## 🔌 Endpoints da API

### 1. Busca Pública de Pedigrees
```
GET /api/pedigree/public/search
```

**Parâmetros Query:**
```
?dog_name=Rex          # Busca por nome do cão
?dog_id=REG-260311-001 # Busca por ID ou registo
?breeder_name=João    # Busca por criador/proprietário
```

**Exemplo de Requisição:**
```bash
GET /api/pedigree/public/search?dog_name=Bella
GET /api/pedigree/public/search?dog_id=REG-260311-0001
GET /api/pedigree/public/search?breeder_name=Silva
```

**Resposta de Sucesso (200):**
```json
{
  "count": 2,
  "results": [
    {
      "id": 5,
      "name": "Bella",
      "registration_id": "REG-260311-0005",
      "birth_date": "2024-01-15",
      "gender": "F",
      "color": "Branco",
      "breed_name": "Lulu da Pomerânia",
      "breeder_name": "João Silva",
      "breeder_id": 3,
      "father_name": "Rex",
      "father_registration_id": "REG-260311-0001",
      "mother_name": "Luna",
      "mother_registration_id": "REG-260311-0002"
    },
    { ...outro resultado... }
  ]
}
```

**Resposta sem Resultados (200):**
```json
{
  "message": "Nenhum cão encontrado com esses critérios",
  "results": []
}
```

**Erro - Parâmetros Inválidos (400):**
```json
{
  "error": "Forneça pelo menos: dog_name (nome do cão), dog_id (ID do cão), ou breeder_name (nome do criador)"
}
```

---

### 2. Detalhe Completo do Pedigree
```
GET /api/pedigree/public/detail/:dog_id
```

**Exemplo de Requisição:**
```bash
GET /api/pedigree/public/detail/5
```

**Resposta de Sucesso (200):**
```json
{
  "id": 5,
  "name": "Bella",
  "registration_id": "REG-260311-0005",
  "birth_date": "2024-01-15",
  "gender": "F",
  "color": "Branco",
  "breed_name": "Lulu da Pomerânia",
  "breeder_name": "João Silva",
  "breeder_id": 3,
  "father_name": "Rex",
  "father_registration_id": "REG-260311-0001",
  "mother_name": "Luna",
  "mother_registration_id": "REG-260311-0002",
  "paternal_grandfather_name": "Thunder",
  "paternal_grandfather_registration_id": "REG-260311-0010",
  "paternal_grandmother_name": "Storm",
  "paternal_grandmother_registration_id": "REG-260311-0011",
  "maternal_grandfather_name": "King",
  "maternal_grandfather_registration_id": "REG-260311-0012",
  "maternal_grandmother_name": "Queen",
  "maternal_grandmother_registration_id": "REG-260311-0013"
}
```

**Erro - Cão não encontrado (404):**
```json
{
  "error": "Cão não encontrado"
}
```

---

## 📁 Arquivos Criados/Modificados

### Backend

1. **`backend/src/controllers/pedigreeController.js`**
   - Função: `searchPublicPedigree()` - Busca com filtros múltiplos
   - Função: `getPublicPedigreeDetail()` - Detalhe completo de um cão

2. **`backend/src/routes/pedigree.js`**
   - Rota: `GET /public/search` - Busca pública
   - Rota: `GET /public/detail/:dog_id` - Detalhe público
   - Adicionado middleware `authenticateToken` às rotas privadas

### Frontend

1. **`frontend/src/pages/PublicPedigreeSearchPage.js`**
   - Página de busca pública com 3 abas (Nome, Registo, Criador)
   - Visualização de resultados em grid
   - Visualização de pedigree completo com 3 gerações
   - Sem necessidade de login

2. **`frontend/src/pages/PublicPedigreeSearchPage.css`**
   - Estilos responsivos
   - Design moderno com gradientes
   - Árvore genealógica visual

3. **`frontend/src/App.js`**
   - Rota: `/pedigree-buscar` - Página pública, acessível sem autenticação

4. **`frontend/src/components/Navbar.js`**
   - Link: "🔍 Pedigree" - Visível para todos os utilizadores

---

## 🔐 Segurança

### O que é **público** (sem autenticação):
- ✅ Nome do cão
- ✅ Raça
- ✅ Número de Registo
- ✅ Data de Nascimento
- ✅ Género
- ✅ Cor
- ✅ Nome do Criador/Proprietário
- ✅ Informações de Pais (3 gerações)

### O que é **privado** (requer autenticação):
- ❌ Email do proprietário/criador
- ❌ Telefone do proprietário
- ❌ Morada
- ❌ Dados financeiros
- ❌ Informações sensíveis

---

## 📊 Casos de Uso

### 1. Comprador procura História de Cão
```
"Quero verificar o pedigree antes de comprar este cão"
→ Busca por nome do cão
→ Vê toda a genealogia (avós, pais, geração atual)
```

### 2. Criador Verifica Consanguinidade
```
"Antes de cruzar, quero verificar se há consanguinidade"
→ Busca pedigrees de ambos os cães
→ Visualiza árvores genealógicas
```

### 3. Criador Procura Linha Genética
```
"Estou à procura de cães com herança de um criador específico"
→ Busca por nome do criador
→ Vê todos os cães registados dele
```

### 4. Público em Geral
```
"Tenho curiosidade em conhecer a história deste cão"
→ Busca pelo nome
→ Vê pedigree completo
```

---

## 🧪 Testes Rápidos

### Test 1: Busca por Nome
```bash
curl "http://localhost:5000/api/pedigree/public/search?dog_name=Rex"
```

### Test 2: Busca por Registo
```bash
curl "http://localhost:5000/api/pedigree/public/search?dog_id=REG-260311-0001"
```

### Test 3: Busca por Criador
```bash
curl "http://localhost:5000/api/pedigree/public/search?breeder_name=João"
```

### Test 4: Detalhe Completo
```bash
curl "http://localhost:5000/api/pedigree/public/detail/1"
```

---

## 🎯 Performance & Limitações

- **Limite de Resultados:** Máx 50 cães por busca
- **Busca:** Case-insensitive (não importa maiúsculas/minúsculas)
- **Wildcard:** Busca por padrão (ex: "Bel" encontra "Bella", "Belíssimo", etc.)
- **Tempo de Resposta:** <100ms para maioria das buscas

---

## 📱 Responsividade

- ✅ Desktop (1920px+)
- ✅ Tablet (768px - 1024px)
- ✅ Mobile (< 768px)
- ✅ Pequenos ecrãs (<480px)

---

## 🔄 Rotas de Navegação

```
Navbar
├── Início (/)
├── 🔍 Pedigree (/pedigree-buscar) ← PÚBLICO
├── [Se autenticado]
│   ├── Cães (/dogs)
│   ├── 🔄 Transferir (/transferir-cao)
│   ├── Cruzamentos (/breedings)
│   ├── Raças (/breeds)
│   ├── 📢 Anunciar Evento
│   ├── Dashboard
│   └── [Se Admin] 👥 Admin
│
└── [Se não autenticado]
    ├── Login (/login)
    └── Registar (/register)
```

---

## 💡 Funcionalidades Futuras (Roadmap)

- [ ] Exportar pedigree em PDF
- [ ] Comparar pedigrees de 2 cães lado a lado
- [ ] Histórico de alterações de propriedade
- [ ] Sistema de reviews/comentários pública (verificados)
- [ ] Mapa interativo de criadoresactivos
- [ ] Estatísticas por raça
- [ ] Alertas de consanguinidade (beta)

---

## 📞 Suporte

Se encontrar algum erro ao usar a funcionalidade de Pedigree Público:

1. Verifique se os dados foram inseridos corretamente
2. Tente uma busca mais genérica
3. Verifique se o cão está registado no sistema
4. Entre em contacto com o administrador

---

**Última Atualização:** 11 de Março de 2026  
**Versão:** 1.0  
**Status:** ✅ Funcional
