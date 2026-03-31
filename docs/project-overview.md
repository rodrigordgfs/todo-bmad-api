# todo-bmad-api - Visão Geral do Projeto

**Data:** 2026-03-31
**Tipo:** backend
**Arquitetura:** monólito NestJS com persistência Prisma/PostgreSQL

## Resumo executivo

Este projeto implementa uma API de tarefas com foco em um MVP bem delimitado. A aplicação expõe endpoints versionados para criar, listar, consultar, atualizar, alterar status e excluir tarefas, além de oferecer busca textual, filtro por status, ordenação determinística e documentação OpenAPI. A base está preparada para manutenção incremental porque as responsabilidades estão separadas em camadas simples e previsíveis.

## Classificação do projeto

- **Tipo de repositório:** monólito com uma parte principal em [`api/`](../api)
- **Tipo de projeto:** backend Node.js
- **Linguagem principal:** TypeScript
- **Padrão arquitetural:** módulos NestJS por feature, com controller, service, repository e mapper

## Resumo da stack

| Categoria | Tecnologia | Versão observada | Justificativa |
| --- | --- | --- | --- |
| Runtime | Node.js | 20+ recomendado | Documentado no README |
| Linguagem | TypeScript | 5.7.x | Dependência em `package.json` |
| Framework API | NestJS | 11.x | Pacotes `@nestjs/*` |
| ORM | Prisma | 7.6.x | `prisma` e `@prisma/client` |
| Banco | PostgreSQL | 17 no Docker local | `docker-compose.yml` |
| Validação | Zod | 4.3.x | Pipes e schemas Zod |
| Documentação API | Swagger / OpenAPI | `@nestjs/swagger` 11.2.x | Configuração em `src/config` |
| Testes | Jest + Supertest | Jest 30, Supertest 7 | Unitário e e2e |

## Funcionalidades principais

- CRUD de tarefas
- Alteração explícita de status entre `OPEN` e `COMPLETED`
- Filtro por status na listagem
- Busca textual case-insensitive em título, descrição e tags
- Ordenação por prioridade, prazo, criação e id
- Validação de entrada com Zod
- Respostas de erro padronizadas
- Swagger UI e JSON OpenAPI

## Destaques de arquitetura

- O bootstrap está em [`api/src/main.ts`](../api/src/main.ts) e centraliza a configuração da aplicação em [`api/src/config/app.config.ts`](../api/src/config/app.config.ts).
- A feature de tarefas está isolada em [`api/src/modules/tasks`](../api/src/modules/tasks), com DTOs, schemas, contratos, enums, mapper e repository próprios.
- A persistência fica atrás de [`api/src/infra/database/prisma/prisma.service.ts`](../api/src/infra/database/prisma/prisma.service.ts), que injeta um `PrismaClient` configurado com `@prisma/adapter-pg`.
- O modelo de domínio é pequeno e direto: uma entidade `Task` com enums de `status` e `priority`.

## Visão de desenvolvimento

### Pré-requisitos

- Node.js 20+
- npm
- Docker e Docker Compose

### Começando

No diretório [`api/`](../api), instale dependências, configure o `.env`, suba o PostgreSQL local e aplique as migrations Prisma. Depois, execute a API em modo watch.

### Comandos principais

- **Instalar:** `cd api && npm install`
- **Desenvolvimento:** `cd api && npm run start:dev`
- **Build:** `cd api && npm run build`
- **Testes:** `cd api && npm test`

## Estrutura do repositório

O repositório mistura a aplicação executável em [`api/`](../api) com artefatos de processo BMAD em [`_bmad-output/`](../_bmad-output). A área realmente entregue em produção fica no backend NestJS; os diretórios BMAD funcionam como rastreabilidade de arquitetura, histórias e sprint.

## Mapa da documentação

- [index.md](./index.md) - Ponto de entrada da documentação
- [architecture.md](./architecture.md) - Arquitetura técnica detalhada
- [source-tree-analysis.md](./source-tree-analysis.md) - Estrutura de pastas
- [development-guide.md](./development-guide.md) - Setup e fluxo local

---

_Gerado com a skill BMAD `document-project`_
