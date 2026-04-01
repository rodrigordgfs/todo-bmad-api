# Story 3.4: Aplicar busca, filtro, ordenacao e mudanca de estado no escopo autenticado

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a usuario autenticado,
I want usar todas as capacidades atuais de tarefas apenas sobre meu conjunto de dados,
so that a experiencia existente continue util sem violar privacidade.

## Acceptance Criteria

1. Busca, filtro por status e ordenacao continuam funcionando apenas sobre tarefas pertencentes ao usuario autenticado.
2. O comportamento atual de busca, filtro e ordenacao e preservado dentro do escopo proprio do usuario.
3. Mudancas de estado continuam respeitando o contrato existente no endpoint `PATCH /tasks/:id/status`, operando apenas dentro do escopo autenticado.

## Tasks / Subtasks

- [x] Consolidar comportamento de listagem no escopo autenticado (AC: 1, 2)
  - [x] Revisar `TasksService.findAll` e `TasksRepository.findAll` para garantir que busca, filtro por status e ordenacao continuam aplicados apenas depois do escopo por `userId`.
  - [x] Confirmar que `status=all`, `status=open`, `status=completed`, busca por titulo, descricao e tags e busca em branco preservam o comportamento existente dentro do conjunto proprio.
  - [x] Cobrir explicitamente pelo menos um cenario multiusuario com prioridades e prazos sobrepostos para provar que a ordenacao continua correta dentro do escopo do usuario autenticado.
  - [x] Garantir que o resultado nao mistura tarefas de outros usuarios mesmo quando multiplos usuarios possuem dados com termos ou filtros equivalentes.
- [x] Consolidar mudanca de estado no escopo autenticado (AC: 1, 3)
  - [x] Confirmar que `PATCH /tasks/:id/status` continua respeitando o contrato atual de payload e resposta.
  - [x] Garantir que a mudanca de estado continua funcionando para tarefa propria dentro do escopo autenticado ja consolidado.
  - [x] Evitar revalidar nesta story a semantica base de ownership cross-user ja consolidada na Story 3.3; aqui o foco e continuidade do comportamento funcional para tarefa propria.
- [x] Expandir cobertura automatizada para capacidades atuais no escopo autenticado (AC: 1, 2, 3)
  - [x] Adicionar e2e com pelo menos dois usuarios autenticados e dados sobrepostos para busca/filtro.
  - [x] Cobrir que busca, filtro e ordenacao retornam apenas tarefas do usuario autenticado mesmo quando outro usuario possui tarefas com os mesmos termos.
  - [x] Cobrir que a mudanca de estado continua funcionando para tarefa propria dentro desse contexto autenticado final.

## Dev Notes

- A `3.2` ja protegeu todas as rotas de `tasks` com JWT e passou o `userId` autenticado pela aplicacao. [Source: /home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/implementation-artifacts/3-2-proteger-rotas-de-tarefas-com-autenticacao-jwt.md]
- A `3.3` consolidou ownership multiusuario por recurso e fixou `404 Not Found` para tarefa fora do ownership. [Source: /home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/implementation-artifacts/3-3-restringir-leitura-e-escrita-de-tarefas-ao-proprio-usuario.md]
- O epic fixa que busca, filtro, ordenacao e mudanca de estado devem continuar uteis apenas sobre o conjunto proprio do usuario autenticado. [Source: /home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/planning-artifacts/epics.md#Story-34-Aplicar-busca-filtro-ordenacao-e-mudanca-de-estado-no-escopo-autenticado]
- Hoje `TasksService.findAll` ja aplica busca e ordenacao depois da leitura filtrada por `userId`, mas esta story deve consolidar isso com cenarios multiusuario sobrepostos, nao apenas com testes de um unico usuario. [Source: /home/rodrigordgfs/www/poc/todo-bmad-api/api/src/modules/tasks/tasks.service.ts]
- O endpoint `PATCH /tasks/:id/status` ja funciona com contexto autenticado e ownership por recurso. Aqui o foco e confirmar que o comportamento funcional existente para tarefa propria segue integro apos a consolidacao do Epic 3, sem duplicar a verificacao cross-user da `3.3`.
- Nao reabrir autenticacao, refresh/logout nem semantica basica de ownership; essas camadas ja estao resolvidas nas historias anteriores.
- Tambem nao introduzir aqui novos contratos de erro fora do que ja esta consolidado para `tasks`.

### Project Structure Notes

- Manter a separacao atual entre `TasksController`, `TasksService` e `TasksRepository`.
- O escopo autenticado deve continuar entrando pelo `userId` ja propagado na `3.2`.
- Os refinamentos desta story devem ficar concentrados principalmente em testes e consolidacao de comportamento.

### References

- Story source: [epics.md](/home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/planning-artifacts/epics.md)
- PRD: [prd.md](/home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/planning-artifacts/prd.md)
- Architecture: [architecture.md](/home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/planning-artifacts/architecture.md)
- Sprint tracking: [sprint-status.yaml](/home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/implementation-artifacts/sprint-status.yaml)
- Previous stories:
  - [3-2-proteger-rotas-de-tarefas-com-autenticacao-jwt.md](/home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/implementation-artifacts/3-2-proteger-rotas-de-tarefas-com-autenticacao-jwt.md)
  - [3-3-restringir-leitura-e-escrita-de-tarefas-ao-proprio-usuario.md](/home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/implementation-artifacts/3-3-restringir-leitura-e-escrita-de-tarefas-ao-proprio-usuario.md)
- Tasks service atual: [tasks.service.ts](/home/rodrigordgfs/www/poc/todo-bmad-api/api/src/modules/tasks/tasks.service.ts)
- Sprint tracking: [sprint-status.yaml](/home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/implementation-artifacts/sprint-status.yaml)

## Dev Agent Record

### Agent Model Used

gpt-5

### Debug Log References

- Story criada a partir do PRD, arquitetura, epics e do estado atual de `tasks` apos as Stories 3.2 e 3.3.
- `npm run test:e2e -- --runTestsByPath test/app.e2e-spec.ts`
- `npm run build`
- `npm run lint`

### Completion Notes List

- Consolidada a cobertura multiusuario para ordenacao com prioridades e prazos sobrepostos dentro do escopo autenticado.
- Coberto o isolamento final de busca e filtro quando outro usuario possui tarefas com termos equivalentes.
- Validada a continuidade funcional de `PATCH /tasks/:id/status` para tarefa propria sem reabrir a semantica cross-user da Story 3.3.

### File List

- `_bmad-output/implementation-artifacts/3-4-aplicar-busca-filtro-ordenacao-e-mudanca-de-estado-no-escopo-autenticado.md`
- `api/test/app.e2e-spec.ts`

### Change Log

- 2026-03-31: Story criada para consolidar busca, filtro, ordenacao e mudanca de estado no escopo autenticado.
- 2026-03-31: Implementada a cobertura e2e multiusuario para ordenacao, busca/filtro e continuidade funcional de mudanca de estado no escopo autenticado.
