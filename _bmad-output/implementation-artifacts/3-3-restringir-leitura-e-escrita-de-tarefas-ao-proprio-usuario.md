# Story 3.3: Restringir leitura e escrita de tarefas ao proprio usuario

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a usuario autenticado,
I want criar, listar, consultar, editar e excluir apenas minhas tarefas,
so that meus dados permanecam privados e isolados.

## Acceptance Criteria

1. Toda operacao de leitura e escrita de `tasks` considera obrigatoriamente o `userId` autenticado como escopo do recurso.
2. Um usuario nao consegue consultar, alterar, concluir/reabrir ou excluir tarefas de outro usuario, e o backend responde de forma consistente com `404 Not Found` para recurso fora do ownership, sem vazar existencia do recurso alheio.
3. A criacao de tarefa associa automaticamente o recurso ao usuario autenticado.

## Tasks / Subtasks

- [x] Consolidar ownership de tarefa como regra explicita de negocio (AC: 1, 2, 3)
  - [x] Revisar `TasksService` e `TasksRepository` para garantir que nao existe nenhum caminho residual que contorne o escopo por `userId`.
  - [x] Tratar a semantica final para recurso alheio ou inexistente de forma consistente com `404 Not Found`, sem vazar dados de outro usuario.
  - [x] Confirmar que a criacao de tarefa continua associando o recurso ao usuario autenticado, sem fallback para owner interno.
- [x] Fechar leitura isolada por usuario em endpoints de detalhe e listagem (AC: 1, 2)
  - [x] Garantir que `GET /tasks` e `GET /tasks/:id` respondem apenas sobre tarefas pertencentes ao usuario autenticado.
  - [x] Cobrir explicitamente o caso em que outro usuario tenta consultar um `taskId` valido que nao lhe pertence.
  - [x] Garantir que a resposta de recurso fora do ownership siga a mesma decisao escolhida para nao encontrado/acesso negado.
- [x] Fechar escrita isolada por usuario em update/delete (AC: 1, 2, 3)
  - [x] Garantir que `PATCH /tasks/:id`, `PATCH /tasks/:id/status` e `DELETE /tasks/:id` nao operam sobre tarefas de outro usuario.
  - [x] Cobrir explicitamente tentativas cross-user de edicao, mudanca de estado e exclusao, deixando nesta story apenas o bloqueio de ownership da mudanca de estado.
  - [x] Manter a associacao de ownership automatico na criacao de novas tarefas do usuario autenticado.
- [x] Expandir cobertura automatizada para ownership multiusuario (AC: 1, 2, 3)
  - [x] Adicionar e2e com pelo menos dois usuarios autenticados e tarefas separadas.
  - [x] Cobrir leitura cruzada bloqueada, escrita cruzada bloqueada e criacao corretamente associada ao autor autenticado.
  - [x] Garantir que os testes de `tasks` continuem preservando o comportamento brownfield de adocao inicial sem misturar ownership entre contas reais.

## Dev Notes

- A `3.1` introduziu `Task.userId` e ownership estrutural no schema. [Source: /home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/implementation-artifacts/3-1-associar-tarefas-a-usuario-proprietario.md]
- A `3.2` ja protegeu todas as rotas de `tasks` com JWT e passou a propagar `userId` autenticado por toda a camada de aplicacao. [Source: /home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/implementation-artifacts/3-2-proteger-rotas-de-tarefas-com-autenticacao-jwt.md]
- O epic fixa que um usuario nao pode acessar nem modificar tarefas de outro, e que a criacao de tarefa deve ser automaticamente vinculada ao usuario autenticado. [Source: /home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/planning-artifacts/epics.md#Story-33-Restringir-leitura-e-escrita-de-tarefas-ao-proprio-usuario]
- Hoje `TasksRepository` ja consulta por `userId`, mas esta story deve transformar isso em contrato explicito e coberto para cenarios multiusuario, nao apenas em detalhe tecnico de implementacao. [Source: /home/rodrigordgfs/www/poc/todo-bmad-api/api/src/modules/tasks/repositories/tasks.repository.ts]
- `TasksService` ja recebe `userId` autenticado em todas as operacoes. O foco agora e provar e consolidar o comportamento de ownership com testes e semantica final para recursos de outro usuario. [Source: /home/rodrigordgfs/www/poc/todo-bmad-api/api/src/modules/tasks/tasks.service.ts]
- A ponte de brownfield introduzida na `3.2` para adocao inicial das tarefas legadas continua valida, mas esta story nao deve reabrir o owner interno como caminho de uso normal da aplicacao.
- Esta story fixa `404 Not Found` para recurso de outro usuario, evitando vazar existencia de tarefa alheia e mantendo consistencia com o contrato atual de `Task not found`.
- Nao introduzir aqui novas regras de sessao ou autenticacao; o Epic 2 e a `3.2` ja resolveram essas camadas.
- A `3.4` continua responsavel por reforcar busca, filtro, ordenacao e comportamento funcional da mudanca de estado no escopo autenticado. Nesta `3.3`, o foco principal e ownership de leitura/escrita por recurso, incluindo apenas o bloqueio cross-user do endpoint de status.

### Project Structure Notes

- Manter a separacao atual entre `TasksController`, `TasksService` e `TasksRepository`.
- Ownership deve continuar sendo aplicado por `userId` na aplicacao e reforcado na consulta/persistencia.
- Nao reintroduzir logica de ownership dentro de `AuthModule`.

### References

- Story source: [epics.md](/home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/planning-artifacts/epics.md)
- PRD: [prd.md](/home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/planning-artifacts/prd.md)
- Architecture: [architecture.md](/home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/planning-artifacts/architecture.md)
- Sprint tracking: [sprint-status.yaml](/home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/implementation-artifacts/sprint-status.yaml)
- Previous stories:
  - [3-1-associar-tarefas-a-usuario-proprietario.md](/home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/implementation-artifacts/3-1-associar-tarefas-a-usuario-proprietario.md)
  - [3-2-proteger-rotas-de-tarefas-com-autenticacao-jwt.md](/home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/implementation-artifacts/3-2-proteger-rotas-de-tarefas-com-autenticacao-jwt.md)
- Tasks service atual: [tasks.service.ts](/home/rodrigordgfs/www/poc/todo-bmad-api/api/src/modules/tasks/tasks.service.ts)
- Tasks repository atual: [tasks.repository.ts](/home/rodrigordgfs/www/poc/todo-bmad-api/api/src/modules/tasks/repositories/tasks.repository.ts)
- Tasks controller atual: [tasks.controller.ts](/home/rodrigordgfs/www/poc/todo-bmad-api/api/src/modules/tasks/tasks.controller.ts)

## Dev Agent Record

### Agent Model Used

gpt-5

### Debug Log References

- `npm run build`
- `npm run lint`
- `npm run test:e2e -- --runTestsByPath test/app.e2e-spec.ts`

### Completion Notes List

- Ownership por `userId` foi consolidado como contrato multiusuario com cobertura e2e cruzada para listagem, leitura por id, edicao, mudanca de estado e exclusao.
- Recurso de outro usuario retorna `404 Not Found` de forma consistente, sem vazar existencia da tarefa alheia.
- A criacao continua automaticamente associada ao usuario autenticado, e os testes mantiveram a ponte brownfield de adocao inicial sem misturar contas reais.

### File List

- `_bmad-output/implementation-artifacts/3-3-restringir-leitura-e-escrita-de-tarefas-ao-proprio-usuario.md`
- `api/test/app.e2e-spec.ts`

### Change Log

- 2026-03-31: Story criada para consolidar ownership multiusuario em leitura, escrita, edicao e exclusao de tarefas.
- 2026-03-31: Implementacao concluida com cobertura e2e de ownership cross-user e semantica consistente de `404 Not Found` para recurso fora do ownership.
