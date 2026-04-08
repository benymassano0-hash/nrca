DB_USER=José João Massano
DB_PASSWORD=MODELO,2007# Guia de Uso Rápido - RCNA

## 1. Primeiro Acesso

### a) Registar uma Conta
1. Vá para http://localhost:3000
2. Clique em "Registar"
3. Preencha os dados:
   - **Utilizador**: Nome de utilizador único
   - **Email**: Email válido
   - **Palavra-passe**: Senha segura
   - **Nome Completo**: Seu nome
   - **Tipo**: Selecione "Criador" ou "Consultor"
4. Clique em "Registar"

### b) Fazer Login
1. Clique em "Login"
2. Digite seu utilizador e senha
3. Clique em "Login"

## 2. Registar uma Raça (Admin apenas)

**Selecionar Raças** → **Adicionar Raça**

Preencha:
- **Nome**: Ex. "Pastor Alemão"
- **Descrição**: Características gerais
- **Origem**: País de origem
- **Características**: Traços distintivos
- **Peso Mínimo/Máximo**: Em kg

## 3. Registar um Cão

**Menu** → **Cães** → **Adicionar Cão**

Preencha:
- **Nome**: Nome do cão
- **Raça**: Selecione uma raça
- **Data de Nascimento**: Data do nascimento
- **Sexo**: Macho (M) ou Fêmea (F)
- **Cor**: Cor da pelagem
- **Microchip**: ID do microchip (opcional)

**Resultado**: O sistema gera automaticamente um ID de registro no formato `REG-YYMMDD-XXXX`

### Exemplo de ID gerado
```
REG-260311-0001  (11 de março de 2026, primeiro cão do dia)
REG-260311-0002  (11 de março de 2026, segundo cão do dia)
```

## 4. Registar um Cruzamento

**Menu** → **Cruzamentos** → **Novo Cruzamento**

Selecione:
- **Pai (Macho)**: Cão macho para reprodução
- **Mãe (Fêmea)**: Cão fêmea para reprodução
- **Data do Cruzamento**: Data do acasalamento
- **Número Esperado de Filhotes**: (opcional)

O status inicial é **"planned"** (planejado)

## 5. Consultar Pedigree

### Por ID de Registro
1. Na página de Cães, encontre o cão desejado
2. Clique em "Pedigree"
3. Veja a genealogia até 3 gerações (avós, pais, ele próprio)

### Por Busca Direta
```
http://localhost:3000/pedigree/REG-260311-0001
```

## 6. Atualizar Status de um Cruzamento

**Menu** → **Cruzamentos**

Clique no cruzamento e atualize:
- **Status**: planned, in_progress, completed, cancelled
- **Filhotes Reais**: Número efetivo de filhotes nascidos
- **Notas**: Anotações adicionais

## 7. Buscar Informações usando a API

### Via Postman ou cURL

#### Login
```bash
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"username":"criador1","password":"sua_senha"}'
```

Resposta inclui um **token JWT**.

#### Buscar cão por ID de Registro
```bash
curl http://localhost:5000/api/dogs/registration/REG-260311-0001 \
  -H "Authorization: Bearer <seu_token>"
```

#### Obter pedigree completo
```bash
curl http://localhost:5000/api/pedigree/registration/REG-260311-0001 \
  -H "Authorization: Bearer <seu_token>"
```

#### Verificar consanguinidade
```bash
curl -X POST http://localhost:5000/api/pedigree/check-consanguinity \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <seu_token>" \
  -d '{"father_id":"uuid-do-pai","mother_id":"uuid-da-mae"}'
```

## 8. Dados de Teste

### Contas padrão (se usar seed_data.sql)
```
Admin:
  - Utilizador: admin
  - Senha: password

Criador 1:
  - Utilizador: criador1
  - Senha: password

Criador 2:
  - Utilizador: criador2
  - Senha: password
```

Para usar dados de teste:
```bash
cd backend
psql -U postgres -d rcna -f ../database/seed_data.sql
cd ..
```

## 9. Estrutura de um Cão (Resposta da API)

```json
{
  "id": "uuid-do-cao",
  "registration_id": "REG-260311-0001",
  "name": "Rex",
  "breed_id": 1,
  "breed_name": "Pastor Alemão",
  "birth_date": "2023-01-15",
  "gender": "M",
  "color": "Castanho e Preto",
  "microchip_id": "123456789",
  "father_id": "uuid-do-pai",
  "father_name": "Thor",
  "mother_id": "uuid-da-mae",
  "mother_name": "Luna",
  "breeder_id": "uuid-do-criador",
  "breeder_name": "João Silva",
  "owner_id": null,
  "health_status": "Saudável",
  "certifications": "Vacina antirrábica",
  "notes": "Exemplar excelente",
  "created_at": "2026-03-11T10:30:00Z",
  "updated_at": "2026-03-11T10:30:00Z"
}
```

## 10. Estrutura de um Pedigree (Resposta da API)

```json
{
  "id": "uuid-do-cao",
  "registration_id": "REG-260311-0001",
  "name": "Rex",
  "breed_name": "Pastor Alemão",
  "father_name": "Thor",
  "father_registration_id": "REG-250315-0005",
  "mother_name": "Luna",
  "mother_registration_id": "REG-250320-0003",
  "paternal_grandfather_name": "Max",
  "paternal_grandmother_name": "Bella",
  "maternal_grandfather_name": "Duke",
  "maternal_grandmother_name": "Daisy",
  "...": "outros campos"
}
```

## 11. Dicas e Boas Práticas

✅ **Recomendado**
- Use nomes descritivos para cães
- Registre dados de nascimento corretos
- Mantenha informações de microchip atualizadas
- Documente características físicas
- Use a verificação de consanguinidade antes de cruzamentos

❌ **Evite**
- Não registre informações falsas
- Não compartilhe senhas
- Não desvincule cães de criadores sem razão
- Não ignore avisos de consanguinidade

## 12. Suporte

Para problemas:
1. Verifique o console do navegador (F12)
2. Verifique os logs do backend
3. Confirm as credenciais do banco de dados
4. Reinicie o servidor
