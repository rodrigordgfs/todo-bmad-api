# Story 2.4: Editar e excluir tarefas com seguranca de dominio

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a usuario do app,
I want editar e excluir tarefas existentes,
so that eu mantenha minha lista correta ao longo do uso.

## Acceptance Criteria

1. `PATCH /api/v1/tasks/:id` atualiza os campos editaveis com validacao consistente.
2. `DELETE /api/v1/tasks/:id` remove o recurso e responde com `204 No Content`.
3. Operacoes sobre tarefa inexistente retornam erro padronizado de nao encontrado.

## Tasks / Subtasks

- [x] Expor edicao e exclusao via rotas versionadas da feature `tasks` (AC: 1, 2, 3)
  - [x] Adicionar `PATCH /api/v1/tasks/:id` em `TasksController`
  - [x] Adicionar `DELETE /api/v1/tasks/:id` em `TasksController`
  - [x] Garantir `204 No Content` na exclusao, sem body de sucesso
- [x] Implementar validacao de update com a mesma consistencia da criacao (AC: 1)
  - [x] Criar schema `zod` especifico de update task
  - [x] Reaproveitar `ZodValidationPipe` na rota de edicao
  - [x] Permitir somente campos editaveis: `title`, `description`, `dueDate`, `priority` e `tags`
  - [x] Rejeitar payload vazio com `VALIDATION_ERROR`, exigindo ao menos um campo editavel no `PATCH`
  - [x] Preservar regras da feature:
    - `title`, quando enviado, nao pode ser vazio
    - `description` vazia deve normalizar para `null`
    - `dueDate` aceita ISO 8601 valido, `null` ou ausencia
    - `tags` segue como lista de strings
- [x] Implementar fluxo de update sem acoplar Prisma ao controller (AC: 1, 3)
  - [x] Evoluir `TasksService` com operacao de update
  - [x] Evoluir `TasksRepository` com update por id
  - [x] Garantir que update sobre recurso inexistente resulte em `NOT_FOUND` padronizado
  - [x] Reaproveitar `TaskMapper` para a resposta da tarefa atualizada
- [x] Implementar fluxo de delete com semantica HTTP correta (AC: 2, 3)
  - [x] Evoluir `TasksService` com operacao de delete
  - [x] Evoluir `TasksRepository` com delete por id
  - [x] Garantir que delete sobre recurso inexistente resulte em `NOT_FOUND` padronizado
  - [x] Garantir que o controller finalize com `204` e sem payload
- [x] Preservar o boundary atual da feature e evitar escopo prematuro (AC: 1, 2, 3)
  - [x] Manter Prisma restrito ao repository
  - [x] Nao introduzir ainda endpoint especifico de troca de status; isso pertence a `3.1`
  - [x] Nao introduzir filtro, busca ou ordenacao; isso pertence ao Epic 3
- [x] Cobrir os caminhos principais com testes unitarios e e2e (AC: 1, 2, 3)
  - [x] Criar testes unitarios para logica relevante de update/delete e `NOT_FOUND`
  - [x] Ampliar e2e para provar:
    - update com payload valido
    - update invalido com erro padronizado
    - update em recurso inexistente com `NOT_FOUND`
    - delete com `204`
    - delete em recurso inexistente com `NOT_FOUND`
  - [x] Garantir isolamento do banco entre testes
- [x] Validar a story antes de concluir (AC: 1, 2, 3)
  - [x] Executar `npm run prisma:validate`
  - [x] Executar `npm run prisma:generate`
  - [x] Executar `npm run build`
  - [x] Executar `npm test -- --runInBand`
  - [x] Executar `npm run test:e2e -- --runInBand`

## Dev Notes

- Esta story fecha o CRUD base do Epic 2 sem ainda entrar nas transicoes explicitas de estado do Epic 3.
- O objetivo aqui e permitir manutencao segura da lista pelo frontend, preservando contratos, validacao e semantica HTTP ja consolidados.
- As stories anteriores ja deixaram a feature `tasks` com create, list e detail funcionais. A `2.4` evolui essa mesma estrutura, sem abrir uma segunda arquitetura paralela.
- O principal cuidado e separar bem dois conceitos:
  - editar campos de tarefa em `PATCH /tasks/:id`
  - mudar estado explicitamente em `PATCH /tasks/:id/status`, que continua fora desta story

### Project Structure Notes

- A feature continua em `api/src/modules/tasks/`.
- Reaproveitar e evoluir:
  - `tasks.controller.ts`
  - `tasks.service.ts`
  - `repositories/tasks.repository.ts`
  - `mappers/task.mapper.ts`
  - `dto/update-task.dto.ts`
- Criar schema `zod` proprio para update em `schemas/`, seguindo o mesmo padrao de create.
- Nao duplicar contratos; seguir com `TaskContract` como resposta de update.

### Technical Requirements

- Endpoints alvo:
  - `PATCH /api/v1/tasks/:id`
  - `DELETE /api/v1/tasks/:id`
- Campos editaveis nesta story:
  - `title`
  - `description`
  - `dueDate`
  - `priority`
  - `tags`
- Payload vazio em `PATCH /api/v1/tasks/:id` deve ser rejeitado com erro padronizado de validacao; esta story nao trata update vazio como no-op silencioso.
- `status` nao deve ser editado por este endpoint; a mudanca explicita de estado fica para `3.1`.
- Regras de normalizacao esperadas:
  - `description: ""` ou so espacos vira `null`
  - `dueDate` aceita ISO 8601 valido ou `null`
  - ausencia de campo nao altera valor atual
- `PATCH` retorna a tarefa atualizada diretamente.
- `DELETE` retorna `204 No Content`.
- Recurso inexistente em update/delete retorna `NOT_FOUND`.
- `id` malformado continua devendo ser barrado na borda HTTP antes de chegar ao Prisma, seguindo o ajuste consolidado na `2.3`.

### Architecture Compliance

- Controller limita-se a HTTP.
- Validacao na borda com `zod`.
- Service concentra regras de update/delete e tratamento de inexistencia.
- Repository concentra queries Prisma.
- Nada de Prisma direto no controller.
- Erros seguem o filtro global.
- Success responses seguem o padrao atual:
  - `PATCH` com recurso direto
  - `DELETE` com `204` sem body

### File Structure Requirements

- Arquivos provavelmente tocados nesta story:
  - `api/src/modules/tasks/tasks.controller.ts`
  - `api/src/modules/tasks/tasks.service.ts`
  - `api/src/modules/tasks/repositories/tasks.repository.ts`
  - `api/src/modules/tasks/dto/update-task.dto.ts`
  - `api/test/app.e2e-spec.ts`
- Arquivos provaveis adicionais:
  - `api/src/modules/tasks/schemas/update-task.schema.ts`
  - `api/src/modules/tasks/*.spec.ts`
- Evitar nesta story:
  - endpoint `/tasks/:id/status`
  - filtros
  - busca textual
  - ordenacao

### Testing Requirements

- Validar obrigatoriamente:
  - `npm run prisma:validate`
  - `npm run prisma:generate`
  - `npm run build`
  - `npm test -- --runInBand`
  - `npm run test:e2e -- --runInBand`
- O e2e deve provar pelo menos:
  - update valido retornando recurso atualizado
  - update invalido com erro padronizado
  - update inexistente com `NOT_FOUND`
  - delete valido com `204`
  - delete inexistente com `NOT_FOUND`
- Como os testes usam banco real, manter limpeza/isolamento entre casos.

### Previous Story Learnings

- A `2.1` consolidou schema, enums, mapper e contratos de `Task`; a `2.4` reaproveita tudo isso.
- A `2.2` consolidou validacao `zod` e normalizacao de `description`/`dueDate`; update segue exatamente a mesma semantica.
- A `2.3` consolidou leitura por id com `NOT_FOUND` padronizado e validacao de UUID na borda; update/delete seguem o mesmo comportamento.
- O Epic 3 ainda vai tratar mudanca explicita de estado, filtro e ordenacao; esta story nao puxa esse escopo para dentro do endpoint generico de update.

### Git Intelligence

- A feature `tasks` ja possui create, list e detail funcionais sobre a mesma estrutura de controller/service/repository.
- O padrao atual da feature e de respostas diretas, `TaskMapper` unico e e2e com limpeza da tabela `Task` entre casos.
- O tratamento de `id` malformado na borda ja existe e foi preservado nos novos endpoints com `:id`.

### References

- Story source e acceptance criteria: [Source: _bmad-output/planning-artifacts/epics.md#Story-24-Editar-e-excluir-tarefas-com-seguranca-de-dominio]
- Objetivo do Epic 2: [Source: _bmad-output/planning-artifacts/epics.md#Epic-2-Cadastro-e-Manutencao-Confiavel-de-Tarefas]
- Regras de validacao consistente: [Source: _bmad-output/planning-artifacts/architecture.md#Project-Context-Analysis]
- Regras de camada e anti-patterns: [Source: _bmad-output/planning-artifacts/architecture.md#Implementation-Patterns-&-Consistency-Rules]
- Regras de erro `NOT_FOUND` e response shape: [Source: _bmad-output/planning-artifacts/architecture.md#Format-Patterns]
- Learnings da modelagem: [Source: _bmad-output/implementation-artifacts/2-1-definir-schema-task-e-contratos-de-dominio-da-api.md]
- Learnings da criacao: [Source: _bmad-output/implementation-artifacts/2-2-criar-tarefa-com-validacao-e-retorno-consistente.md]
- Learnings de listagem e detalhe: [Source: _bmad-output/implementation-artifacts/2-3-listar-e-consultar-tarefas-por-id.md]

## Dev Agent Record

### Agent Model Used

Codex (GPT-5 family)

### Debug Log References

- A implementacao aproveitou o desenho consolidado da feature `tasks`: controller, service, repository, mapper e e2e com banco real.
- O `PATCH` exigiu cuidado extra com escopo do `ZodValidationPipe`; ele precisou ficar preso ao `@Body()` para nao tentar validar o parametro `id`.
- A normalizacao de `description` no update tambem exigiu ajuste fino para que string vazia virasse `null` e nao ausencia silenciosa.
- O tratamento de `id` malformado continuou na borda HTTP, reaproveitando o pipe consolidado na `2.3`.

### Completion Notes List

- Implementados `PATCH /api/v1/tasks/:id` e `DELETE /api/v1/tasks/:id`.
- O update agora valida payload com `zod`, rejeita body vazio e normaliza `description`/`dueDate` de forma coerente com a feature.
- `TasksService` e `TasksRepository` agora suportam update e delete com `NOT_FOUND` padronizado para recurso ausente.
- O delete retorna `204 No Content` sem body.
- Os testes cobrem update valido, payload vazio invalido, `NOT_FOUND` em update/delete e remocao real no banco.
- Validacoes concluidas com sucesso: `npm run prisma:validate`, `npm run prisma:generate`, `npm run lint`, `npm run build`, `npm test -- --runInBand` e `npm run test:e2e -- --runInBand`.

### File List

- _bmad-output/implementation-artifacts/2-4-editar-e-excluir-tarefas-com-seguranca-de-dominio.md
- _bmad-output/implementation-artifacts/sprint-status.yaml
- api/src/modules/tasks/repositories/tasks.repository.ts
- api/src/modules/tasks/schemas/update-task.schema.ts
- api/src/modules/tasks/tasks.controller.ts
- api/src/modules/tasks/tasks.service.ts
- api/src/modules/tasks/tasks.service.write.spec.ts
- api/test/app.e2e-spec.ts

### Change Log

- 2026-03-31: implementados update e delete de tarefas com validacao `zod`, `NOT_FOUND` padronizado, `204 No Content` no delete e cobertura automatizada; story promovida para `review`.
