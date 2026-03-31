# Story 3.2: Proteger rotas de tarefas com autenticacao JWT

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a usuario autenticado,
I want acessar rotas de tarefas apenas com sessao valida,
so that o sistema proteja meus dados contra acesso nao autenticado.

## Acceptance Criteria

1. Todas as rotas de `tasks` exigem access token JWT valido.
2. Requisicoes sem token, com token invalido ou token expirado sao rejeitadas com `401 Unauthorized` e erro padronizado estavel.
3. O contexto autenticado do usuario fica disponivel para a camada de aplicacao e substitui o owner interno provisório introduzido na Story 3.1 em todas as operacoes de `tasks`.

## Tasks / Subtasks

- [x] Introduzir a infraestrutura JWT para protecao de rotas de tarefas (AC: 1, 2, 3)
  - [x] Criar strategy/guard JWT no dominio de autenticacao, reaproveitando `JwtModule` e secrets ja usados em login/refresh.
  - [x] Validar access token com `JWT_ACCESS_SECRET`, sem depender de refresh token nas rotas de `tasks`.
  - [x] Definir o shape minimo do usuario autenticado disponivel no request/contexto da aplicacao.
- [x] Proteger a borda HTTP de `tasks` com autenticacao (AC: 1, 2)
  - [x] Aplicar guard JWT em todas as rotas do `TasksController`.
  - [x] Garantir resposta consistente com `401 Unauthorized` e `code` estavel, como `INVALID_ACCESS_TOKEN`, para ausencia de bearer token, token malformado, token invalido e token expirado.
  - [x] Preservar validacao Zod, pipes existentes e semantica HTTP atual das rotas protegidas.
- [x] Expor o usuario autenticado para a camada de aplicacao (AC: 3)
  - [x] Criar decorator/helper para recuperar o usuario autenticado no controller ou service boundary.
  - [x] Adaptar `TasksService` para receber o `userId` vindo do contexto autenticado, substituindo o owner interno fixo da Story 3.1 em todas as operacoes de `tasks`.
  - [x] Manter nesta story a passagem completa do contexto autenticado por todas as operacoes apenas como escopo tecnico obrigatorio; a regra final de ownership em leitura/escrita e seus cenarios de recurso alheio continuam sendo consolidados na Story 3.3.
- [x] Alinhar documentacao e contrato publico das rotas protegidas (AC: 1, 2)
  - [x] Atualizar Swagger de `tasks` para refletir autenticacao bearer obrigatoria.
  - [x] Documentar `401 Unauthorized` nas rotas de tarefas protegidas.
  - [x] Evitar inventar novos envelopes de erro fora do contrato global existente.
- [x] Cobrir autenticacao JWT nas rotas de tarefas com testes automatizados (AC: 1, 2, 3)
  - [x] Adicionar testes unitarios ou de integracao para guard/strategy/decorator de usuario atual.
  - [x] Expandir e2e para garantir que `tasks` falha sem token e funciona com token valido.
  - [x] Cobrir que o contexto autenticado chega ate a camada de aplicacao com `userId` utilizavel.

## Dev Notes

- Esta story entra logo apos a `3.1`, que ja estruturou `Task.userId` e ownership interno provisório. Agora o objetivo e trocar a ponte interna pelo contexto autenticado real nas rotas de `tasks`. [Source: /home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/implementation-artifacts/3-1-associar-tarefas-a-usuario-proprietario.md]
- O epic fixa que todas as rotas de `tasks` devem exigir autenticacao valida e disponibilizar o usuario autenticado para a aplicacao. [Source: /home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/planning-artifacts/epics.md#Story-32-Proteger-rotas-de-tarefas-com-autenticacao-JWT]
- A arquitetura aprovada centraliza autenticacao em `AuthModule`, com guard JWT, bearer token e ownership reforcado depois no dominio de tarefas. [Source: /home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/planning-artifacts/architecture.md#Authentication--Security] [Source: /home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/planning-artifacts/architecture.md#Communication-Patterns]
- O `AuthService` atual ja emite access token JWT com claims de `sub`, `email` e `type: 'access'`, o que deve ser reaproveitado por esta story para montar a strategy de validacao do bearer token. [Source: /home/rodrigordgfs/www/poc/todo-bmad-api/api/src/modules/auth/auth.service.ts]
- O `TasksController` hoje ainda esta totalmente publico. Esta story deve proteger a borda sem ainda decidir todos os comportamentos de ownership de negocio para recursos alheios; isso fica para a `3.3`. [Source: /home/rodrigordgfs/www/poc/todo-bmad-api/api/src/modules/tasks/tasks.controller.ts]
- A `3.1` introduziu um owner interno fixo apenas como ponte de transicao. Esta story fixa que esse caminho deve ser substituido pelo `userId` do contexto autenticado em todas as operacoes de `tasks`, e nao apenas parcialmente. [Source: /home/rodrigordgfs/www/poc/todo-bmad-api/api/src/modules/tasks/tasks.service.ts]
- Nao introduzir aqui refresh/logout ou controle de sessao novo; esses fluxos ja foram resolvidos no Epic 2.
- Tambem nao fechar ainda a semantica de leitura/escrita apenas das tarefas do proprio usuario em cada operacao de negocio; esta story so garante autenticacao e passagem do contexto. A blindagem final por ownership pertence a `3.3`.
- Para evitar divergencia com os fluxos ja existentes de auth, esta story fixa `401 Unauthorized` com `code` estavel para falhas de bearer token nas rotas de `tasks`. O nome do code pode seguir o padrao `INVALID_ACCESS_TOKEN`, desde que seja consistente entre guard, Swagger e testes.
- Esta story tambem fixa que o guard ou helper de autenticacao nao deve depender apenas dos defaults do `HttpExceptionFilter`; ele deve lancar `UnauthorizedException` com payload explicito contendo `code`, `message` e `details`, para garantir que o cliente nao receba um `HTTP_ERROR` generico.

### Project Structure Notes

- Concentrar strategy, guard e decorator de autenticacao em `api/src/modules/auth/` e/ou `api/src/common/` conforme o padrao do projeto, sem espalhar validacao JWT dentro de `TasksService`.
- `TasksController` deve consumir o contexto autenticado e repassa-lo para a camada de aplicacao.
- Swagger de `tasks` deve refletir bearer auth obrigatorio apos esta story.

### References

- Story source: [epics.md](/home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/planning-artifacts/epics.md)
- PRD: [prd.md](/home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/planning-artifacts/prd.md)
- Architecture: [architecture.md](/home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/planning-artifacts/architecture.md)
- Sprint tracking: [sprint-status.yaml](/home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/implementation-artifacts/sprint-status.yaml)
- Previous story: [3-1-associar-tarefas-a-usuario-proprietario.md](/home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/implementation-artifacts/3-1-associar-tarefas-a-usuario-proprietario.md)
- Auth module atual: [auth.module.ts](/home/rodrigordgfs/www/poc/todo-bmad-api/api/src/modules/auth/auth.module.ts)
- Tasks controller atual: [tasks.controller.ts](/home/rodrigordgfs/www/poc/todo-bmad-api/api/src/modules/tasks/tasks.controller.ts)

## Dev Agent Record

### Agent Model Used

gpt-5

### Debug Log References

- `npm run build`
- `npm run lint`
- `npm test`
- `npm run test:e2e -- --runTestsByPath test/app.e2e-spec.ts`

### Completion Notes List

- Guard JWT explicito adicionado em `AuthModule`, com payload normalizado de `UnauthorizedException` para `INVALID_ACCESS_TOKEN`.
- `TasksController` agora exige bearer token em todas as rotas e injeta o usuario autenticado via decorator dedicado.
- `TasksService` deixou de usar o owner interno provisório da Story 3.1 e passou a receber `userId` real em todas as operacoes.
- Swagger passou a declarar bearer auth para `tasks`, e a suite e2e agora cobre falhas sem token/token invalido e sucesso autenticado.

### File List

- `_bmad-output/implementation-artifacts/3-2-proteger-rotas-de-tarefas-com-autenticacao-jwt.md`
- `api/src/config/swagger.config.ts`
- `api/src/modules/auth/auth.module.ts`
- `api/src/modules/auth/decorators/current-user.decorator.ts`
- `api/src/modules/auth/guards/jwt-auth.guard.ts`
- `api/src/modules/auth/types/authenticated-user.type.ts`
- `api/src/modules/tasks/tasks.controller.ts`
- `api/src/modules/tasks/tasks.module.ts`
- `api/src/modules/tasks/tasks.service.ts`
- `api/src/modules/tasks/tasks.service.spec.ts`
- `api/src/modules/tasks/tasks.service.read.spec.ts`
- `api/src/modules/tasks/tasks.service.write.spec.ts`
- `api/test/app.e2e-spec.ts`

### Change Log

- 2026-03-31: Story criada para proteger rotas de tarefas com access token JWT e contexto autenticado de usuario.
- 2026-03-31: Story ajustada para exigir substituicao completa do owner interno e fixar `401` com code estavel para falhas de access token.
- 2026-03-31: Story ajustada para separar escopo tecnico autenticado de ownership final de negocio e explicitar que o guard deve emitir payload normalizado de `UnauthorizedException`.
- 2026-03-31: Implementacao concluida com guard JWT, decorator de usuario atual, `TasksController` protegido, substituicao do owner interno no `TasksService` e cobertura e2e para bearer token invalido/ausente.
