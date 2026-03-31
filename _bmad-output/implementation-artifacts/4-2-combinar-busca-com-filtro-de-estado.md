# Story 4.2: Combinar busca com filtro de estado

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a usuario do app,
I want buscar dentro do conjunto filtrado,
so that o frontend suporte o fluxo de “buscar em abertas” sem comportamento ambiguo.

## Acceptance Criteria

1. `GET /api/v1/tasks` aceita `status` e `search` na mesma requisição.
2. A API aplica a busca sobre o conjunto já filtrado por estado.
3. O comportamento permanece previsível e não exige heurística oculta no frontend.

## Tasks / Subtasks

- [x] Expor composição de busca com filtro na listagem da feature `tasks` (AC: 1, 2, 3)
  - [x] Evoluir `GET /api/v1/tasks` para suportar `status` e `search` simultaneamente
  - [x] Manter o endpoint de listagem o mesmo, sem rota paralela
  - [x] Preservar resposta de sucesso como array direto de `TaskContract`
- [x] Formalizar a semântica da composição de query params (AC: 2, 3)
  - [x] Deixar explícito na implementação que o filtro de `status` delimita primeiro o subconjunto
  - [x] Aplicar `search` sobre o subconjunto resultante, e não sobre a lista inteira
  - [x] Preservar a ordenação determinística da `3.3` no resultado final
  - [x] Garantir que ausência de um dos parâmetros mantenha o comportamento já consolidado nas stories anteriores
- [x] Preservar contrato HTTP estrito e boundary atual da feature (AC: 1, 3)
  - [x] Manter `ListTasksQueryDto` e schema `zod` coerentes com os únicos query params suportados neste ponto: `status` e `search`
  - [x] Continuar rejeitando `sortBy`, `sortOrder` e outros parâmetros fora do escopo
  - [x] Não alterar contratos de create, update, delete ou status
  - [x] Manter `TaskMapper` como única serialização de saída
- [x] Centralizar comportamento de composição na camada correta (AC: 2, 3)
  - [x] Evoluir `TasksService` para que filtro, busca e ordenação sigam uma sequência única e previsível
  - [x] Evoluir `TasksRepository` apenas se isso realmente simplificar ou tornar a composição mais coerente
  - [x] Evitar espalhar regra de composição no controller ou em múltiplos pontos da feature
- [x] Cobrir a regra combinada com testes unitários e e2e (AC: 1, 2, 3)
  - [x] Criar testes unitários para a combinação quando houver lógica relevante
  - [x] Ampliar e2e para provar pelo menos:
    - `status=open&search=...` buscando só entre abertas
    - `status=completed&search=...` buscando só entre concluídas
    - combinação sem resultados retornando array vazio
    - comportamento isolado de `status` e `search` permanecendo compatível com `3.2` e `4.1`
    - parâmetros fora do escopo continuando inválidos
  - [x] Garantir isolamento do banco entre testes
- [x] Validar a story antes de concluir (AC: 1, 2, 3)
  - [x] Executar `npm run prisma:validate`
  - [x] Executar `npm run prisma:generate`
  - [x] Executar `npm run build`
  - [x] Executar `npm test -- --runInBand`
  - [x] Executar `npm run test:e2e -- --runInBand`

## Dev Notes

- Esta story não cria novos query params; ela consolida a composição dos dois que já existem: `status` e `search`.
- O risco principal aqui é deixar a composição implícita e acabar com comportamento “parece funcionar, mas ninguém sabe em que ordem foi aplicado”.
- A regra correta para esta story é:
  - primeiro delimitar por `status`
  - depois aplicar `search`
  - por fim manter a ordenação determinística já existente

### Project Structure Notes

- A feature continua em `api/src/modules/tasks/`.
- Reaproveitar e evoluir:
  - `tasks.controller.ts`
  - `tasks.service.ts`
  - `repositories/tasks.repository.ts`
  - `dto/list-tasks-query.dto.ts`
  - `schemas/list-tasks-query.schema.ts`
  - `mappers/task.mapper.ts`
- Nao criar rota de busca/filtro dedicada nem contratos paralelos de resposta.

### Technical Requirements

- Endpoint alvo: `GET /api/v1/tasks`
- Query params suportados nesta story:
  - `status`
  - `search`
- Semântica esperada:
  - `status` continua aceitando `all`, `open` e `completed`
  - `search` continua case-insensitive em `title`, `description` e `tags`
  - quando ambos vierem, a busca acontece sobre o subconjunto filtrado por `status`
- A resposta continua sendo array direto de `TaskContract`.
- A ordenação da `3.3` continua valendo no resultado final.
- `sortBy` e `sortOrder` continuam fora do contrato HTTP.

### Architecture Compliance

- Controller limita-se a HTTP e query params.
- Validação de query continua na borda com `zod`.
- Service centraliza o comportamento determinístico da listagem composta.
- Repository encapsula acesso a dados e pode ser evoluído apenas se a composição exigir.
- Nada de Prisma direto no controller.
- Query behavior precisa continuar centralizado e previsível.

### File Structure Requirements

- Arquivos provavelmente tocados nesta story:
  - `api/src/modules/tasks/tasks.controller.ts`
  - `api/src/modules/tasks/tasks.service.ts`
  - `api/src/modules/tasks/repositories/tasks.repository.ts`
  - `api/src/modules/tasks/dto/list-tasks-query.dto.ts`
  - `api/src/modules/tasks/schemas/list-tasks-query.schema.ts`
  - `api/test/app.e2e-spec.ts`
- Arquivos prováveis adicionais:
  - `api/src/modules/tasks/*.spec.ts`
- Evitar nesta story:
  - expor `sortBy`
  - expor `sortOrder`
  - mudar shape de resposta
  - mexer em contratos de mutação

### Testing Requirements

- Validar obrigatoriamente:
  - `npm run prisma:validate`
  - `npm run prisma:generate`
  - `npm run build`
  - `npm test -- --runInBand`
  - `npm run test:e2e -- --runInBand`
- O e2e deve provar pelo menos:
  - `status=open&search=...`
  - `status=completed&search=...`
  - combinação sem resultados retornando `[]`
  - compatibilidade com comportamento isolado de `status`
  - compatibilidade com comportamento isolado de `search`
- Como os testes usam banco real, manter limpeza/isolamento entre casos.

### Previous Story Learnings

- A `3.2` consolidou filtro por estado com contrato HTTP estrito; a `4.2` não deve enfraquecer essa fronteira.
- A `3.3` consolidou ordenação determinística; a combinação de filtros não deve quebrar essa previsibilidade.
- A `4.1` consolidou `search` case-insensitive e o tratamento de busca em branco como ausência de busca.
- A retro do Epic 3 deixou explícito que parâmetros aceitos silenciosamente e composição ambígua viram dívida rápido; esta story existe justamente para formalizar essa composição.

### Git Intelligence

- A feature `tasks` já suporta `status` e `search` isoladamente no mesmo endpoint de listagem.
- O próximo passo natural é deixar a composição desses parâmetros explícita, previsível e coberta por testes.
- O desenho atual da feature permite fazer isso sem mexer em contratos de mutação nem abrir query params novos.

### References

- Story source e acceptance criteria: [Source: _bmad-output/planning-artifacts/epics.md#Story-42-Combinar-busca-com-filtro-de-estado]
- Objetivo do Epic 4: [Source: _bmad-output/planning-artifacts/epics.md#Epic-4-Descoberta-e-Consistencia-de-Estado]
- Regras de query params e naming: [Source: _bmad-output/planning-artifacts/architecture.md#Code-Naming-Conventions]
- Regras de comportamento determinístico de query: [Source: _bmad-output/planning-artifacts/architecture.md#Error-Handling-Patterns]
- Learnings do Epic 3: [Source: _bmad-output/implementation-artifacts/epic-3-retro-2026-03-31.md]
- Learnings de busca textual: [Source: _bmad-output/implementation-artifacts/4-1-busca-textual-case-insensitive-em-campos-relevantes.md]

## Dev Agent Record

### Agent Model Used

Codex (GPT-5 family)

### Debug Log References

- A composição já existia implicitamente, porque o repository recebia `status` antes de o service aplicar `search`; nesta story isso foi tornado explícito no fluxo do `TasksService`.
- A sequência formalizada ficou: filtro por `status`, depois busca textual, depois ordenação determinística.
- A implementação preservou o contrato HTTP estrito e não reabriu `sortBy` ou `sortOrder`.
- Os testes agora travam a composição combinada, além de manter compatibilidade com os comportamentos isolados das stories `3.2` e `4.1`.

### Completion Notes List

- Implementada e formalizada a composição entre `status` e `search` em `GET /api/v1/tasks`.
- A busca agora acontece explicitamente sobre o subconjunto já filtrado por estado.
- A ordenação determinística da `3.3` continua sendo aplicada ao resultado final.
- O contrato HTTP segue estrito e continua rejeitando parâmetros fora do escopo.
- Validacoes concluidas com sucesso: `npm run prisma:validate`, `npm run prisma:generate`, `npm run lint`, `npm run build`, `npm test -- --runInBand` e `npm run test:e2e -- --runInBand`.

### File List

- _bmad-output/implementation-artifacts/4-2-combinar-busca-com-filtro-de-estado.md
- _bmad-output/implementation-artifacts/sprint-status.yaml
- api/src/modules/tasks/tasks.service.ts
- api/src/modules/tasks/tasks.service.read.spec.ts
- api/test/app.e2e-spec.ts

### Change Log

- 2026-03-31: formalizada a composição entre filtro por estado e busca textual na listagem de tarefas, preservando ordenação determinística e contrato HTTP estrito; story promovida para `review`.
