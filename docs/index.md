# Directory Index

Este diretório concentra a documentação técnica de referência do estado final da API autenticada. Ele complementa o [README da aplicação](../api/README.md) com visão arquitetural, contratos públicos, modelos de dados, setup de desenvolvimento e navegação do código.

## Files

- **[api-contracts.md](./api-contracts.md)** - Endpoints, payloads e erros públicos
- **[architecture.md](./architecture.md)** - Visão arquitetural da API autenticada
- **[component-inventory.md](./component-inventory.md)** - Catálogo dos componentes principais
- **[data-models.md](./data-models.md)** - Schema Prisma e persistência atual
- **[development-guide.md](./development-guide.md)** - Setup local, comandos e fluxo
- **[project-overview.md](./project-overview.md)** - Resumo executivo e contexto técnico
- **[source-tree-analysis.md](./source-tree-analysis.md)** - Mapa da árvore de fontes

## Related Artifacts

- **[../api/README.md](../api/README.md)** - Guia principal de uso da API
- **[../_bmad-output/planning-artifacts/prd.md](../_bmad-output/planning-artifacts/prd.md)** - Requisitos de produto consolidados
- **[../_bmad-output/planning-artifacts/architecture.md](../_bmad-output/planning-artifacts/architecture.md)** - Arquitetura BMAD da solução
- **[../_bmad-output/planning-artifacts/epics.md](../_bmad-output/planning-artifacts/epics.md)** - Epics e stories planejadas
- **[../_bmad-output/implementation-artifacts/sprint-status.yaml](../_bmad-output/implementation-artifacts/sprint-status.yaml)** - Estado final do sprint

## Quick Start

```bash
cd api
npm install
cp .env.example .env
docker compose up -d
npm run prisma:generate
npm run prisma:migrate:deploy
npm run start:dev
```

## Suggested Reading Paths

- Auth e sessão: `architecture.md` -> `api-contracts.md` -> `data-models.md`
- Ownership de tarefas: `api-contracts.md` -> `component-inventory.md` -> `source-tree-analysis.md`
- Setup e troubleshooting local: `development-guide.md` -> `../api/README.md`
