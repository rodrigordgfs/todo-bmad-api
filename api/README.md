# todo-bmad-api

API REST em NestJS para gerenciamento de tarefas com autenticacao JWT, refresh token persistido e isolamento de dados por usuario.

## O que a API entrega

- cadastro com email e senha
- login com `accessToken` e `refreshToken`
- refresh de sessao com rotacao de token
- logout com revogacao de sessao
- CRUD de tarefas autenticado
- ownership por usuario em leitura e escrita
- busca textual, filtro por status e ordenacao deterministica
- Swagger/OpenAPI e contrato global de erro consistente

## Stack

- Node.js
- TypeScript
- NestJS 11
- Prisma ORM
- PostgreSQL
- Zod
- JWT
- Argon2
- Jest
- Supertest
- Swagger / OpenAPI

## Requisitos

- Node.js 20+
- npm
- Docker e Docker Compose para banco local
- PostgreSQL, se preferir rodar sem Docker

## Setup rapido

### 1. Instale dependencias

```bash
npm install
```

### 2. Crie o arquivo de ambiente

```bash
cp .env.example .env
```

### 3. Suba o PostgreSQL local

```bash
docker compose up -d
```

### 4. Gere o client Prisma

```bash
npm run prisma:generate
```

### 5. Aplique as migrations

```bash
npm run prisma:migrate:deploy
```

### 6. Rode a API

```bash
npm run start:dev
```

## Variaveis de ambiente

Exemplo em [`.env.example`](/home/rodrigordgfs/www/poc/todo-bmad-api/api/.env.example):

```env
PORT=3000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/todo_bmad_api?schema=public"
FRONTEND_ORIGIN="http://localhost:5173"
JWT_ACCESS_SECRET="change-me-access-secret"
JWT_REFRESH_SECRET="change-me-refresh-secret"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
```

### Principais variaveis

- `PORT`: porta HTTP da API
- `DATABASE_URL`: conexao PostgreSQL usada pelo Prisma
- `FRONTEND_ORIGIN`: origem permitida no CORS
- `JWT_ACCESS_SECRET`: segredo de assinatura do access token
- `JWT_REFRESH_SECRET`: segredo de assinatura do refresh token
- `JWT_ACCESS_EXPIRES_IN`: expiracao do access token
- `JWT_REFRESH_EXPIRES_IN`: expiracao do refresh token

Os testes usam [`api/.env.test`](/home/rodrigordgfs/www/poc/todo-bmad-api/api/.env.test) via [`test/setup-env.ts`](/home/rodrigordgfs/www/poc/todo-bmad-api/api/test/setup-env.ts).

## Executando a API

### Desenvolvimento

```bash
npm run start:dev
```

### Produção local

```bash
npm run build
npm run start:prod
```

Se a porta `3000` estiver ocupada, rode com outra porta:

```bash
PORT=3001 npm run start:dev
```

## Documentacao da API

Com a API rodando na porta configurada em `PORT`:

- Swagger UI: `http://localhost:<PORT>/api/docs`
- OpenAPI JSON: `http://localhost:<PORT>/api/docs-json`

Configuracao principal em:

- [`src/config/swagger.config.ts`](/home/rodrigordgfs/www/poc/todo-bmad-api/api/src/config/swagger.config.ts)
- [`src/config/app.config.ts`](/home/rodrigordgfs/www/poc/todo-bmad-api/api/src/config/app.config.ts)

## Contrato global de erro

O filtro global fica em [`http-exception.filter.ts`](/home/rodrigordgfs/www/poc/todo-bmad-api/api/src/common/filters/http-exception.filter.ts).

Shape publico:

```json
{
  "statusCode": 401,
  "code": "INVALID_ACCESS_TOKEN",
  "message": "Invalid access token",
  "details": []
}
```

Codigos comuns observados:

- `VALIDATION_ERROR`
- `EMAIL_ALREADY_EXISTS`
- `INVALID_CREDENTIALS`
- `INVALID_REFRESH_TOKEN`
- `INVALID_ACCESS_TOKEN`
- `NOT_FOUND`
- `UNAUTHORIZED`
- `CONFLICT`
- `INTERNAL_SERVER_ERROR`

## Endpoints principais

Base URL local:

```text
http://localhost:<PORT>/api/v1
```

Se `PORT` não for definida, o bootstrap usa `3000` por padrão.

### Auth

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`

### Tasks

Todos exigem bearer token:

- `GET /api/v1/tasks`
- `GET /api/v1/tasks/:id`
- `POST /api/v1/tasks`
- `PATCH /api/v1/tasks/:id`
- `PATCH /api/v1/tasks/:id/status`
- `DELETE /api/v1/tasks/:id`

## Modelo de dados

O schema Prisma atual contem:

- `User`
- `Task`
- `RefreshToken`

Pontos importantes:

- `Task.userId` e obrigatorio
- `User.email` e unico
- refresh token e persistido apenas como hash
- ownership de tarefa e enforceado por `userId`

Fonte de verdade: [`prisma/schema.prisma`](/home/rodrigordgfs/www/poc/todo-bmad-api/api/prisma/schema.prisma)

## Testes e validacao

### Testes

```bash
npm test
npm run test:e2e
npm run test:cov
```

### Qualidade

```bash
npm run lint
npm run build
npm run prisma:validate
npm run prisma:generate
```

Observacao: os testes e2e usam banco real.

## Arquitetura resumida

- `AuthModule`: cadastro, login, refresh, logout e regras de sessao
- `UsersModule`: identidade e credenciais seguras
- `TasksModule`: CRUD autenticado, ownership, busca, filtro e ordenacao
- `PrismaModule`: acesso ao banco

Fluxo principal:

```text
HTTP -> Guard/Pipes -> Controller -> Service -> Repository/Prisma -> PostgreSQL
```

## Estrutura de pastas

```text
api/
├── prisma/
├── src/
│   ├── common/
│   ├── config/
│   ├── infra/database/prisma/
│   ├── modules/
│   │   ├── auth/
│   │   ├── tasks/
│   │   └── users/
│   └── shared/
└── test/
```

## Documentacao adicional

- [docs/index.md](/home/rodrigordgfs/www/poc/todo-bmad-api/docs/index.md)
- [docs/architecture.md](/home/rodrigordgfs/www/poc/todo-bmad-api/docs/architecture.md)
- [docs/api-contracts.md](/home/rodrigordgfs/www/poc/todo-bmad-api/docs/api-contracts.md)
- [docs/data-models.md](/home/rodrigordgfs/www/poc/todo-bmad-api/docs/data-models.md)
