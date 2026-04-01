# Story 4.2: Atualizar Swagger e contratos publicos da API autenticada

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a integrador do app,
I want consultar a documentacao atualizada da API autenticada,
so that eu consiga consumir cadastro, login, refresh, logout e tasks protegidas com clareza.

## Acceptance Criteria

1. Endpoints de auth aparecem documentados com payloads, respostas de sucesso e respostas de erro corretas.
2. Endpoints de `tasks` refletem exigencia de autenticacao bearer e contratos coerentes com a implementacao atual.
3. Contratos publicos da API permanecem consistentes com a implementacao em runtime.

## Tasks / Subtasks

- [x] Consolidar documentacao Swagger dos endpoints de auth (AC: 1, 3)
  - [x] Revisar `POST /api/v1/auth/register`, `POST /api/v1/auth/login`, `POST /api/v1/auth/refresh` e `POST /api/v1/auth/logout` para garantir request bodies, status codes e response types coerentes com o runtime.
  - [x] Confirmar que respostas de erro relevantes, como `409 EMAIL_ALREADY_EXISTS`, `401 INVALID_CREDENTIALS` e `401 INVALID_REFRESH_TOKEN`, estao refletidas na documentacao publica.
  - [x] Garantir que `register` nao documente emissao de tokens e que `login`/`refresh` reutilizem o mesmo contrato publico quando isso ja for verdade na implementacao.
- [x] Consolidar documentacao Swagger dos endpoints protegidos de tasks (AC: 2, 3)
  - [x] Garantir que todos os endpoints de `tasks` exibam bearer auth no Swagger.
  - [x] Revisar respostas publicas de listagem, detalhe, criacao, atualizacao, mudanca de status e exclusao para alinhar tipos, status e exemplos com a implementacao atual.
  - [x] Confirmar que `401 INVALID_ACCESS_TOKEN` e a semantica de `404 NOT_FOUND` para recurso fora do ownership aparecam de forma consistente em toda a superficie protegida relevante de `tasks`, incluindo listagem, detalhe, criacao, atualizacao, mudanca de status e exclusao quando aplicavel.
- [x] Validar consistencia entre contratos publicos e runtime (AC: 1, 2, 3)
  - [x] Revisar DTOs, contracts e decorators Swagger para evitar divergencia entre payload real e schema publicado.
  - [x] Adicionar pelo menos uma validacao objetiva do documento OpenAPI gerado via `SwaggerModule.createDocument(...)`, cobrindo auth e tasks, para confirmar que o spec final publicado bate com a implementacao esperada.
  - [x] Evitar introduzir nesta story novos contratos de negocio; o foco e alinhar documentacao e superficie publica ao que a API ja faz.

## Dev Notes

- O Epic 1 ja documentou os endpoints basicos de auth, mas houve varias iteracoes de contrato ao longo da implementacao; esta story serve para consolidar o resultado final.
- O Epic 2 estabilizou `refresh` e `logout`, entao Swagger precisa refletir o contrato final de body `{\"refreshToken\": \"...\"}` quando aplicavel e os status corretos dos fluxos de sessao.
- O Epic 3 protegeu `tasks` com bearer auth e consolidou `404 Not Found` para recurso fora do ownership; a documentacao publica deve refletir isso sem reabrir a decisao de produto.
- Hoje `TasksController` ja usa `@ApiBearerAuth()` e alguns decorators de resposta, e `AuthController` ja possui anotações principais. O trabalho desta story e revisar lacunas, inconsistencias e contratos publicos restantes. [Source: /home/rodrigordgfs/www/poc/todo-bmad-api/api/src/modules/auth/auth.controller.ts] [Source: /home/rodrigordgfs/www/poc/todo-bmad-api/api/src/modules/tasks/tasks.controller.ts]
- A `4.1` consolidou o shape global de erro e defaults mais estaveis no filtro; Swagger desta story deve seguir o contrato de erro resultante.
- Evitar mudar o comportamento funcional da API aqui; a prioridade e documentacao e coerencia de contratos.
- Esta story deve deixar uma evidencia objetiva de alinhamento do spec publico, nao apenas uma revisao manual de decorators.

### Project Structure Notes

- Concentrar ajustes principalmente em `api/src/modules/auth/auth.controller.ts`, `api/src/modules/tasks/tasks.controller.ts`, eventuais helpers Swagger de auth e `api/src/config/swagger.config.ts`.
- Reaproveitar contracts e DTOs existentes sempre que possivel para evitar duplicacao entre runtime e documentacao.
- Se houver testes de documento OpenAPI, preferir validacoes direcionadas a auth e tasks em vez de snapshot amplo do spec inteiro.

### References

- Story source: [epics.md](/home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/planning-artifacts/epics.md)
- PRD: [prd.md](/home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/planning-artifacts/prd.md)
- Architecture: [architecture.md](/home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/planning-artifacts/architecture.md)
- Sprint tracking: [sprint-status.yaml](/home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/implementation-artifacts/sprint-status.yaml)
- Auth controller: [auth.controller.ts](/home/rodrigordgfs/www/poc/todo-bmad-api/api/src/modules/auth/auth.controller.ts)
- Tasks controller: [tasks.controller.ts](/home/rodrigordgfs/www/poc/todo-bmad-api/api/src/modules/tasks/tasks.controller.ts)
- Swagger config: [swagger.config.ts](/home/rodrigordgfs/www/poc/todo-bmad-api/api/src/config/swagger.config.ts)
- Previous stories:
  - [4-1-adaptar-contrato-global-de-erro-para-autenticacao-e-ownership.md](/home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/implementation-artifacts/4-1-adaptar-contrato-global-de-erro-para-autenticacao-e-ownership.md)
  - [3-2-proteger-rotas-de-tarefas-com-autenticacao-jwt.md](/home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/implementation-artifacts/3-2-proteger-rotas-de-tarefas-com-autenticacao-jwt.md)
  - [3-3-restringir-leitura-e-escrita-de-tarefas-ao-proprio-usuario.md](/home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/implementation-artifacts/3-3-restringir-leitura-e-escrita-de-tarefas-ao-proprio-usuario.md)

## Dev Agent Record

### Agent Model Used

gpt-5

### Debug Log References

- Story criada a partir do PRD, arquitetura, epics e do estado atual da documentacao Swagger de auth e tasks apos os Epics 1 a 4.1.
- `npm run test:e2e -- --runTestsByPath test/app.e2e-spec.ts`
- `npm run build`
- `npm run lint`

### Completion Notes List

- A validacao do `/api/docs-json` foi expandida para conferir componentes, security scheme, request bodies e respostas principais de auth.
- O documento OpenAPI agora e validado objetivamente para a superficie protegida de `tasks`, incluindo bearer auth e respostas `401`/`404` onde aplicavel.
- A story foi fechada reforcando coerencia entre o spec publicado e o runtime, sem alterar comportamento funcional da API.

### File List

- `_bmad-output/implementation-artifacts/4-2-atualizar-swagger-e-contratos-publicos-da-api-autenticada.md`
- `api/test/app.e2e-spec.ts`

### Change Log

- 2026-03-31: Story criada para consolidar Swagger e contratos publicos da API autenticada.
- 2026-03-31: Implementada validacao objetiva do documento OpenAPI gerado para auth e tasks.
