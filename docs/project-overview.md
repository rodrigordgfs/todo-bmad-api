# todo-bmad-api - Visão Geral do Projeto

**Data:** 2026-03-31  
**Tipo:** backend  
**Arquitetura:** monólito NestJS com Prisma/PostgreSQL

## Resumo executivo

Este projeto implementa uma API de tarefas autenticada. A aplicação hoje entrega cadastro, login, refresh, logout, isolamento de tarefas por usuário, busca, filtro por status, ordenação determinística, documentação OpenAPI e contrato global de erro consistente.

## Classificação do projeto

- **Tipo de repositório:** aplicação backend única em [`api/`](../api)
- **Tipo de projeto:** API REST
- **Linguagem principal:** TypeScript
- **Padrão arquitetural:** módulos NestJS por feature, com controller, service, repository e contratos próximos ao domínio

## Resumo da stack

| Categoria | Tecnologia | Versão observada |
| --- | --- | --- |
| Runtime | Node.js | 20+ recomendado |
| Linguagem | TypeScript | 5.7.x |
| Framework | NestJS | 11.x |
| ORM | Prisma | 7.6.x |
| Banco | PostgreSQL | 17 no Docker local |
| Validação | Zod | 4.3.x |
| Auth | JWT + Argon2 | atual |
| Documentação | Swagger / OpenAPI | `@nestjs/swagger` 11.2.x |
| Testes | Jest + Supertest | Jest 30, Supertest 7 |

## Funcionalidades principais

- cadastro de conta com email e senha
- login com emissão de `accessToken` e `refreshToken`
- refresh de sessão com persistência e rotação de refresh token
- logout com revogação da sessão
- CRUD autenticado de tarefas
- ownership por `userId` em leitura e escrita
- busca textual case-insensitive em título, descrição e tags
- filtro por status
- ordenação por prioridade, prazo, criação e id
- Swagger UI e OpenAPI JSON
- respostas de erro padronizadas

## Destaques de arquitetura

- O bootstrap fica em [`api/src/main.ts`](../api/src/main.ts) e delega configuração global para [`api/src/config/app.config.ts`](../api/src/config/app.config.ts).
- [`api/src/app.module.ts`](../api/src/app.module.ts) compõe `PrismaModule`, `UsersModule`, `AuthModule` e `TasksModule`.
- A autenticação está concentrada em [`api/src/modules/auth`](../api/src/modules/auth).
- O domínio de identidade fica em [`api/src/modules/users`](../api/src/modules/users).
- O domínio de tarefas autenticadas fica em [`api/src/modules/tasks`](../api/src/modules/tasks).
- A persistência usa Prisma em [`api/src/infra/database/prisma/prisma.service.ts`](../api/src/infra/database/prisma/prisma.service.ts).

## Visão de desenvolvimento

### Pré-requisitos

- Node.js 20+
- npm
- Docker e Docker Compose

### Começando

No diretório [`api/`](../api):

1. instale dependências
2. copie `.env.example` para `.env`
3. suba o PostgreSQL local
4. gere o client Prisma
5. aplique as migrations
6. rode a API

## Estrutura do repositório

O repositório mistura a aplicação executável em [`api/`](../api) com artefatos BMAD em [`_bmad-output/`](../_bmad-output). A parte entregue em runtime está no backend NestJS; os artefatos BMAD servem como rastreabilidade de planejamento, arquitetura, sprint e retrospectivas.

## Mapa da documentação

- [index.md](./index.md)
- [architecture.md](./architecture.md)
- [api-contracts.md](./api-contracts.md)
- [data-models.md](./data-models.md)
- [development-guide.md](./development-guide.md)
