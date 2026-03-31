# todo-bmad-api - Guia de Desenvolvimento

**Data:** 2026-03-31

## Pré-requisitos

- Node.js 20 ou superior
- npm
- Docker e Docker Compose
- PostgreSQL local, caso você não use o container incluído

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

Variáveis observadas:

- `PORT`
- `DATABASE_URL`
- `FRONTEND_ORIGIN`

Também existe [`api/.env.test`](../api/.env.test) para a suíte de testes.

### 3. Banco de dados

```bash
cd api
docker compose up -d
npm run prisma:generate
npm run prisma:migrate:deploy
```

O Compose local sobe um PostgreSQL 17-alpine com banco `todo_bmad_api`.

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

1. Suba o PostgreSQL local.
2. Aplique ou gere migrations Prisma.
3. Rode a API em watch.
4. Execute testes unitários antes de mexer em contratos.
5. Rode e2e quando alterar comportamento HTTP ou integração com banco.

## Convenções observadas

- Versionamento de API por URI em `/api/v1`
- Validação de entrada com Zod em vez de class-validator
- Contratos Swagger mantidos próximos da feature
- Regras de domínio centralizadas no service
- Persistência isolada no repository

## Pontos de atenção

- A suíte e2e depende de banco real configurado em `.env.test`.
- `DATABASE_URL` é obrigatória no boot; sem ela o `PrismaService` lança erro.
- Mudanças no schema exigem atualização do client Prisma e migrations.

---

_Gerado com a skill BMAD `document-project`_
