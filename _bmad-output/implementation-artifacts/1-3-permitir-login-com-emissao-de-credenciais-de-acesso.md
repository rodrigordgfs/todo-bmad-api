# Story 1.3: Permitir login com emissao de credenciais de acesso

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a usuario do app,
I want fazer login com email e senha,
so that eu possa iniciar uma sessao autenticada na aplicacao.

## Acceptance Criteria

1. Dado um usuario ja cadastrado com credenciais validas, quando `POST /api/v1/auth/login` e chamado, a API autentica o usuario.
2. A API emite `accessToken` e `refreshToken` em payload JSON consistente.
3. Credenciais incorretas sao rejeitadas com `401 Unauthorized` e erro padronizado.
4. O fluxo nao expoe senha, hash ou detalhes internos sensiveis na resposta.

## Tasks / Subtasks

- [ ] Expor a borda HTTP de login no modulo de autenticacao (AC: 1, 2, 3, 4)
  - [ ] Criar `POST /api/v1/auth/login` em `auth.controller.ts` seguindo o mesmo padrao versionado e documentado usado nas rotas atuais.
  - [ ] Definir `LoginDto`, schema Zod e contratos Swagger em `api/src/modules/auth/`.
  - [ ] Integrar o endpoint ao `AuthModule` sem misturar responsabilidades com `TasksModule`.
- [ ] Implementar autenticacao por `email + senha` (AC: 1, 3, 4)
  - [ ] Buscar usuario por email via `UsersService` ou repository equivalente.
  - [ ] Verificar senha usando o encapsulamento de `argon2` introduzido na Story 1.1.
  - [ ] Rejeitar credenciais invalidas com erro consistente e sem indicar se a falha foi no email ou na senha.
- [ ] Emitir credenciais de acesso para sessao autenticada (AC: 2, 4)
  - [ ] Definir formato de resposta com pelo menos `accessToken` e `refreshToken` em camelCase.
  - [ ] Gerar access token JWT para autenticacao das rotas protegidas futuras.
  - [ ] Gerar refresh token ja de forma compativel com a futura persistencia dedicada do Epic 2, sem criar formato temporario ou paralelo.
  - [ ] Se a emissao de `refreshToken` exigir persistencia para manter coerencia com a arquitetura, implementar essa persistencia de forma compativel com a futura tabela `RefreshToken`, sem criar fluxo descartavel.
- [ ] Preservar consistencia de contratos e erros da API (AC: 2, 3, 4)
  - [ ] Manter o uso do `HttpExceptionFilter` e do contrato de erro existente.
  - [ ] Padronizar respostas de credenciais invalidas como `401 Unauthorized`, com `code` explicito como `INVALID_CREDENTIALS`, e falhas de validacao no envelope atual.
  - [ ] Garantir que a resposta de sucesso nao inclua `passwordHash` nem metadados sensiveis do usuario.
- [ ] Cobrir o fluxo de login com testes automatizados (AC: 1, 2, 3, 4)
  - [ ] Adicionar testes unitarios para autenticacao bem-sucedida e rejeicao de credenciais incorretas.
  - [ ] Adicionar teste e2e para `POST /api/v1/auth/login` cobrindo sucesso, validacao e falha de autenticacao.
  - [ ] Validar no teste que o contrato de resposta contem apenas os campos esperados e nao vaza segredo interno.

## Dev Notes

- Esta story depende diretamente da Story 1.1 para identidade/persistencia segura e da Story 1.2 para o endpoint de cadastro e a base do `AuthModule`. O fluxo de login pressupoe que ja exista usuario persistido com `passwordHash`. [Source: /home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/planning-artifacts/epics.md#Story-11-Modelar-identidade-do-usuario-e-credenciais-seguras] [Source: /home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/planning-artifacts/epics.md#Story-12-Permitir-cadastro-de-conta-com-email-e-senha]
- O PRD define login com `email + senha`, JWT para `accessToken`, refresh token para continuidade de sessao e respostas em JSON sob `/api/v1`. [Source: /home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/planning-artifacts/prd.md#API-Backend-Specific-Requirements]
- A arquitetura aprovada exige `AuthModule` separado de `UsersModule`, autenticacao baseada em JWT bearer, hash de senha com `argon2` e refresh token preparado para renovacao de sessao. [Source: /home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/planning-artifacts/architecture.md#Core-Architectural-Decisions] [Source: /home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/planning-artifacts/architecture.md#Authentication--Security]
- O documento de arquitetura separa a persistencia e o controle rigoroso do refresh token no Epic 2. Portanto, esta story deve emitir as credenciais de acesso e deixar um seam limpo para a persistencia dedicada de sessao em `2.1`, sem acoplar login a uma implementacao improvisada dificil de evoluir. Se a politica de refresh token exigir persistencia imediata para o login funcionar corretamente, a implementacao deve ser feita de forma compatível com a futura tabela `RefreshToken`. [Source: /home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/planning-artifacts/architecture.md#Data-Architecture] [Source: /home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/planning-artifacts/architecture.md#Decision-Impact-Analysis]
- Esta story nao deve inventar um modelo temporario de refresh token diferente do que sera consolidado no Epic 2. Se o login precisar persistir refresh token desde ja para respeitar a arquitetura, isso deve ser feito como primeira fatia da solucao definitiva, nao como workaround. [Source: /home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/planning-artifacts/prd.md#Authentication-Model] [Source: /home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/planning-artifacts/architecture.md#Data-Architecture]
- O contrato global de erro atual usa `statusCode`, `code`, `message` e `details`; credenciais invalidas devem seguir o mesmo envelope. [Source: /home/rodrigordgfs/www/poc/todo-bmad-api/api/src/common/filters/http-exception.filter.ts]
- Como a story fixa falha de autenticacao como `401 Unauthorized`, a implementacao deve explicitar esse status e um `code` estavel como `INVALID_CREDENTIALS`, sem depender apenas dos defaults do filtro global. [Source: /home/rodrigordgfs/www/poc/todo-bmad-api/api/src/common/filters/http-exception.filter.ts]
- O padrao de controller atual usa Zod na borda, decorators Swagger e rotas versionadas em `v1`. O login deve espelhar esse formato, como referencia de estilo ja existente em `TasksController`. [Source: /home/rodrigordgfs/www/poc/todo-bmad-api/api/src/modules/tasks/tasks.controller.ts]
- O stack atual ainda nao possui dependencias de JWT/Passport no [`package.json`](/home/rodrigordgfs/www/poc/todo-bmad-api/api/package.json). Esta story provavelmente precisara introduzir as dependencias minimas para emissao de tokens, mas ainda nao precisa proteger rotas de `tasks`; isso fica para a Story 3.2. [Source: /home/rodrigordgfs/www/poc/todo-bmad-api/api/package.json] [Source: /home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/planning-artifacts/epics.md#Story-32-Proteger-rotas-de-tarefas-com-autenticacao-JWT]
- Nao antecipar regras de ownership de tarefas nem logout/refresh completos nesta story. O escopo aqui e autenticar e emitir credenciais, preservando compatibilidade estrutural para os proximos epicos. [Source: /home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/planning-artifacts/prd.md#Project-Scoping--Phased-Development]

### Project Structure Notes

- Implementar em `api/src/modules/auth/` com DTOs, schemas, contracts, service e controller agrupados por modulo, seguindo o mesmo desenho ja usado em `api/src/modules/tasks/`. [Source: /home/rodrigordgfs/www/poc/todo-bmad-api/docs/source-tree-analysis.md#Diretórios-críticos]
- Continuar usando `UsersModule` como fronteira de identidade e `PrismaModule` como infraestrutura global de persistencia. [Source: /home/rodrigordgfs/www/poc/todo-bmad-api/api/src/app.module.ts] [Source: /home/rodrigordgfs/www/poc/todo-bmad-api/api/src/infra/database/prisma/prisma.module.ts]
- Seguir as conventions aprovadas para naming: `LoginDto`, `auth.controller.ts`, `auth.service.ts`, `accessToken`, `refreshToken`, `passwordHash` e JSON em camelCase. [Source: /home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/planning-artifacts/architecture.md#Implementation-Patterns--Consistency-Rules]

### References

- Story source: [epics.md](/home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/planning-artifacts/epics.md)
- PRD: [prd.md](/home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/planning-artifacts/prd.md)
- Architecture: [architecture.md](/home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/planning-artifacts/architecture.md)
- Root module: [app.module.ts](/home/rodrigordgfs/www/poc/todo-bmad-api/api/src/app.module.ts)
- Prisma module: [prisma.module.ts](/home/rodrigordgfs/www/poc/todo-bmad-api/api/src/infra/database/prisma/prisma.module.ts)
- Error filter: [http-exception.filter.ts](/home/rodrigordgfs/www/poc/todo-bmad-api/api/src/common/filters/http-exception.filter.ts)
- Pattern reference: [tasks.controller.ts](/home/rodrigordgfs/www/poc/todo-bmad-api/api/src/modules/tasks/tasks.controller.ts)
- Package dependencies: [package.json](/home/rodrigordgfs/www/poc/todo-bmad-api/api/package.json)

## Dev Agent Record

### Agent Model Used

gpt-5

### Debug Log References

### Completion Notes List

### File List
