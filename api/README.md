# todo-bmad-api

API RESTful em NestJS para gerenciamento de tarefas do MVP `todo-bmad-api`.

O projeto foi evoluído em fluxo BMAD e hoje entrega:

- CRUD completo de tarefas
- transição explícita de estado (`OPEN` e `COMPLETED`)
- filtro por status
- busca textual case-insensitive
- ordenação determinística por prioridade e prazo
- contrato global de erro
- documentação Swagger/OpenAPI

## Sumário

- [Visão Geral](#visão-geral)
- [Stack](#stack)
- [Requisitos](#requisitos)
- [Setup Rápido](#setup-rápido)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Banco de Dados e Prisma](#banco-de-dados-e-prisma)
- [Executando a API](#executando-a-api)
- [Testes e Validação](#testes-e-validação)
- [Documentação da API](#documentação-da-api)
- [Contrato de Erro](#contrato-de-erro)
- [Endpoints](#endpoints)
- [Modelo de Dados](#modelo-de-dados)
- [Arquitetura](#arquitetura)
- [Estrutura de Pastas](#estrutura-de-pastas)
- [Fluxo de Desenvolvimento](#fluxo-de-desenvolvimento)

## Visão Geral

Esta API expõe uma feature principal de `tasks`, com responsabilidade clara entre camadas:

- `controller`: borda HTTP e documentação Swagger
- `service`: regras de domínio e composição de comportamento
- `repository`: persistência com Prisma
- `mapper`: transformação única de persistência para contrato de saída

Além disso, a aplicação já nasce com:

- prefixo global `api`
- versionamento por URI em `v1`
- CORS configurável por ambiente
- Swagger em rota pública de documentação
- filtro global para respostas de erro consistentes
- validação com `zod`

## Stack

- Node.js
- TypeScript
- NestJS 11
- Prisma ORM
- PostgreSQL
- Zod
- Jest
- Supertest
- Swagger / OpenAPI

## Requisitos

- Node.js 20+ recomendado
- npm
- Docker e Docker Compose para banco local
- PostgreSQL, se preferir rodar sem Docker

## Setup Rápido

### 1. Instale as dependências

```bash
npm install
```

### 2. Suba o PostgreSQL local

```bash
docker compose -f docker-compose.yml up -d
```

### 3. Crie o arquivo de ambiente

```bash
cp .env.example .env
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

## Variáveis de Ambiente

Exemplo em [`.env.example`](/home/rodrigordgfs/www/poc/todo-bmad-api/api/.env.example):

```env
PORT=3000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/todo_bmad_api?schema=public"
FRONTEND_ORIGIN="http://localhost:5173"
```

### Variáveis

- `PORT`: porta HTTP da API
- `DATABASE_URL`: string de conexão PostgreSQL usada pelo Prisma
- `FRONTEND_ORIGIN`: origem permitida no CORS

### Ambiente de teste

Os testes carregam [`.env.test`](/home/rodrigordgfs/www/poc/todo-bmad-api/api/.env.test) automaticamente via [`test/setup-env.ts`](/home/rodrigordgfs/www/poc/todo-bmad-api/api/test/setup-env.ts).

## Banco de Dados e Prisma

### Docker Compose local

O ambiente local de banco está definido em [`docker-compose.yml`](/home/rodrigordgfs/www/poc/todo-bmad-api/api/docker-compose.yml) e sobe um PostgreSQL 17 com:

- banco: `todo_bmad_api`
- usuário: `postgres`
- senha: `postgres`
- porta: `5432`

### Comandos Prisma

```bash
npm run prisma:validate
npm run prisma:generate
npm run prisma:migrate:dev
npm run prisma:migrate:deploy
npm run prisma:migrate:status
```

### Migrations versionadas

As migrations ficam em [`prisma/migrations`](/home/rodrigordgfs/www/poc/todo-bmad-api/api/prisma/migrations).

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

### Bootstrap atual

A aplicação sobe com:

- prefixo global: `/api`
- versão padrão: `/v1`
- Swagger UI: `/api/docs`
- Swagger JSON: `/api/docs-json`

## Testes e Validação

### Testes

```bash
# unitários
npm test

# e2e
npm run test:e2e

# cobertura
npm run test:cov
```

### Qualidade

```bash
npm run lint
npm run build
npm run prisma:validate
npm run prisma:generate
```

### Observação importante

Os testes e2e usam banco real. Para a suíte passar, o PostgreSQL configurado em `.env.test` precisa estar disponível.

## Documentação da API

Com a API rodando:

- Swagger UI: `http://localhost:3000/api/docs`
- OpenAPI JSON: `http://localhost:3000/api/docs-json`

A configuração base do Swagger está em:

- [`src/config/swagger.config.ts`](/home/rodrigordgfs/www/poc/todo-bmad-api/api/src/config/swagger.config.ts)
- [`src/config/app.config.ts`](/home/rodrigordgfs/www/poc/todo-bmad-api/api/src/config/app.config.ts)

## Contrato de Erro

A API usa um filtro global para padronizar respostas de erro em [`http-exception.filter.ts`](/home/rodrigordgfs/www/poc/todo-bmad-api/api/src/common/filters/http-exception.filter.ts).

Shape esperado:

```json
{
  "code": "VALIDATION_ERROR",
  "message": "Validation failed",
  "details": [
    {
      "field": "title",
      "message": "Title is required",
      "code": "too_small"
    }
  ]
}
```

Campos:

- `code`: identificador estável do erro
- `message`: mensagem principal
- `details`: lista opcional de detalhes estruturados

## Endpoints

Base URL local:

```text
http://localhost:3000/api/v1
```

### Health / bootstrap mínimo

- `GET /`
- `GET /api/v1`

### Tasks

- `GET /api/v1/tasks`
- `GET /api/v1/tasks/:id`
- `POST /api/v1/tasks`
- `PATCH /api/v1/tasks/:id`
- `PATCH /api/v1/tasks/:id/status`
- `DELETE /api/v1/tasks/:id`

### Query params suportados em listagem

`GET /api/v1/tasks`

- `status=all|open|completed`
- `search=<texto>`

Regras:

- ausência de `status` equivale a `all`
- `search` é case-insensitive
- `search` em branco é tratado como ausência de busca
- parâmetros fora do contrato são rejeitados

### Regras de ordenação da listagem

A lista é ordenada de forma determinística:

1. prioridade: `HIGH`, depois `MEDIUM`, depois `LOW`
2. `dueDate` mais próximo primeiro dentro da mesma prioridade
3. tarefas sem `dueDate` vêm depois das que têm prazo na mesma prioridade
4. desempate final por `createdAt` e `id`

## Modelo de Dados

Schema Prisma atual em [`schema.prisma`](/home/rodrigordgfs/www/poc/todo-bmad-api/api/prisma/schema.prisma):

### Enum `TaskStatus`

- `OPEN`
- `COMPLETED`

### Enum `TaskPriority`

- `LOW`
- `MEDIUM`
- `HIGH`

### Entidade `Task`

- `id`: UUID
- `title`: obrigatório
- `description`: opcional
- `dueDate`: opcional
- `priority`: default `MEDIUM`
- `tags`: array com default `[]`
- `status`: default `OPEN`
- `createdAt`
- `updatedAt`

## Arquitetura

### Convenções principais

- controller não conhece Prisma
- repository não define semântica HTTP
- mapper centraliza o shape de saída
- validação de entrada usa `zod`
- erros HTTP usam contrato global
- mudança de estado é endpoint explícito, separado do `PATCH` genérico

### Fluxo simplificado

```text
HTTP Request
  -> Controller
  -> ZodValidationPipe / ParseUUIDPipe
  -> Service
  -> Repository
  -> Prisma
  -> Mapper
  -> HTTP Response
```

## Estrutura de Pastas

```text
api/
  prisma/
    migrations/
    schema.prisma
  src/
    common/
      filters/
      pipes/
    config/
    infra/
      database/
        prisma/
    modules/
      foundation/
      tasks/
        contracts/
        dto/
        enums/
        mappers/
        repositories/
        schemas/
        types/
    shared/
      contracts/
    app.module.ts
    main.ts
  test/
    app.e2e-spec.ts
    jest-e2e.json
    setup-env.ts
```

## Fluxo de Desenvolvimento

### Sequência recomendada ao alterar a API

1. atualizar schema, contratos ou validação
2. ajustar service e repository
3. revisar Swagger quando houver mudança pública
4. rodar validações locais

### Checklist prático

```bash
npm run prisma:validate
npm run prisma:generate
npm run lint
npm run build
npm test -- --runInBand
npm run test:e2e -- --runInBand
```

### Observações do projeto

- o projeto usa PostgreSQL real nos testes e2e
- a lógica de listagem está hoje centralizada no service
- se entrarem paginação ou volumes maiores, parte dessa lógica pode migrar para a persistência

## Referências internas

- bootstrap da aplicação: [`src/main.ts`](/home/rodrigordgfs/www/poc/todo-bmad-api/api/src/main.ts)
- configuração global: [`src/config/app.config.ts`](/home/rodrigordgfs/www/poc/todo-bmad-api/api/src/config/app.config.ts)
- módulo principal: [`src/app.module.ts`](/home/rodrigordgfs/www/poc/todo-bmad-api/api/src/app.module.ts)
- controller de tarefas: [`src/modules/tasks/tasks.controller.ts`](/home/rodrigordgfs/www/poc/todo-bmad-api/api/src/modules/tasks/tasks.controller.ts)
- service de tarefas: [`src/modules/tasks/tasks.service.ts`](/home/rodrigordgfs/www/poc/todo-bmad-api/api/src/modules/tasks/tasks.service.ts)
- repository de tarefas: [`src/modules/tasks/repositories/tasks.repository.ts`](/home/rodrigordgfs/www/poc/todo-bmad-api/api/src/modules/tasks/repositories/tasks.repository.ts)
- contratos Swagger: [`src/modules/tasks/dto/tasks.swagger.ts`](/home/rodrigordgfs/www/poc/todo-bmad-api/api/src/modules/tasks/dto/tasks.swagger.ts)

## Estado Atual

No fechamento do sprint atual, o MVP da API está concluído no fluxo BMAD, com todos os epics e retrospectivas marcados como finalizados.
