# Exemplos de Requisições API - RCNA

## Índice
1. [Autenticação](#autenticação)
2. [Utilizadores](#utilizadores)
3. [Raças](#raças)
4. [Cães](#cães)
5. [Cruzamentos](#cruzamentos)
6. [Pedigree](#pedigree)

---

## Autenticação

### Registar Novo Utilizador
```bash
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "criador3",
    "email": "criador3@example.ao",
    "password": "senha_segura_123",
    "full_name": "Pedro Oliveira",
    "phone": "+244924444444",
    "address": "Rua da Paz, 789",
    "city": "Huambo",
    "province": "Huambo",
    "user_type": "breeder"
  }'
```

**Resposta (201)**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "username": "criador3",
  "email": "criador3@example.ao",
  "full_name": "Pedro Oliveira",
  "user_type": "breeder",
  "created_at": "2026-03-11T10:30:00Z"
}
```

### Fazer Login
```bash
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "criador1",
    "password": "sua_senha"
  }'
```

**Resposta (200)**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-uuid",
    "username": "criador1",
    "email": "criador1@example.ao",
    "full_name": "João Silva",
    "user_type": "breeder"
  }
}
```

---

## Utilizadores

### Obter Perfil (Requer Autenticação)
```bash
TOKEN="seu_token_jwt_aqui"

curl -X GET http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer $TOKEN"
```

### Atualizar Perfil
```bash
TOKEN="seu_token_jwt_aqui"

curl -X PUT http://localhost:5000/api/users/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "full_name": "João Pedro Silva",
    "phone": "+244929999999",
    "address": "Avenida Nova, 999",
    "city": "Luanda",
    "province": "Luanda"
  }'
```

### Listar Todos os Utilizadores (Admin)
```bash
TOKEN="seu_token_admin"

curl -X GET http://localhost:5000/api/users \
  -H "Authorization: Bearer $TOKEN"
```

---

## Raças

### Listar Todas as Raças
```bash
curl -X GET http://localhost:5000/api/breeds
```

**Resposta (200)**
```json
[
  {
    "id": 1,
    "name": "Pastor Alemão",
    "description": "Raça versátil, inteligente e leal",
    "origin": "Alemanha",
    "characteristics": "Grande porte, cor castanha e preta",
    "min_weight": 25,
    "max_weight": 40,
    "created_at": "2026-03-01T10:00:00Z"
  },
  {
    "id": 2,
    "name": "Labrador Retriever",
    "description": "Raça amigável e energética",
    "origin": "Canadá",
    "characteristics": "Grande porte, cores sólidas",
    "min_weight": 25,
    "max_weight": 36,
    "created_at": "2026-03-01T10:00:00Z"
  }
]
```

### Obter Detalhes de Uma Raça
```bash
curl -X GET http://localhost:5000/api/breeds/1
```

### Criar Nova Raça (Admin)
```bash
TOKEN="seu_token_admin"

curl -X POST http://localhost:5000/api/breeds \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Dogo Argentino",
    "description": "Raça grande de caça",
    "origin": "Argentina",
    "characteristics": "Branco puro, musculoso",
    "min_weight": 40,
    "max_weight": 50
  }'
```

### Atualizar Raça (Admin)
```bash
TOKEN="seu_token_admin"

curl -X PUT http://localhost:5000/api/breeds/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "description": "Raça versátil, inteligente, leal e confiável"
  }'
```

### Deletar Raça (Admin)
```bash
TOKEN="seu_token_admin"

curl -X DELETE http://localhost:5000/api/breeds/1 \
  -H "Authorization: Bearer $TOKEN"
```

---

## Cães

### Listar Cães
```bash
# Todos
curl -X GET http://localhost:5000/api/dogs

# Por raça
curl -X GET "http://localhost:5000/api/dogs?breed_id=1"

# Por criador
curl -X GET "http://localhost:5000/api/dogs?breeder_id=user-uuid"
```

**Resposta (200)**
```json
[
  {
    "id": "dog-uuid-123",
    "registration_id": "REG-260311-0001",
    "name": "Rex",
    "breed_id": 1,
    "breed_name": "Pastor Alemão",
    "birth_date": "2023-01-15",
    "gender": "M",
    "color": "Castanho e Preto",
    "microchip_id": "123456789",
    "father_id": null,
    "father_name": null,
    "mother_id": null,
    "mother_name": null,
    "breeder_id": "user-uuid-john",
    "breeder_name": "João Silva",
    "owner_id": null,
    "health_status": "Saudável",
    "certifications": "Vacina antirrábica",
    "notes": "Exemplar excelente",
    "created_at": "2026-03-11T10:30:00Z"
  }
]
```

### Obter Cão por ID
```bash
curl -X GET http://localhost:5000/api/dogs/dog-uuid-123
```

### Obter Cão por ID de Registro
```bash
curl -X GET http://localhost:5000/api/dogs/registration/REG-260311-0001
```

### Registar Novo Cão
```bash
TOKEN="seu_token_jwt"

curl -X POST http://localhost:5000/api/dogs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Luna",
    "breed_id": 1,
    "birth_date": "2023-06-20",
    "gender": "F",
    "color": "Castanho claro",
    "microchip_id": "987654321",
    "health_status": "Saudável",
    "notes": "Pedigree completo"
  }'
```

**Resposta (201)**
```json
{
  "id": "dog-uuid-456",
  "registration_id": "REG-260311-0002",
  "name": "Luna",
  "breed_id": 1,
  "birth_date": "2023-06-20",
  "gender": "F",
  "color": "Castanho claro",
  "microchip_id": "987654321",
  "breeder_id": "user-uuid",
  "created_at": "2026-03-11T10:35:00Z"
}
```

### Atualizar Cão
```bash
TOKEN="seu_token_jwt"

curl -X PUT http://localhost:5000/api/dogs/dog-uuid-456 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "health_status": "Excelente",
    "notes": "Campeão em 3 exposições"
  }'
```

### Deletar Cão
```bash
TOKEN="seu_token_jwt"

curl -X DELETE http://localhost:5000/api/dogs/dog-uuid-456 \
  -H "Authorization: Bearer $TOKEN"
```

---

## Cruzamentos

### Listar Cruzamentos
```bash
# Todos
curl -X GET http://localhost:5000/api/breedings

# Por criador
curl -X GET "http://localhost:5000/api/breedings?breeder_id=user-uuid"

# Por status
curl -X GET "http://localhost:5000/api/breedings?status=completed"
```

### Obter Detalhes de um Cruzamento
```bash
curl -X GET http://localhost:5000/api/breedings/breeding-uuid
```

### Registar Novo Cruzamento
```bash
TOKEN="seu_token_jwt"

curl -X POST http://localhost:5000/api/breedings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "father_id": "dog-uuid-123",
    "mother_id": "dog-uuid-456",
    "breeding_date": "2026-03-15",
    "expected_puppies_count": 6,
    "notes": "Cruzamento planejado de excelentes specimens"
  }'
```

**Resposta (201)**
```json
{
  "id": "breeding-uuid",
  "father_id": "dog-uuid-123",
    "father_name": "Rex",
  "father_registration_id": "REG-260311-0001",
  "mother_id": "dog-uuid-456",
  "mother_name": "Luna",
  "mother_registration_id": "REG-260311-0002",
  "breeder_id": "user-uuid",
  "breeder_name": "João Silva",
  "breeding_date": "2026-03-15",
  "expected_puppies_count": 6,
  "actual_puppies_count": null,
  "status": "planned",
  "notes": "Cruzamento planejado",
  "created_at": "2026-03-11T10:40:00Z"
}
```

### Atualizar Cruzamento
```bash
TOKEN="seu_token_jwt"

curl -X PUT http://localhost:5000/api/breedings/breeding-uuid \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "status": "completed",
    "actual_puppies_count": 5,
    "notes": "Nasceram 5 filhotes saudáveis"
  }'
```

### Deletar Cruzamento
```bash
TOKEN="seu_token_jwt"

curl -X DELETE http://localhost:5000/api/breedings/breeding-uuid \
  -H "Authorization: Bearer $TOKEN"
```

---

## Pedigree

### Obter Pedigree por ID do Cão
```bash
curl -X GET http://localhost:5000/api/pedigree/dog/dog-uuid-123
```

**Resposta (200)**
```json
{
  "id": "dog-uuid-123",
  "registration_id": "REG-260311-0001",
  "name": "Rex",
  "breed_name": "Pastor Alemão",
  "father_id": "dog-uuid-father",
  "father_name": "Thor",
  "father_registration_id": "REG-250315-0005",
  "mother_id": "dog-uuid-mother",
  "mother_name": "Luna",
  "mother_registration_id": "REG-250320-0003",
  "paternal_grandfather_name": "Max",
  "paternal_grandfather_registration_id": "REG-240410-0001",
  "paternal_grandmother_name": "Bella",
  "paternal_grandmother_registration_id": "REG-240415-0002",
  "maternal_grandfather_name": "Duke",
  "maternal_grandfather_registration_id": "REG-240510-0001",
  "maternal_grandmother_name": "Daisy",
  "maternal_grandmother_registration_id": "REG-240515-0002",
  "created_at": "2026-03-11T10:30:00Z"
}
```

### Obter Pedigree por ID de Registro
```bash
curl -X GET http://localhost:5000/api/pedigree/registration/REG-260311-0001
```

### Obter Descendentes (Filhos)
```bash
curl -X GET http://localhost:5000/api/pedigree/dog-uuid-123/offspring
```

**Resposta (200)**
```json
[
  {
    "id": "child-dog-uuid",
    "registration_id": "REG-260320-0001",
    "name": "Filhote 1",
    "breed_name": "Pastor Alemão",
    "birth_date": "2026-03-20",
    "gender": "M",
    "color": "Castanho claro",
    "breeder_name": "João Silva",
    "created_at": "2026-03-20T12:00:00Z"
  }
]
```

### Verificar Consanguinidade
```bash
curl -X POST http://localhost:5000/api/pedigree/check-consanguinity \
  -H "Content-Type: application/json" \
  -d '{
    "father_id": "dog-uuid-father",
    "mother_id": "dog-uuid-mother"
  }'
```

**Resposta (200)**
```json
{
  "has_common_ancestry": false,
  "common_ancestors_count": 0,
  "common_ancestor_ids": []
}
```

Ou se há consanguinidade:
```json
{
  "has_common_ancestry": true,
  "common_ancestors_count": 2,
  "common_ancestor_ids": [
    "grandparent-uuid-1",
    "grandparent-uuid-2"
  ]
}
```

---

## Códigos de Resposta HTTP

| Código | Significado |
|--------|------------|
| 200    | OK - Sucesso |
| 201    | Created - Criado com sucesso |
| 400    | Bad Request - Dados inválidos |
| 401    | Unauthorized - Não autenticado |
| 403    | Forbidden - Sem permissão |
| 404    | Not Found - Recurso não encontrado |
| 500    | Server Error - Erro no servidor |

---

## Usando em Postman

1. Crie uma coleção chamada "RCNA API"
2. Adicione uma variável global chamada `token`
3. Após fazer login, defina o token com o valor recebido
4. Use `{{token}}` no header `Authorization: Bearer {{token}}`

## Dicas com cURL

- Use `-v` para ver headers detalhados
- Use `-X METHOD` para especificar método (GET, POST, etc)
- Use `-H "Header: value"` para adicionar headers
- Use `-d '...'` para enviar dados JSON
- Use `@arquivo.json` para carregar dados do arquivo

Exemplo com arquivo:
```bash
curl -X POST http://localhost:5000/api/dogs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d @new_dog.json
```
