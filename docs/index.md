# todo-bmad-api Documentation Index

**Tipo:** monólito
**Linguagem principal:** TypeScript
**Arquitetura:** API backend em camadas com NestJS + Prisma
**Última atualização:** 2026-03-31

## Visão geral

`todo-bmad-api` é uma API RESTful para gerenciamento de tarefas. O repositório contém uma única aplicação backend em [`api/`](../api), construída com NestJS 11, Prisma ORM e PostgreSQL. O fluxo HTTP é organizado em controller, service, repository e mapper, com validação por Zod, documentação Swagger e contrato global de erro.

## Referência rápida

- **Stack:** Node.js, TypeScript, NestJS 11, Prisma 7, PostgreSQL, Zod, Jest, Supertest
- **Entrada principal:** `api/src/main.ts`
- **Padrão arquitetural:** modular por feature com camadas de aplicação e persistência
- **Banco de dados:** PostgreSQL via Prisma Adapter PG
- **Execução local:** `docker compose` para banco + `npm run start:dev` para API

## Documentação gerada

- [Project Overview](./project-overview.md) - Resumo executivo e classificação do projeto
- [Source Tree Analysis](./source-tree-analysis.md) - Estrutura do repositório e diretórios críticos
- [Architecture](./architecture.md) - Arquitetura técnica do backend
- [Component Inventory](./component-inventory.md) - Catálogo dos componentes principais
- [Development Guide](./development-guide.md) - Setup local, comandos e fluxo de desenvolvimento
- [API Contracts](./api-contracts.md) - Endpoints, parâmetros e comportamento observado
- [Data Models](./data-models.md) - Modelo Prisma, enums e observações de persistência

## Documentação existente no projeto

- [api/README.md](../api/README.md) - Guia manual já existente para setup, endpoints e stack
- [_bmad-output/planning-artifacts/architecture.md](../_bmad-output/planning-artifacts/architecture.md) - Artefato BMAD de arquitetura
- [_bmad-output/planning-artifacts/epics.md](../_bmad-output/planning-artifacts/epics.md) - Epics e histórias planejadas
- [_bmad-output/implementation-artifacts/sprint-status.yaml](../_bmad-output/implementation-artifacts/sprint-status.yaml) - Estado do sprint BMAD

## Começando rápido

### Pré-requisitos

- Node.js 20+
- npm
- Docker e Docker Compose para o PostgreSQL local

### Setup

```bash
cd api
npm install
cp .env.example .env
docker compose up -d
npm run prisma:generate
npm run prisma:migrate:deploy
```

### Execução local

```bash
cd api
npm run start:dev
```

### Testes

```bash
cd api
npm test
npm run test:e2e
```

## Para desenvolvimento assistido por IA

- Mudanças de domínio em tarefas: leia `architecture.md`, `api-contracts.md` e `data-models.md`
- Mudanças de bootstrap, erro global ou documentação: leia `architecture.md` e `component-inventory.md`
- Extensão de testes ou setup local: leia `development-guide.md`

---

_Documentação gerada com a skill BMAD `document-project`_
