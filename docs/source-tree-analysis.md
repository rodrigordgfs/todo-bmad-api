# todo-bmad-api - Análise da Árvore de Fontes

**Data:** 2026-03-31

## Visão geral

O repositório é pequeno e fácil de navegar. A aplicação executável está concentrada em [`api/`](../api), enquanto `_bmad/` e `_bmad-output/` guardam configuração e artefatos do método BMAD. A árvore de código produtivo relevante fica em `api/src`, com separação entre configuração, infraestrutura, módulos de domínio, contratos compartilhados e testes.

## Estrutura principal

```text
.
├── _bmad/
├── _bmad-output/
├── api/
│   ├── .env
│   ├── .env.example
│   ├── .env.test
│   ├── README.md
│   ├── docker-compose.yml
│   ├── prisma/
│   │   ├── migrations/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── app.module.ts
│   │   ├── main.ts
│   │   ├── common/
│   │   ├── config/
│   │   ├── infra/database/prisma/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── tasks/
│   │   │   └── users/
│   │   └── shared/
│   └── test/
└── docs/
```

## Diretórios críticos

### `api/src/modules/auth`

**Propósito:** autenticação e sessão  
**Contém:** controller, service, guard JWT, DTOs, schemas e repository de sessão

### `api/src/modules/users`

**Propósito:** identidade e credenciais seguras  
**Contém:** service, repository, tipos e `PasswordHashService`

### `api/src/modules/tasks`

**Propósito:** domínio de tarefas autenticadas  
**Contém:** controller, service, repository, DTOs, schemas, contracts, mapper, enums e tipos

### `api/src/infra/database/prisma`

**Propósito:** encapsular o `PrismaClient` e o ciclo de vida da conexão

### `api/test`

**Propósito:** testes e2e de runtime, Swagger, auth e ownership

## Pontos de entrada

- **entrada principal:** `api/src/main.ts`
- **bootstrap da aplicação:** `api/src/config/app.config.ts`
- **módulo raiz:** `api/src/app.module.ts`
- **schema de persistência:** `api/prisma/schema.prisma`

## Padrões de organização

- módulos NestJS por feature
- fluxo dominante `controller -> service -> repository -> Prisma`
- contratos Swagger e DTOs próximos das features
- validação por Zod
- testes unitários próximos ao código e e2e em `api/test`

## Arquivos de configuração importantes

- `api/package.json`
- `api/docker-compose.yml`
- `api/.env.example`
- `api/prisma/schema.prisma`
- `api/src/config/app.config.ts`
- `api/src/config/swagger.config.ts`
