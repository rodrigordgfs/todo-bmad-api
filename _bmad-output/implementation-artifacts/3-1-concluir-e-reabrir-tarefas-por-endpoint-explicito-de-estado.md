# Story 3.1: Concluir e reabrir tarefas por endpoint explicito de estado

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a usuario do app,
I want concluir e reabrir tarefas em uma acao simples,
so that o frontend reflita progresso imediato com contrato claro.

## Acceptance Criteria

1. `PATCH /api/v1/tasks/:id/status` atualiza o estado da tarefa com persistencia confiavel.
2. A resposta retorna a tarefa atualizada em formato consistente.
3. Tentativas sobre tarefa inexistente retornam erro padronizado.

## Tasks / Subtasks

- [x] Expor mudanca de estado por endpoint explicito da feature `tasks` (AC: 1, 2, 3)
  - [x] Adicionar `PATCH /api/v1/tasks/:id/status` em `TasksController`
  - [x] Garantir que esse endpoint fique claramente separado do `PATCH /api/v1/tasks/:id` ja existente
  - [x] Manter resposta de sucesso direta, retornando a tarefa atualizada
- [x] Implementar validacao de entrada para troca de estado (AC: 1)
  - [x] Criar schema `zod` especifico para payload de status
  - [x] Reaproveitar `ZodValidationPipe` na rota de status
  - [x] Aceitar apenas valores compativeis com `TaskStatus`
  - [x] Rejeitar payload vazio ou estado invalido com `VALIDATION_ERROR`
- [x] Implementar fluxo de update de status sem acoplar Prisma ao controller (AC: 1, 2, 3)
  - [x] Evoluir `TasksService` com operacao explicita de update de status
  - [x] Evoluir `TasksRepository` com update restrito ao campo `status`
  - [x] Reaproveitar `TaskMapper` para a resposta
  - [x] Garantir que a tarefa persista o novo estado no PostgreSQL
- [x] Preservar a semantica do dominio e evitar sobreposicao de escopo (AC: 1, 2, 3)
  - [x] Nao reabrir o `PATCH /api/v1/tasks/:id` generico para aceitar `status`
  - [x] Nao introduzir ainda filtros ou ordenacao; isso continua para `3.2` e `3.3`
  - [x] Tratar recurso inexistente com `NOT_FOUND` padronizado
- [x] Cobrir o comportamento com testes unitarios e e2e (AC: 1, 2, 3)
  - [x] Criar testes unitarios para service/repository quando houver logica relevante
  - [x] Ampliar e2e para provar:
    - conclusao de tarefa aberta
    - reabertura de tarefa concluida
    - payload de status invalido
    - recurso inexistente com `NOT_FOUND`
  - [x] Garantir isolamento do banco entre testes
- [x] Validar a story antes de concluir (AC: 1, 2, 3)
  - [x] Executar `npm run prisma:validate`
  - [x] Executar `npm run prisma:generate`
  - [x] Executar `npm run build`
  - [x] Executar `npm test -- --runInBand`
  - [x] Executar `npm run test:e2e -- --runInBand`

## Dev Notes

- Esta story inaugura o Epic 3 com uma decisao importante de contrato: mudanca de estado acontece em endpoint proprio, e nao dentro do `PATCH /tasks/:id` generico.
- O objetivo e deixar o frontend concluir e reabrir tarefas de forma explicita e previsivel, sem misturar manutencao de campos com transicoes de estado.
- O projeto ja possui tudo que precisa para isso:
  - `TaskStatus` modelado no banco e no dominio
  - `TaskMapper` consolidado
  - CRUD base funcional em `tasks`
  - validacao `zod` e erro global padronizado

### Project Structure Notes

- A feature continua em `api/src/modules/tasks/`.
- Reaproveitar e evoluir:
  - `tasks.controller.ts`
  - `tasks.service.ts`
  - `repositories/tasks.repository.ts`
  - `dto/update-task-status.dto.ts`
  - `mappers/task.mapper.ts`
- Criar schema `zod` especifico em `schemas/` para a mudanca de estado.
- Nao duplicar contratos nem criar outro mapper de saída.

### Technical Requirements

- Endpoint alvo: `PATCH /api/v1/tasks/:id/status`
- Payload esperado:
  - `status` obrigatorio
- Valores válidos:
  - `OPEN`
  - `COMPLETED`
- O endpoint deve permitir:
  - concluir tarefa aberta
  - reabrir tarefa concluida
- A resposta de sucesso deve devolver a tarefa atualizada diretamente.
- Recurso inexistente deve retornar `NOT_FOUND`.
- `id` malformado continua devendo ser barrado na borda HTTP antes de chegar ao Prisma.
- O endpoint genérico `PATCH /api/v1/tasks/:id` não deve passar a aceitar `status`; a separação precisa continuar explícita.

### Architecture Compliance

- Controller limita-se a HTTP.
- Validacao na borda com `zod`.
- Service concentra regra de transição explícita de estado.
- Repository concentra query Prisma.
- Nada de Prisma direto no controller.
- Erros continuam seguindo o filtro global.
- Response de sucesso continua direta, sem wrapper.

### File Structure Requirements

- Arquivos provavelmente tocados nesta story:
  - `api/src/modules/tasks/tasks.controller.ts`
  - `api/src/modules/tasks/tasks.service.ts`
  - `api/src/modules/tasks/repositories/tasks.repository.ts`
  - `api/src/modules/tasks/dto/update-task-status.dto.ts`
  - `api/test/app.e2e-spec.ts`
- Arquivos provaveis adicionais:
  - `api/src/modules/tasks/schemas/update-task-status.schema.ts`
  - `api/src/modules/tasks/*.spec.ts`
- Evitar nesta story:
  - filtro por estado
  - ordenacao
  - busca textual
  - mudancas no endpoint generico de update alem do necessario para preservar o boundary

### Testing Requirements

- Validar obrigatoriamente:
  - `npm run prisma:validate`
  - `npm run prisma:generate`
  - `npm run build`
  - `npm test -- --runInBand`
  - `npm run test:e2e -- --runInBand`
- O e2e deve provar pelo menos:
  - tarefa indo para `COMPLETED`
  - tarefa voltando para `OPEN`
  - erro de validacao para payload invalido
  - `NOT_FOUND` para recurso inexistente
- Como os testes usam banco real, manter limpeza/isolamento entre casos.

### Previous Story Learnings

- A `2.1` consolidou `TaskStatus` no schema e nos contratos; a `3.1` deve reaproveitar isso, sem inventar novos valores.
- A `2.2` e a `2.4` consolidaram validacao `zod` e fronteira limpa entre controller/service/repository; a transição de estado deve seguir o mesmo desenho.
- A `2.3` consolidou `NOT_FOUND` e validação de UUID na borda; isso deve valer também aqui.
- A `2.4` reforçou explicitamente que `status` fica fora do `PATCH /tasks/:id`; esta story materializa essa decisão em endpoint próprio.

### Git Intelligence

- A feature `tasks` já possui CRUD base estável e cobertura e2e conectada ao banco.
- O `TaskMapper` já é a saída única da feature e deve continuar assim.
- O `TaskStatus` já existe em enum interno, DTO e schema Prisma, o que reduz risco de divergência ao implementar a rota de status.

### References

- Story source e acceptance criteria: [Source: _bmad-output/planning-artifacts/epics.md#Story-31-Concluir-e-reabrir-tarefas-por-endpoint-explicito-de-estado]
- Objetivo do Epic 3: [Source: _bmad-output/planning-artifacts/epics.md#Epic-3-Progresso-e-Organizacao-do-Trabalho]
- Regras de validacao consistente: [Source: _bmad-output/planning-artifacts/architecture.md#Project-Context-Analysis]
- Regras de camada e anti-patterns: [Source: _bmad-output/planning-artifacts/architecture.md#Implementation-Patterns-&-Consistency-Rules]
- Referencia do endpoint de status na arquitetura: [Source: _bmad-output/planning-artifacts/architecture.md#API-&-Communication-Patterns]
- Regras de erro `NOT_FOUND`: [Source: _bmad-output/planning-artifacts/architecture.md#Format-Patterns]
- Learnings da modelagem da feature: [Source: _bmad-output/implementation-artifacts/2-1-definir-schema-task-e-contratos-de-dominio-da-api.md]
- Learnings do CRUD base: [Source: _bmad-output/implementation-artifacts/2-2-criar-tarefa-com-validacao-e-retorno-consistente.md]
- Learnings de leitura: [Source: _bmad-output/implementation-artifacts/2-3-listar-e-consultar-tarefas-por-id.md]
- Learnings de update/delete: [Source: _bmad-output/implementation-artifacts/2-4-editar-e-excluir-tarefas-com-seguranca-de-dominio.md]

## Dev Agent Record

### Agent Model Used

Codex (GPT-5 family)

### Debug Log References

- A feature `tasks` ja tinha CRUD base estavel, entao a implementacao focou em adicionar uma transicao explicita de estado sem reabrir o `PATCH` generico.
- O DTO de status ja existia, o que permitiu manter o escopo pequeno e concentrar a validacao no novo schema `zod`.
- A versao atual do `zod` no projeto nao aceitava `errorMap` em `nativeEnum`, entao a validacao de `status` foi estabilizada com `refine` para preservar mensagem previsivel no contrato de erro.
- Os e2e continuaram usando banco real com limpeza da tabela `Task` entre cenarios para validar a persistencia da transicao de estado.

### Completion Notes List

- Implementado `PATCH /api/v1/tasks/:id/status` com resposta direta da tarefa atualizada.
- `TasksService` e `TasksRepository` agora possuem fluxo dedicado para update de `status`, separado do update generico.
- O endpoint aceita apenas `OPEN` e `COMPLETED`, mantendo `VALIDATION_ERROR` padronizado para payload invalido.
- Os testes cobrem conclusao, reabertura, payload invalido e `NOT_FOUND` para recurso inexistente.
- Validacoes concluidas com sucesso: `npm run prisma:validate`, `npm run prisma:generate`, `npm run lint`, `npm run build`, `npm test -- --runInBand` e `npm run test:e2e -- --runInBand`.

### File List

- _bmad-output/implementation-artifacts/3-1-concluir-e-reabrir-tarefas-por-endpoint-explicito-de-estado.md
- _bmad-output/implementation-artifacts/sprint-status.yaml
- api/src/modules/tasks/repositories/tasks.repository.ts
- api/src/modules/tasks/schemas/update-task-status.schema.ts
- api/src/modules/tasks/tasks.controller.ts
- api/src/modules/tasks/tasks.service.ts
- api/src/modules/tasks/tasks.service.write.spec.ts
- api/test/app.e2e-spec.ts

### Change Log

- 2026-03-31: implementado endpoint explicito de transicao de estado para tarefas, com validacao `zod`, persistencia dedicada, `NOT_FOUND` padronizado e cobertura automatizada; story promovida para `review`.
