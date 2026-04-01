# todo-bmad-api - Guia de Desenvolvimento

**Data:** 2026-03-31

## Pré-requisitos

- Node.js 20+
- npm
- Docker e Docker Compose
- PostgreSQL local, se você não usar o container incluído

## Setup local

### 1. Instalação

```bash
cd api
npm install
```

### 2. Ambiente

```bash
cd api
cp .env.example .env
```

Variáveis importantes:

- `PORT`
- `DATABASE_URL`
- `FRONTEND_ORIGIN`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `JWT_ACCESS_EXPIRES_IN`
- `JWT_REFRESH_EXPIRES_IN`

Também existe [`api/.env.test`](../api/.env.test) para a suíte de testes.

### 3. Banco de dados

```bash
cd api
docker compose up -d
npm run prisma:generate
npm run prisma:migrate:deploy
```

O Compose local sobe um PostgreSQL 17 com banco `todo_bmad_api`.

## Execução

### Desenvolvimento

```bash
cd api
npm run start:dev
```

### Build e produção local

```bash
cd api
npm run build
npm run start:prod
```

### Porta ocupada

Se aparecer `EADDRINUSE` na `3000`, rode com outra porta:

```bash
cd api
PORT=3001 npm run start:dev
```

## Testes e validação

### Testes

```bash
cd api
npm test
npm run test:e2e
npm run test:cov
```

### Qualidade

```bash
cd api
npm run lint
npm run build
npm run prisma:validate
npm run prisma:generate
```

## Fluxo de trabalho sugerido

1. suba o PostgreSQL local
2. aplique ou gere migrations Prisma
3. rode a API em watch
4. execute unitários ao mexer em regra interna
5. execute e2e ao mexer em contrato HTTP, auth, ownership ou Swagger

## Convenções observadas

- versionamento de API por URI em `/api/v1`
- validação de entrada com Zod
- autenticação por bearer token JWT
- refresh token persistido apenas como hash
- ownership de tarefa por `userId`
- contratos Swagger mantidos próximos da feature
- regras de domínio centralizadas no service
- persistência isolada no repository

## Pontos de atenção

- a suíte e2e depende de banco real configurado em `.env.test`
- `DATABASE_URL`, `JWT_ACCESS_SECRET` e `JWT_REFRESH_SECRET` são obrigatórios no boot
- mudanças no schema exigem migrations e novo `prisma generate`
- Swagger e filtros de erro já têm cobertura e devem evoluir junto com o runtime
