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
│   ├── eslint.config.mjs
│   ├── nest-cli.json
│   ├── package.json
│   ├── prisma/
│   │   ├── migrations/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── app.module.ts
│   │   ├── main.ts
│   │   ├── common/
│   │   │   ├── filters/
│   │   │   └── pipes/
│   │   ├── config/
│   │   ├── infra/
│   │   │   └── database/prisma/
│   │   ├── modules/
│   │   │   ├── foundation/
│   │   │   └── tasks/
│   │   └── shared/
│   │       └── contracts/
│   ├── test/
│   ├── tsconfig.build.json
│   └── tsconfig.json
└── docs/
```

## Diretórios críticos

### `api/src/modules/tasks`

Núcleo funcional da API.

**Propósito:** concentrar a feature principal de tarefas.
**Contém:** controller, service, repository, DTOs, schemas Zod, enums, mapper e contratos.
**Entry points:** `tasks.module.ts`, `tasks.controller.ts`

### `api/src/infra/database/prisma`

Camada de infraestrutura de banco.

**Propósito:** encapsular a criação e o ciclo de vida do `PrismaClient`.
**Contém:** `prisma.module.ts` e `prisma.service.ts`

### `api/prisma`

Camada de schema e migrations.

**Propósito:** definir o modelo relacional da aplicação e registrar evolução do banco.
**Contém:** `schema.prisma` e migrations SQL versionadas

### `api/src/common`

Infraestrutura transversal.

**Propósito:** reunir comportamentos compartilhados da borda HTTP.
**Contém:** filtro global de exceção e pipe de validação Zod

### `api/test`

Testes de integração e2e.

**Propósito:** validar comportamento HTTP fim a fim com configuração separada de ambiente.
**Contém:** suíte `app.e2e-spec.ts`, `jest-e2e.json` e bootstrap de ambiente

## Pontos de entrada

- **Entrada principal:** `api/src/main.ts`
- **Bootstrap da aplicação:** `api/src/config/app.config.ts`
- **Módulo raiz:** `api/src/app.module.ts`
- **Schema de persistência:** `api/prisma/schema.prisma`

## Padrões de organização

- O projeto usa módulos NestJS para organizar capacidades.
- A feature principal segue fluxo `controller -> service -> repository -> Prisma`.
- Contratos Swagger e contratos de resposta vivem próximos do domínio correspondente.
- Testes unitários ficam próximos do código e testes e2e ficam em [`api/test/`](../api/test).

## Tipos de arquivo importantes

### Arquivos de módulo e bootstrap

- **Padrão:** `*.module.ts`, `main.ts`, `app.config.ts`
- **Propósito:** registrar providers, controllers e configuração global
- **Exemplos:** `api/src/app.module.ts`, `api/src/modules/tasks/tasks.module.ts`

### Arquivos de contrato e DTO

- **Padrão:** `*.contract.ts`, `*.dto.ts`, `*.swagger.ts`
- **Propósito:** definir formato de entrada, saída e documentação OpenAPI
- **Exemplos:** `api/src/modules/tasks/contracts/task.contract.ts`, `api/src/modules/tasks/dto/tasks.swagger.ts`

### Arquivos de validação

- **Padrão:** `*.schema.ts`, `*.pipe.ts`
- **Propósito:** validar entrada HTTP com Zod
- **Exemplos:** `api/src/modules/tasks/schemas/create-task.schema.ts`, `api/src/common/pipes/zod-validation.pipe.ts`

### Arquivos de teste

- **Padrão:** `*.spec.ts`, `*-spec.ts`
- **Propósito:** cobrir unidade, integração de serviço e e2e
- **Exemplos:** `api/src/modules/tasks/tasks.service.spec.ts`, `api/test/app.e2e-spec.ts`

## Arquivos de configuração

- `api/package.json`: dependências, scripts e configuração Jest
- `api/tsconfig.json`: opções TypeScript estritas
- `api/docker-compose.yml`: PostgreSQL local
- `api/.env.example`: variáveis mínimas de ambiente
- `api/prisma.config.ts`: configuração auxiliar do Prisma

## Notas para desenvolvimento

- O repositório não é monorepo de aplicações; o diretório `api/` é a parte operacional principal.
- O prefixo HTTP global é `/api` e a versão padrão é `/v1`.
- Não há frontend nesta base; `FRONTEND_ORIGIN` existe apenas para CORS.

---

_Gerado com a skill BMAD `document-project`_
