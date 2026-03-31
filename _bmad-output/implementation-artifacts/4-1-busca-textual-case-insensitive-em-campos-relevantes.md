# Story 4.1: Busca textual case-insensitive em campos relevantes

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a usuario do app,
I want buscar tarefas por texto em campos relevantes,
so that eu encontre rapidamente o item certo mesmo com listas maiores.

## Acceptance Criteria

1. `GET /api/v1/tasks` aceita termo de busca textual no contrato HTTP da listagem.
2. A busca e aplicada de forma case-insensitive sobre `title`, `description` e `tags`.
3. A resposta retorna apenas tarefas correspondentes em formato consistente.

## Tasks / Subtasks

- [x] Expor busca textual na listagem da feature `tasks` (AC: 1, 2, 3)
  - [x] Evoluir `GET /api/v1/tasks` para aceitar query param `search`
  - [x] Manter o endpoint de listagem o mesmo, sem criar rota paralela
  - [x] Preservar resposta de sucesso como array direto de `TaskContract`
- [x] Implementar validacao de query sem relaxar o contrato atual (AC: 1, 3)
  - [x] Evoluir `ListTasksQueryDto` para suportar `search`
  - [x] Evoluir o schema `zod` da listagem para aceitar `search` sem voltar a aceitar `sortBy` ou `sortOrder`
  - [x] Manter validacao estrita contra query params fora do escopo
  - [x] Definir comportamento para busca vazia ou somente espacos
  - [x] Rejeitar input invalido com `VALIDATION_ERROR` padronizado quando aplicável
- [x] Implementar busca textual case-insensitive nos campos relevantes (AC: 2, 3)
  - [x] Evoluir `TasksService` para centralizar o comportamento de busca da listagem
  - [x] Evoluir `TasksRepository` para aplicar busca em `title`, `description` e `tags`
  - [x] Garantir matching case-insensitive
  - [x] Garantir que ausência de `description` ou `tags` não quebre a busca
  - [x] Preservar a ordenação determinística da `3.3` sobre o subconjunto retornado
- [x] Preservar boundary com stories passadas e futuras (AC: 1, 2, 3)
  - [x] Manter compatibilidade com `status` da `3.2`, mesmo sem ainda combinar explicitamente busca + filtro como foco principal da `4.2`
  - [x] Não reabrir `sortBy` ou `sortOrder`
  - [x] Não alterar contratos de create, update, delete ou status
  - [x] Manter `TaskMapper` como única serialização de saída
- [x] Cobrir o comportamento com testes unitários e e2e (AC: 1, 2, 3)
  - [x] Criar testes unitários para service/repository quando houver lógica relevante de busca
  - [x] Ampliar e2e para provar pelo menos:
    - busca em `title`
    - busca em `description`
    - busca em `tags`
    - matching case-insensitive
    - termo sem correspondência retornando array vazio
    - query param fora do escopo continuando inválido
  - [x] Garantir isolamento do banco entre testes
- [x] Validar a story antes de concluir (AC: 1, 2, 3)
  - [x] Executar `npm run prisma:validate`
  - [x] Executar `npm run prisma:generate`
  - [x] Executar `npm run build`
  - [x] Executar `npm test -- --runInBand`
  - [x] Executar `npm run test:e2e -- --runInBand`

## Dev Notes

- Esta story inaugura o Epic 4 adicionando descoberta textual sem desmontar a disciplina de contrato que foi consolidada no Epic 3.
- O principal cuidado aqui e aceitar `search` como novo query param legítimo, sem voltar a aceitar silenciosamente parâmetros ainda fora do escopo.
- A listagem já possui:
  - filtro de `status`
  - ordenação determinística
  - validação estrita de query params
- A `4.1` precisa evoluir isso com segurança, não reinventar a listagem.
- Nesta implementação, `search` vazio ou composto apenas por espaços é tratado como ausência de busca, preservando a listagem normal.

### Project Structure Notes

- A feature continua em `api/src/modules/tasks/`.
- Reaproveitar e evoluir:
  - `tasks.controller.ts`
  - `tasks.service.ts`
  - `repositories/tasks.repository.ts`
  - `dto/list-tasks-query.dto.ts`
  - `schemas/list-tasks-query.schema.ts`
  - `mappers/task.mapper.ts`
- Nao criar nova rota de busca nem contratos alternativos de saida.

### Technical Requirements

- Endpoint alvo: `GET /api/v1/tasks`
- Novo query param suportado nesta story:
  - `search`
- A busca deve ser:
  - textual
  - case-insensitive
  - aplicada em `title`, `description` e `tags`
- A resposta continua sendo array direto de `TaskContract`.
- A ordenação padrão da `3.3` deve continuar valendo para os resultados retornados.
- `status` continua fazendo parte do contrato da listagem, mas a composição formal entre busca e filtro será aprofundada na `4.2`.
- `sortBy` e `sortOrder` continuam fora do contrato HTTP.

### Architecture Compliance

- Controller limita-se a HTTP e query params.
- Validação de query acontece na borda com `zod`.
- Service centraliza comportamento determinístico da listagem.
- Repository encapsula a query Prisma para busca textual.
- Nada de Prisma direto no controller.
- Query behavior precisa continuar centralizado e previsível.
- Respostas de sucesso continuam diretas, sem wrapper.

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
  - reabrir contratos de mutação
  - mudar paginação/shape de resposta

### Testing Requirements

- Validar obrigatoriamente:
  - `npm run prisma:validate`
  - `npm run prisma:generate`
  - `npm run build`
  - `npm test -- --runInBand`
  - `npm run test:e2e -- --runInBand`
- O e2e deve provar pelo menos:
  - busca em `title`
  - busca em `description`
  - busca em `tags`
  - case-insensitive
  - ausência de resultados retornando `[]`
  - contrato estrito ainda rejeitando query params fora do escopo
- Como os testes usam banco real, manter limpeza/isolamento entre casos.

### Previous Story Learnings

- A `3.1` consolidou transição explícita de estado e não deve ser impactada por busca textual.
- A `3.2` consolidou contrato estrito de query params; a `4.1` deve adicionar `search` sem relaxar essa disciplina.
- A `3.3` consolidou ordenação determinística; a busca deve respeitar essa mesma ordem no subconjunto retornado.
- A retro do Epic 3 deixou claro que query params aceitos silenciosamente viram dívida de produto rapidamente; esta story deve evitar isso desde o começo.

### Git Intelligence

- A feature `tasks` já possui backbone maduro para listagem: filtro por estado, ordenação determinística e `TaskMapper` único.
- O próximo passo natural é ampliar o discovery da lista com busca textual sem fragmentar o contrato HTTP.
- A busca provavelmente vai pressionar mais a camada de persistência do que as stories do Epic 3, então vale manter atenção ao boundary service/repository.

### References

- Story source e acceptance criteria: [Source: _bmad-output/planning-artifacts/epics.md#Story-41-Busca-textual-case-insensitive-em-campos-relevantes]
- Objetivo do Epic 4: [Source: _bmad-output/planning-artifacts/epics.md#Epic-4-Descoberta-e-Consistencia-de-Estado]
- Regras de query params e naming: [Source: _bmad-output/planning-artifacts/architecture.md#Code-Naming-Conventions]
- Regras de comportamento determinístico de query: [Source: _bmad-output/planning-artifacts/architecture.md#Error-Handling-Patterns]
- Learnings do Epic 3: [Source: _bmad-output/implementation-artifacts/epic-3-retro-2026-03-31.md]
- Learnings de filtro por estado: [Source: _bmad-output/implementation-artifacts/3-2-filtrar-tarefas-por-estado.md]
- Learnings de ordenação: [Source: _bmad-output/implementation-artifacts/3-3-ordenar-tarefas-por-prioridade-e-prazo-com-regra-deterministica.md]

## Dev Agent Record

### Agent Model Used

Codex (GPT-5 family)

### Debug Log References

- A busca textual foi implementada no `TasksService` para manter matching case-insensitive também em `tags`, evitando complexidade prematura na camada Prisma.
- O contrato estrito de query params foi preservado: `search` passou a ser aceito, mas `sortBy` e `sortOrder` continuam inválidos.
- A decisão de tratar `search` vazio ou só com espaços como ausência de busca foi materializada no schema e travada em testes.
- A ordenação determinística da `3.3` foi preservada sobre o subconjunto filtrado pela busca.

### Completion Notes List

- Implementado `search` em `GET /api/v1/tasks` com matching case-insensitive em `title`, `description` e `tags`.
- A listagem continua suportando `status` e mantém a ordenação determinística já existente.
- `search` vazio ou composto só por espaços agora equivale a ausência de busca.
- O contrato HTTP segue estrito e continua rejeitando parâmetros fora do escopo, como `sortBy`.
- Validacoes concluidas com sucesso: `npm run prisma:validate`, `npm run prisma:generate`, `npm run lint`, `npm run build`, `npm test -- --runInBand` e `npm run test:e2e -- --runInBand`.

### File List

- _bmad-output/implementation-artifacts/4-1-busca-textual-case-insensitive-em-campos-relevantes.md
- _bmad-output/implementation-artifacts/sprint-status.yaml
- api/src/modules/tasks/dto/list-tasks-query.dto.ts
- api/src/modules/tasks/schemas/list-tasks-query.schema.ts
- api/src/modules/tasks/tasks.service.ts
- api/src/modules/tasks/tasks.service.read.spec.ts
- api/test/app.e2e-spec.ts

### Change Log

- 2026-03-31: implementada busca textual case-insensitive em `GET /api/v1/tasks`, preservando contrato estrito de query params, ordenação determinística e cobertura automatizada; story promovida para `review`.
