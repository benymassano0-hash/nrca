# 🎪 API de Eventos - Documentação Técnica

Endpoints da API REST para gerenciamento de eventos de canicultura.

---

## 📋 Base URL

```
http://localhost:5000/api/events
```

---

## 🔐 Autenticação

A maioria dos endpoints requer token JWT no header:

```
Authorization: Bearer <seu_token_jwt>
```

---

## 📡 Endpoints

### 1️⃣ Obter Eventos Publicados (Público)

**GET** `/published`

Retorna todos os eventos aprovados e publicados.

**Response:**
```json
[
  {
    "id": "uuid-xxx",
    "title": "Exposição Canina de Luanda",
    "description": "Grande exposição...",
    "category": "Exposição",
    "event_date": "2026-04-15",
    "event_time": "09:00:00",
    "location": "Estádio 11 Novembro",
    "province": "Luanda",
    "image_url": "https://...",
    "video_url": "https://...",
    "max_attendees": 500,
    "attendees_count": 0,
    "is_approved": true,
    "status": "published",
    "creator_id": "uuid-yyy",
    "full_name": "José João Massano",
    "username": "jmassano",
    "created_at": "2026-03-11T10:00:00Z",
    "updated_at": "2026-03-11T10:00:00Z"
  }
]
```

**Status**: 200 OK

---

### 2️⃣ Obter Detalhes de um Evento (Público)

**GET** `/details/:id`

Retorna informações completas de um evento específico.

**Parameters:**
- `id` (UUID): ID do evento

**Response:**
```json
{
  "id": "uuid-xxx",
  "title": "Exposição Canina de Luanda",
  "description": "Grande exposição...",
  "category": "Exposição",
  "event_date": "2026-04-15",
  "event_time": "09:00:00",
  "location": "Estádio 11 Novembro",
  "province": "Luanda",
  "image_url": "https://...",
  "video_url": "https://...",
  "max_attendees": 500,
  "attendees_count": 0,
  "is_approved": true,
  "status": "published",
  "creator_id": "uuid-yyy",
  "full_name": "José João Massano",
  "phone": "+351 935013630",
  "email": "josejoaomasssano@gmail.com",
  "address": "Rua xxx",
  "city": "Luanda",
  "province": "Luanda",
  "created_at": "2026-03-11T10:00:00Z"
}
```

**Status**: 200 OK ou 404 Not Found

---

### 3️⃣ Obter Meus Eventos (Autenticado)

**GET** `/my-events`

Retorna todos os eventos do criador logado.

**Headers Required:**
```
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": "uuid-xxx",
    "creator_id": "uuid-seu-id",
    "title": "Meu Primeiro Evento",
    "description": "...",
    "category": "Competição",
    "event_date": "2026-05-10",
    "event_time": "10:00:00",
    "location": "Bengo",
    "province": "Bengo",
    "image_url": "",
    "video_url": "",
    "max_attendees": null,
    "attendees_count": 0,
    "is_approved": false,
    "status": "draft",
    "created_at": "2026-03-11T15:30:00Z",
    "updated_at": "2026-03-11T15:30:00Z"
  }
]
```

**Status**: 200 OK

---

### 4️⃣ Criar Novo Evento (Autenticado)

**POST** `/create`

Cria um novo evento em estado "draft".

**Headers Required:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Exposição de Filhotes",
  "description": "Mostra de filhotes de raça pura",
  "category": "Show de Filhotes",
  "event_date": "2026-05-20",
  "event_time": "14:00",
  "location": "Parque Urbano da Argola",
  "province": "Luanda",
  "image_url": "https://example.com/image.jpg",
  "video_url": "https://youtube.com/watch?v=xxx",
  "max_attendees": 300
}
```

**Required Fields:**
- `title` (string, max 255)
- `category` (enum: Exposição, Competição, Evento Educativo, Encontro Profissional, Show de Filhotes, Outro)
- `event_date` (date: YYYY-MM-DD)
- `location` (string, max 255)

**Optional Fields:**
- `description` (text)
- `event_time` (time: HH:MM)
- `province` (string)
- `image_url` (URL)
- `video_url` (URL)
- `max_attendees` (integer)

**Response:**
```json
{
  "message": "Evento criado com sucesso! Aguardando aprovação do administrador.",
  "event": {
    "id": "uuid-novo",
    "creator_id": "uuid-seu-id",
    "title": "Exposição de Filhotes",
    "status": "draft",
    "is_approved": false,
    ...
  }
}
```

**Status**: 201 Created

---

### 5️⃣ Atualizar Evento (Autenticado)

**PUT** `/:id`

Atualiza um evento. Apenas o criador ou admin podem editar.

**Headers Required:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Parameters:**
- `id` (UUID): ID do evento

**Request Body:**
```json
{
  "title": "Novo Título",
  "description": "Nova descrição",
  "category": "Exposição",
  "event_date": "2026-05-25",
  "event_time": "15:00",
  "location": "Novo Local",
  "province": "Bengo",
  "image_url": "https://nova-url.jpg",
  "video_url": "https://novo-video.mp4",
  "max_attendees": 400
}
```

**Response:**
```json
{
  "message": "Evento atualizado com sucesso!",
  "event": {
    "id": "uuid-xxx",
    "title": "Novo Título",
    ...
  }
}
```

**Status**: 200 OK ou 403 Forbidden

---

### 6️⃣ Publicar Evento (Autenticado)

**PUT** `/:id/publish`

Move evento de "draft" para "published" (aguardando aprovação).

**Headers Required:**
```
Authorization: Bearer <token>
```

**Parameters:**
- `id` (UUID): ID do evento

**Response:**
```json
{
  "message": "Evento publicado! Aguardando aprovação do administrador.",
  "event": {
    "id": "uuid-xxx",
    "status": "published",
    "is_approved": false,
    ...
  }
}
```

**Status**: 200 OK

---

### 7️⃣ Cancelar Evento (Autenticado)

**PUT** `/:id/cancel`

Marca evento como cancelado.

**Headers Required:**
```
Authorization: Bearer <token>
```

**Parameters:**
- `id` (UUID): ID do evento

**Response:**
```json
{
  "message": "Evento cancelado com sucesso!",
  "event": {
    "id": "uuid-xxx",
    "status": "cancelled",
    ...
  }
}
```

**Status**: 200 OK

---

### 8️⃣ Deletar Evento (Autenticado)

**DELETE** `/:id`

Remove completamente um evento. Apenas criador ou admin.

**Headers Required:**
```
Authorization: Bearer <token>
```

**Parameters:**
- `id` (UUID): ID do evento

**Response:**
```json
{
  "message": "Evento deletado com sucesso!"
}
```

**Status**: 200 OK

---

### 9️⃣ Obter Eventos Pendentes (Admin Only)

**GET** `/pending-approval`

Lista eventos publicados que aguardam aprovação do admin.

**Headers Required:**
```
Authorization: Bearer <admin-token>
```

**Response:**
```json
[
  {
    "id": "uuid-xxx",
    "title": "Novo Evento de Criador",
    "creator_id": "uuid-criador",
    "full_name": "José Silva",
    "username": "jsilva",
    "status": "published",
    "is_approved": false,
    ...
  }
]
```

**Status**: 200 OK ou 403 Forbidden

---

### 🔟 Aprovar Evento (Admin Only)

**PUT** `/:id/approve`

Aprova um evento pendente.

**Headers Required:**
```
Authorization: Bearer <admin-token>
```

**Parameters:**
- `id` (UUID): ID do evento

**Response:**
```json
{
  "message": "Evento aprovado com sucesso!",
  "event": {
    "id": "uuid-xxx",
    "is_approved": true,
    ...
  }
}
```

**Status**: 200 OK ou 403 Forbidden

---

## 📊 Estrutura de Dados

### Event Object

```typescript
{
  id: UUID,                    // Identificador único
  creator_id: UUID,            // Quem criou o evento
  title: string,               // Título (max 255)
  description: string,         // Descrição completa
  category: string,            // Exposição, Competição, etc.
  event_date: date,            // Data do evento (YYYY-MM-DD)
  event_time: time,            // Hora (HH:MM:SS)
  location: string,            // Local/Venue (max 255)
  province: string,            // Província de Angola
  image_url: string,           // URL da imagem
  video_url: string,           // URL do vídeo
  attendees_count: integer,    // Pessoas inscritas
  max_attendees: integer,      // Limite de participantes
  is_approved: boolean,        // Aprovado pelo admin?
  status: enum,                // draft | published | completed | cancelled
  created_at: timestamp,       // Data de criação
  updated_at: timestamp        // Última atualização
}
```

### Status Values

| Status | Significado |
|--------|------------|
| `draft` | Rascunho, não publicado |
| `published` | Publicado, aguarda aprovação |
| `completed` | Evento já terminou |
| `cancelled` | Cancelado pelo criador |

### Categories

- Exposição
- Competição
- Evento Educativo
- Encontro Profissional
- Show de Filhotes
- Outro

---

## 🔄 Fluxo de Estado

```
        [Draft]
           |
        Publish
           |
           v
       [Published] ← Aguardando Aprovação Admin
           |
        Approve
           |
           v
        [Published] + is_approved=true ← VISÍVEL PARA TODOS
           |
      (Tempo passa)
           |
           v
      [Completed]
```

---

## ⚠️ Mensagens de Erro

### 400 Bad Request
```json
{
  "error": "Campos obrigatórios em falta"
}
```

### 403 Forbidden
```json
{
  "error": "Sem permissão para editar este evento"
}
```

### 404 Not Found
```json
{
  "error": "Evento não encontrado"
}
```

### 500 Internal Server Error
```json
{
  "error": "Erro ao criar evento"
}
```

---

## 📈 Exemplos com cURL

### Obter eventos publicados
```bash
curl http://localhost:5000/api/events/published
```

### Criar novo evento
```bash
curl -X POST http://localhost:5000/api/events/create \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Meu Evento",
    "category": "Exposição",
    "event_date": "2026-05-20",
    "location": "Luanda"
  }'
```

### Publicar evento
```bash
curl -X PUT http://localhost:5000/api/events/UUID/publish \
  -H "Authorization: Bearer TOKEN"
```

### Aprovar evento (admin)
```bash
curl -X PUT http://localhost:5000/api/events/UUID/approve \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

---

## 🏗️ Notas de Implementação

- Tokens JWT são validados em todas as rotas autenticadas
- Apenas o criador ou admin podem editar/deletar
- Eventos em "rascunho" só são vistos pelo criador
- Eventos "publicados" precisam de aprovação admin
- Índices no BD para rápido acesso (creator_id, event_date, status)

---

**Última Atualização:** 11 de Março de 2026
