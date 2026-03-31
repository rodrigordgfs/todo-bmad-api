# Story 3.2: Filtrar tarefas por estado

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a usuario do app,
I want listar tarefas filtradas por estado,
so that eu possa focar em abertas, concluidas ou em todas.

## Acceptance Criteria

1. `GET /api/v1/tasks` aceita query param de estado compativel com o contrato do frontend.
2. Quando o filtro e aplicado, apenas o subconjunto correto e retornado.
3. A resposta permanece consistente e direta, independentemente do filtro usado.

## Tasks / Subtasks

- [x] Expor filtro de estado na listagem da feature `tasks` (AC: 1, 2, 3)
  - [x] Evoluir `GET /api/v1/tasks` para aceitar query param `status`
  - [x] Manter a rota de listagem no mesmo endpoint, sem criar rota paralela
  - [x] Preservar resposta de sucesso como array direto de `TaskContract`
- [x] Implementar validacao de query na borda HTTP (AC: 1, 3)
  - [x] Reaproveitar `ListTasksQueryDto` como contrato de entrada da listagem
  - [x] Criar schema `zod` especifico para query params da listagem
  - [x] Aceitar apenas `all`, `open` e `completed` para `status`
  - [x] Tratar ausencia de `status` como comportamento equivalente a `all`
  - [x] Rejeitar valor invalido com `VALIDATION_ERROR` padronizado
- [x] Implementar traducao de filtro do contrato HTTP para o dominio/persistencia (AC: 1, 2, 3)
  - [x] Evoluir `TasksService` para centralizar o comportamento da listagem com filtro
  - [x] Evoluir `TasksRepository` para filtrar por `TaskStatus` quando necessario
  - [x] Mapear `open` para `TaskStatus.OPEN`
  - [x] Mapear `completed` para `TaskStatus.COMPLETED`
  - [x] Tratar `all` ou ausencia como listagem sem restricao por status
- [x] Preservar semantica da feature e evitar sobreposicao de escopo (AC: 2, 3)
  - [x] Manter `TaskMapper` como unica serializacao de saida
  - [x] Preservar a ordenacao atual da listagem enquanto a `3.3` nao for implementada
  - [x] Nao introduzir ainda busca textual; isso pertence ao Epic 4
  - [x] Nao introduzir ainda `sortBy` ou `sortOrder`; isso pertence a `3.3`
- [x] Cobrir o comportamento com testes unitarios e e2e (AC: 1, 2, 3)
  - [x] Criar testes unitarios para service/repository quando houver logica de mapeamento relevante
  - [x] Ampliar e2e para provar:
    - listagem sem query retornando todas as tarefas
    - `status=all` retornando o mesmo conjunto da ausencia de filtro
    - `status=open` retornando apenas tarefas abertas
    - `status=completed` retornando apenas tarefas concluidas
    - query invalida com `VALIDATION_ERROR`
  - [x] Garantir isolamento do banco entre testes
- [x] Validar a story antes de concluir (AC: 1, 2, 3)
  - [x] Executar `npm run prisma:validate`
  - [x] Executar `npm run prisma:generate`
  - [x] Executar `npm run build`
  - [x] Executar `npm test -- --runInBand`
  - [x] Executar `npm run test:e2e -- --runInBand`

## Dev Notes

- Esta story evolui a listagem da `2.3` com o primeiro filtro funcional de `tasks`, sem ainda entrar em busca textual ou ordenacao configuravel.
- O contrato do frontend para filtro de estado e em lowercase: `all`, `open`, `completed`, mesmo que o dominio e o banco usem `TaskStatus` com valores `OPEN` e `COMPLETED`.
- O principal cuidado aqui e nao misturar escopo:
  - `3.2` trata apenas filtro por estado
  - `3.3` trata ordenacao
  - Epic 4 trata busca textual e combinacoes de query

### Project Structure Notes

- A feature continua em `api/src/modules/tasks/`.
- Reaproveitar e evoluir:
  - `tasks.controller.ts`
  - `tasks.service.ts`
  - `repositories/tasks.repository.ts`
  - `dto/list-tasks-query.dto.ts`
  - `mappers/task.mapper.ts`
- Criar schema `zod` proprio para query de listagem em `schemas/`.
- Nao criar uma nova rota para filtro e nao duplicar contratos de saida.

### Technical Requirements

- Endpoint alvo: `GET /api/v1/tasks`
- Query param suportado nesta story:
  - `status`
- Valores validos de `status`:
  - `all`
  - `open`
  - `completed`
- Semantica esperada:
  - ausencia de `status` equivale a `all`
  - `status=all` retorna todas as tarefas
  - `status=open` retorna apenas tarefas com `TaskStatus.OPEN`
  - `status=completed` retorna apenas tarefas com `TaskStatus.COMPLETED`
- A resposta continua sendo array direto de `TaskContract`.
- A serializacao da resposta continua passando por `TaskMapper`.
- A ordenacao da lista nao deve ser redefinida nesta story; manter o comportamento atual ate a `3.3`.
- Query invalida deve falhar na borda HTTP com erro padronizado.

### Architecture Compliance

- Controller limita-se a HTTP e query params.
- Validacao de query acontece na borda com `zod`.
- Service centraliza comportamento deterministico de filtro.
- Repository encapsula a query Prisma com ou sem restricao de `status`.
- Nada de Prisma direto no controller.
- Respostas de sucesso continuam diretas, sem wrapper.
- Erros continuam seguindo o filtro global.

### File Structure Requirements

- Arquivos provavelmente tocados nesta story:
  - `api/src/modules/tasks/tasks.controller.ts`
  - `api/src/modules/tasks/tasks.service.ts`
  - `api/src/modules/tasks/repositories/tasks.repository.ts`
  - `api/src/modules/tasks/dto/list-tasks-query.dto.ts`
  - `api/test/app.e2e-spec.ts`
- Arquivos provaveis adicionais:
  - `api/src/modules/tasks/schemas/list-tasks-query.schema.ts`
  - `api/src/modules/tasks/*.spec.ts`
- Evitar nesta story:
  - busca textual
  - `sortBy`
  - `sortOrder`
  - paginacao
  - qualquer mudanca no endpoint `PATCH /api/v1/tasks/:id/status`

### Testing Requirements

- Validar obrigatoriamente:
  - `npm run prisma:validate`
  - `npm run prisma:generate`
  - `npm run build`
  - `npm test -- --runInBand`
  - `npm run test:e2e -- --runInBand`
- O e2e deve provar pelo menos:
  - listagem sem filtro
  - listagem com `status=all`
  - listagem com `status=open`
  - listagem com `status=completed`
  - erro padronizado para query invalida
- Como os testes usam banco real, manter limpeza/isolamento entre casos.

### Previous Story Learnings

- A `2.3` consolidou `GET /api/v1/tasks` com resposta direta e `TaskMapper`; a `3.2` deve evoluir essa mesma rota, sem criar variao paralela.
- A `2.3` e a `2.4` consolidaram validacao de UUID e `NOT_FOUND`; esta story nao deve mexer nesses contratos.
- A `3.1` consolidou `TaskStatus` e a semantica de estado no dominio; a `3.2` deve apenas traduzir o filtro HTTP lowercase para esses mesmos valores internos.
- O projeto ja possui `ListTasksQueryDto`; vale reaproveitar esse contrato em vez de inventar outro shape para query params.

### Git Intelligence

- A feature `tasks` ja possui CRUD base estavel e o endpoint `PATCH /tasks/:id/status` implementado.
- A listagem atual ja funciona e deve ser preservada como base, adicionando apenas a capacidade de filtrar.
- O `TaskMapper` segue como unica saida serializada da feature e deve continuar assim para evitar divergencia entre create, read e filtro.

### References

- Story source e acceptance criteria: [Source: _bmad-output/planning-artifacts/epics.md#Story-32-Filtrar-tarefas-por-estado]
- Objetivo do Epic 3: [Source: _bmad-output/planning-artifacts/epics.md#Epic-3-Progresso-e-Organizacao-do-Trabalho]
- Regras de query params e naming: [Source: _bmad-output/planning-artifacts/architecture.md#Code-Naming-Conventions]
- Regras de comportamento deterministico em query: [Source: _bmad-output/planning-artifacts/architecture.md#Error-Handling-Patterns]
- Regras de fronteira de camadas: [Source: _bmad-output/planning-artifacts/architecture.md#Architectural-Boundaries]
- Learnings de listagem base: [Source: _bmad-output/implementation-artifacts/2-3-listar-e-consultar-tarefas-por-id.md]
- Learnings de update/delete: [Source: _bmad-output/implementation-artifacts/2-4-editar-e-excluir-tarefas-com-seguranca-de-dominio.md]
- Learnings de mudanca de estado: [Source: _bmad-output/implementation-artifacts/3-1-concluir-e-reabrir-tarefas-por-endpoint-explicito-de-estado.md]

## Dev Agent Record

### Agent Model Used

Codex (GPT-5 family)

### Debug Log References

- A listagem ja existia desde a `2.3`, entao a implementacao focou em evoluir o mesmo endpoint em vez de abrir rota paralela.
- O `ListTasksQueryDto` foi ajustado para refletir o contrato HTTP lowercase do frontend, enquanto o service passou a traduzir esse filtro para `TaskStatus` interno.
- A validacao de query ficou concentrada em schema `zod` proprio, mantendo erro padronizado na borda HTTP.
- A ordenacao atual do repository foi preservada para nao antecipar o escopo da `3.3`.

### Completion Notes List

- Implementado filtro por estado em `GET /api/v1/tasks` com suporte a `status=all`, `status=open` e `status=completed`.
- `TasksService` agora centraliza a traducao do filtro HTTP para `TaskStatus` do dominio.
- `TasksRepository` agora filtra opcionalmente por `status` mantendo a ordenacao atual da listagem.
- Os testes cobrem ausencia de filtro, `status=all`, `status=open`, `status=completed` e query invalida.
- Validacoes concluidas com sucesso: `npm run prisma:validate`, `npm run prisma:generate`, `npm run lint`, `npm run build`, `npm test -- --runInBand` e `npm run test:e2e -- --runInBand`.

### File List

- _bmad-output/implementation-artifacts/3-2-filtrar-tarefas-por-estado.md
- _bmad-output/implementation-artifacts/sprint-status.yaml
- api/src/modules/tasks/dto/list-tasks-query.dto.ts
- api/src/modules/tasks/repositories/tasks.repository.ts
- api/src/modules/tasks/schemas/list-tasks-query.schema.ts
- api/src/modules/tasks/tasks.controller.ts
- api/src/modules/tasks/tasks.service.read.spec.ts
- api/src/modules/tasks/tasks.service.ts
- api/test/app.e2e-spec.ts

### Change Log

- 2026-03-31: implementado filtro de tarefas por estado em `GET /api/v1/tasks`, com validacao de query, traducao para `TaskStatus`, cobertura automatizada e story promovida para `review`.
