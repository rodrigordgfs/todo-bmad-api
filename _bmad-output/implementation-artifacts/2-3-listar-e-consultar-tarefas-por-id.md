# Story 2.3: Listar e consultar tarefas por id

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a usuario do app,
I want listar tarefas e consultar uma tarefa especifica,
so that a interface consiga carregar lista principal e detalhes de forma previsivel.

## Acceptance Criteria

1. `GET /api/v1/tasks` retorna dados de tarefa em formato consistente para o frontend.
2. `GET /api/v1/tasks/:id` retorna a tarefa correspondente em formato consistente.
3. A consulta por `id` retorna `NOT_FOUND` padronizado quando o recurso nao existir.
4. O estado da tarefa fica exposto de forma clara na resposta.

## Tasks / Subtasks

- [x] Expor leitura da feature `tasks` por rotas versionadas (AC: 1, 2, 3, 4)
  - [x] Adicionar `GET /api/v1/tasks` em `TasksController`
  - [x] Adicionar `GET /api/v1/tasks/:id` em `TasksController`
  - [x] Manter a resposta de sucesso direta, sem wrapper `{ data: ... }`
- [x] Implementar fluxo de listagem e consulta sem acoplar Prisma ao controller (AC: 1, 2, 3, 4)
  - [x] Evoluir `TasksService` com operacoes de listagem e busca por id
  - [x] Evoluir `TasksRepository` com queries de leitura para lista e item unico
  - [x] Reaproveitar `TaskMapper` para serializar a resposta
  - [x] Garantir que o estado (`status`) da tarefa fique exposto claramente no contrato retornado
- [x] Tratar recurso inexistente com erro padronizado (AC: 3)
  - [x] Mapear leitura por id inexistente para erro HTTP `404`
  - [x] Garantir `code: NOT_FOUND` e mensagem coerente com o filtro global de erro
  - [x] Nao vazar detalhes internos do Prisma na resposta
- [x] Preservar compatibilidade com o contrato atual da feature (AC: 1, 2, 4)
  - [x] Reaproveitar `TaskContract` e enums da `2.1`
  - [x] Garantir que datas continuem saindo em ISO 8601 e opcionais continuem coerentes com `null`
  - [x] Manter naming em `camelCase`
- [x] Cobrir os caminhos principais com testes unitarios e e2e (AC: 1, 2, 3, 4)
  - [x] Criar testes unitarios para service/repository quando houver logica relevante de erro ou mapeamento
  - [x] Ampliar e2e para provar:
    - listagem com tarefas persistidas
    - consulta por id existente
    - consulta por id inexistente com `NOT_FOUND`
  - [x] Garantir isolamento do banco entre testes
- [x] Validar a story antes de concluir (AC: 1, 2, 3, 4)
  - [x] Executar `npm run prisma:validate`
  - [x] Executar `npm run prisma:generate`
  - [x] Executar `npm run build`
  - [x] Executar `npm test -- --runInBand`
  - [x] Executar `npm run test:e2e -- --runInBand`

## Dev Notes

- Esta story estende a primeira entrega HTTP real de `tasks`, adicionando leitura da lista principal e leitura de detalhe sem introduzir ainda update/delete, filtros ou ordenacao rica.
- O frontend precisa dessas duas leituras para montar a lista e abrir detalhe sem heuristica local.
- A `2.2` ja consolidou controller, service, repository, validacao com `zod` para create e cobertura e2e com banco real. O objetivo aqui e evoluir essa base, nao reinventar estrutura.
- O principal cuidado desta story e manter consistencia de contrato:
  - lista retorna array direto
  - item retorna recurso direto
  - inexistente retorna `NOT_FOUND`

### Project Structure Notes

- A feature continua em `api/src/modules/tasks/`.
- Reaproveitar e evoluir:
  - `tasks.controller.ts`
  - `tasks.service.ts`
  - `repositories/tasks.repository.ts`
  - `mappers/task.mapper.ts`
  - `contracts/task.contract.ts`
- Nao criar uma segunda linha de contratos ou mapeadores paralelos.
- O acesso ao banco continua concentrado em `TasksRepository`, usando `PrismaService`.

### Technical Requirements

- Endpoints alvo:
  - `GET /api/v1/tasks`
  - `GET /api/v1/tasks/:id`
- `GET /api/v1/tasks` deve devolver um array direto de `TaskContract`.
- `GET /api/v1/tasks/:id` deve devolver um `TaskContract` unico.
- O contrato retornado deve continuar expondo:
  - `id`
  - `title`
  - `description`
  - `dueDate`
  - `priority`
  - `tags`
  - `status`
  - `createdAt`
  - `updatedAt`
- `status` precisa ficar claramente visivel na resposta para o frontend.
- `:id` invalido ou inexistente nao deve gerar erro cru do banco; deve resultar em `NOT_FOUND` padronizado.
- Ainda nao introduzir nesta story:
  - filtros por `status`
  - busca textual
  - ordenacao customizada
  - paginacao

### Architecture Compliance

- Controller limita-se a HTTP.
- Service concentra regras de leitura e tratamento de inexistencia.
- Repository concentra queries Prisma.
- Respostas de sucesso continuam diretas.
- Erros continuam passando pelo contrato global implantado na `1.4`.
- Nada de Prisma direto no controller.

### File Structure Requirements

- Arquivos provavelmente tocados nesta story:
  - `api/src/modules/tasks/tasks.controller.ts`
  - `api/src/modules/tasks/tasks.service.ts`
  - `api/src/modules/tasks/repositories/tasks.repository.ts`
  - `api/src/modules/tasks/mappers/task.mapper.ts`
  - `api/test/app.e2e-spec.ts`
- Arquivos provaveis adicionais:
  - `api/src/modules/tasks/*.spec.ts`
- Evitar nesta story:
  - filtros
  - ordenacao
  - update/delete
  - endpoint de troca de status

### Testing Requirements

- Validar obrigatoriamente:
  - `npm run prisma:validate`
  - `npm run prisma:generate`
  - `npm run build`
  - `npm test -- --runInBand`
  - `npm run test:e2e -- --runInBand`
- O e2e deve provar pelo menos:
  - lista retornando array de tarefas persistidas
  - detalhe retornando tarefa por id
  - `NOT_FOUND` para id inexistente
- Como os testes usam banco real, manter limpeza/isolamento entre casos.

### Previous Story Learnings

- A `2.1` consolidou schema, enums e `TaskMapper`; a `2.3` deve reaproveitar isso integralmente.
- A `2.2` consolidou a primeira rota de dominio, validacao `zod`, repository e limpeza de banco nos e2e; a leitura deve seguir o mesmo desenho.
- O contrato global de erro ja esta pronto, entao a historia de `NOT_FOUND` deve usar esse fluxo em vez de criar resposta especial.
- O frontend ja depende de contratos simples e diretos; lista deve retornar array, nao objeto embrulhado.

### Git Intelligence

- A feature `tasks` ja possui create funcional, controller, service, repository e mapper prontos para extensao.
- O banco e as migrations ja suportam leitura real da tabela `Task`.
- O `TaskMapper` deve continuar sendo a unica saida serializada da feature para evitar divergencia de formato entre create e read.

### References

- Story source e acceptance criteria: [Source: _bmad-output/planning-artifacts/epics.md#Story-23-Listar-e-consultar-tarefas-por-id]
- Objetivo do Epic 2: [Source: _bmad-output/planning-artifacts/epics.md#Epic-2-Cadastro-e-Manutencao-Confiavel-de-Tarefas]
- Regras de response shape: [Source: _bmad-output/planning-artifacts/architecture.md#Format-Patterns]
- Regras de erro `NOT_FOUND`: [Source: _bmad-output/planning-artifacts/architecture.md#Format-Patterns]
- Exemplo de query params futuros e naming: [Source: _bmad-output/planning-artifacts/architecture.md#Pattern-Examples]
- Learnings da modelagem da feature: [Source: _bmad-output/implementation-artifacts/2-1-definir-schema-task-e-contratos-de-dominio-da-api.md]
- Learnings da criacao de tarefa: [Source: _bmad-output/implementation-artifacts/2-2-criar-tarefa-com-validacao-e-retorno-consistente.md]

## Dev Agent Record

### Agent Model Used

Codex (GPT-5 family)

### Debug Log References

- A base da `2.2` ja tinha controller, service, repository e e2e conectados ao banco, o que permitiu estender a feature sem refazer estrutura.
- A listagem foi implementada com array direto e ordenacao por `createdAt desc` no repository para manter resposta deterministica.
- A leitura por id inexistente foi tratada no service com `NotFoundException` padronizada, reaproveitando o filtro global de erro.
- Os e2e continuaram limpando a tabela `Task` entre casos para evitar interferencia entre testes de create e read.

### Completion Notes List

- Implementados `GET /api/v1/tasks` e `GET /api/v1/tasks/:id`.
- `TasksRepository` agora suporta leitura de lista e de item unico.
- `TasksService` agora expõe operacoes de leitura e traduz inexistencia para `NOT_FOUND`.
- `TaskMapper` continua sendo a unica saida serializada da feature para manter consistencia entre create e read.
- Os e2e agora cobrem listagem, consulta por id existente e `NOT_FOUND` para recurso ausente.
- Validacoes concluidas com sucesso: `npm run prisma:validate`, `npm run prisma:generate`, `npm run lint`, `npm run build`, `npm test -- --runInBand` e `npm run test:e2e -- --runInBand`.

### File List

- _bmad-output/implementation-artifacts/2-3-listar-e-consultar-tarefas-por-id.md
- _bmad-output/implementation-artifacts/sprint-status.yaml
- api/src/modules/tasks/repositories/tasks.repository.ts
- api/src/modules/tasks/tasks.controller.ts
- api/src/modules/tasks/tasks.service.ts
- api/src/modules/tasks/tasks.service.read.spec.ts
- api/test/app.e2e-spec.ts

### Change Log

- 2026-03-30: implementados endpoints de leitura de tarefas, tratamento `NOT_FOUND` padronizado e cobertura automatizada de listagem e consulta por id; story promovida para `review`.
