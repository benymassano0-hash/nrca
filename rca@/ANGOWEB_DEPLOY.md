# 🚀 Guia de Deploy no Angoweb

## O que é criado numa única app Node.js
O backend serve tanto a API (`/api/*`) como o frontend (ficheiros estáticos React).  
Só precisas de **um** processo Node.js no servidor — sem separações.

---

## PASSO 1 – Preparar o pacote no teu PC Windows

1. Abre a pasta `RCNA` no Explorador de Ficheiros.
2. Faz duplo clique em **`preparar-angoweb.bat`**.
3. Quando pedir o domínio, escreve o domínio dado pelo Angoweb, por exemplo:
   ```
   rcna.angoweb.ao
   ```
4. Espera que termine. Será criada a pasta **`pacote-angoweb/`**.
5. **Antes de carregar**, abre `pacote-angoweb/.env.production` e muda:
   ```
   JWT_SECRET=escreve_aqui_uma_frase_longa_e_secreta_qualquer
   ```

---

## PASSO 2 – Carregar para o Angoweb

### Opção A – cPanel da Angoweb (mais comum)

1. Entra no cPanel do Angoweb.
2. Vai a **File Manager** → pasta `public_html` (ou a pasta do teu domínio).
3. Carrega o conteúdo da pasta `pacote-angoweb/` para lá.
4. **Renomeia** `.env.production` para `.env`.

### Opção B – FTP (FileZilla, etc.)

1. Liga-te ao FTP do Angoweb com as credenciais deles.
2. Copia o conteúdo de `pacote-angoweb/` para a raiz do domínio.
3. Renomeia `.env.production` para `.env`.

---

## PASSO 3 – Instalar dependências no servidor

Abre o terminal SSH do cPanel (ou usa o terminal SSH do Angoweb):

```bash
cd public_html/backend
npm install --omit=dev
```

---

## PASSO 4 – Inicializar a base de dados

```bash
cd public_html/backend
node database/setup.js
node database/seed.js
```

---

## PASSO 5 – Iniciar a aplicação

### Opção rápida (recomendada) - 1 comando

Se o pacote inclui `deploy-angoweb.sh`, corre apenas:

```bash
cd ~/public_html
bash deploy-angoweb.sh
```

Este script faz automaticamente: instalação do backend, setup da base de dados e arranque com PM2.

### Com cPanel "Setup Node.js App"

1. No cPanel vai a **Setup Node.js App**.
2. Cria uma nova aplicação:
   - **Node.js version**: 18 (ou a mais recente disponível)
   - **Application mode**: Production
   - **Application root**: `public_html/backend`
   - **Application URL**: o teu domínio
   - **Application startup file**: `server.js`
3. Clica em **Create** e depois **Run NPM Install**.
4. Clica em **Start App**.

### Com PM2 (VPS / SSH)

```bash
cd ~/public_html
npm install -g pm2
cp .env.production backend/.env
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup   # segue as instruções que aparecem no ecrã
```

---

## PASSO 6 – Verificar se funciona

Abre no navegador:
```
https://SEU_DOMINIO/health
```
Deve responder: `{"status":"ok","message":"RCNA Backend is running"}`

Página principal:
```
https://SEU_DOMINIO
```

---

## Variáveis importantes do `.env`

| Variável | Valor de exemplo | Significado |
|---|---|---|
| `JWT_SECRET` | `frase-muito-secreta-2026` | Chave de segurança dos tokens |
| `FRONTEND_ORIGINS` | `https://rcna.angoweb.ao` | Domínio permitido no CORS |
| `PORT` | `5000` | Porta do servidor (cPanel pode mudar) |
| `NODE_ENV` | `production` | Modo produção |
| `DB_CLIENT` | `sqlite` | Base de dados local (sem instalar PostgreSQL) |

---

## Resolução de problemas

| Problema | Solução |
|---|---|
| Página em branco | Verifica se o frontend/build está dentro do caminho correto em relação ao backend/server.js |
| Erro CORS | Confirma que `FRONTEND_ORIGINS` tem o teu domínio exacto com `https://` |
| API não responde | Verifica se o processo Node.js está a correr e a porta está correcta |
| Erro 500 no login | O `JWT_SECRET` no `.env` do servidor pode estar em falta |

---

## Estrutura final no servidor

```
public_html/
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── .env              ← variáveis de produção
│   ├── src/
│   ├── database/
│   └── uploads/
├── frontend/
│   └── build/            ← ficheiros React compilados
└── ecosystem.config.js
```
