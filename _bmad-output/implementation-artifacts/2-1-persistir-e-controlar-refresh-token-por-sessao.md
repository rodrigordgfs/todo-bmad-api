# Story 2.1: Persistir e controlar refresh token por sessao

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want persistir refresh tokens em estrutura dedicada,
so that a API possa revogar, renovar e controlar sessoes com seguranca.

## Acceptance Criteria

1. Dada a necessidade de renovacao e revogacao de sessao, quando a persistencia de sessao e implementada, existe uma tabela dedicada de refresh token vinculada ao usuario.
2. Apenas o hash do refresh token e persistido no banco; o valor puro nunca e armazenado.
3. A estrutura suporta invalidacao da sessao anterior quando necessario, em linha com a politica preferencial de uma sessao ativa por usuario.
4. O refresh token emitido inclui um identificador estavel de sessao para lookup futuro da sessao persistida, sem depender de persistencia do token puro.

## Tasks / Subtasks

- [x] Evoluir o modelo de persistencia para sessoes autenticadas (AC: 1, 2, 3)
  - [x] Adicionar entidade `RefreshToken` em `api/prisma/schema.prisma`, vinculada a `User`, seguindo naming e relacionamentos aprovados na arquitetura.
  - [x] Incluir campos minimos para identificacao da sessao, hash do token, expiracao, `revokedAt`, timestamps e referencia ao usuario.
  - [x] Fixar um identificador tecnico de sessao persistida que possa ser refletido no payload do refresh token, como `sessionId`.
  - [x] Criar migration Prisma sem quebrar o fluxo atual de cadastro e login.
- [x] Introduzir a camada de persistencia de refresh token no modulo de autenticacao (AC: 1, 2, 3, 4)
  - [x] Criar repository dedicado em `api/src/modules/auth/repositories/` para criar, buscar, invalidar e substituir sessao.
  - [x] Padronizar o lookup futuro da sessao por identificador estavel de sessao mais verificacao de hash, em vez de tentar consultar pelo token puro.
  - [x] Manter a logica de sessao dentro de `AuthModule`, sem espalhar persistencia de refresh token em `UsersModule` ou `TasksModule`.
  - [x] Preparar API interna coerente com as proximas stories de `refresh` e `logout`.
- [x] Persistir apenas hash do refresh token no fluxo de autenticacao (AC: 2, 4)
  - [x] Reutilizar `PasswordHashService` para gerar hash do refresh token antes da gravacao.
  - [x] Garantir que apenas o token puro retornado ao cliente circule em memoria de curto prazo no service.
  - [x] Incluir no refresh token emitido um identificador de sessao persistida, para permitir lookup e verificacao de hash nas stories seguintes.
  - [x] Proibir explicitamente persistencia do refresh token puro em contratos, logs ou camada Prisma.
- [x] Suportar politica de substituicao de sessao anterior (AC: 3)
  - [x] Ao criar nova sessao para o mesmo usuario, invalidar a sessao anterior com `revokedAt` antes de substituir a sessao ativa.
  - [x] Enforcear uma unica sessao ativa por usuario com regra de persistencia clara, preferencialmente por unicidade do `userId` na sessao ativa ou substituicao atomica equivalente.
  - [x] Manter a implementacao desacoplada o bastante para futura flexibilizacao, caso a politica mude apos o MVP.
  - [x] Deixar claro no service qual e o ponto unico de criacao e revogacao de sessao.
- [x] Alinhar a base atual de login com a persistencia de sessao (AC: 1, 2, 3, 4)
  - [x] Ajustar `AuthService.login` para que a emissao de `refreshToken` fique compativel com a persistencia definitiva desta story.
  - [x] Preservar o contrato HTTP atual do login e nao implementar ainda o endpoint de `refresh`; isso fica para a Story 2.2.
  - [x] Garantir que falhas de persistencia de sessao nao deixem estado inconsistente entre token emitido e sessao salva.
- [x] Cobrir persistencia e substituicao de sessao com testes automatizados (AC: 1, 2, 3, 4)
  - [x] Adicionar testes unitarios de service/repository para criacao de sessao, hash persistido e invalidacao da sessao anterior.
  - [x] Validar que o refresh token emitido contem identificador de sessao utilizavel para lookup futuro.
  - [x] Expandir testes e2e ou de integracao do login para validar que a sessao persistida acompanha a emissao do refresh token.
  - [x] Verificar que o banco nao recebe o refresh token puro em nenhum caminho feliz testado.

## Dev Notes

- Esta story inaugura a fundacao de sessao persistida do Epic 2 e prepara diretamente as Stories 2.2 e 2.3. Ela deve resolver persistencia, hash e substituicao de sessao, mas ainda nao deve expor os endpoints de `refresh` e `logout`. [Source: /home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/planning-artifacts/epics.md#Story-21-Persistir-e-controlar-refresh-token-por-sessao]
- O PRD exige refresh token persistido no banco para permitir renovacao e logout seguro, e define politica preferencial de uma sessao ativa por usuario. [Source: /home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/planning-artifacts/prd.md#Domain-Specific-Requirements] [Source: /home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/planning-artifacts/prd.md#Project-Scoping--Phased-Development]
- A arquitetura ja fixou as decisoes relevantes: `AuthModule` separado, tabela dedicada para `RefreshToken`, persistencia apenas do hash e revogacao de sessao por invalidacao do refresh token salvo. [Source: /home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/planning-artifacts/architecture.md#Core-Architectural-Decisions] [Source: /home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/planning-artifacts/architecture.md#Authentication--Security]
- A implementacao deve seguir os patterns aprovados: naming `RefreshToken`, camelCase em Prisma/TypeScript, logica de sessao no dominio de auth e proibicao de salvar o token puro no banco. [Source: /home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/planning-artifacts/architecture.md#Implementation-Patterns--Consistency-Rules]
- O login atual ja emite `accessToken` e `refreshToken` em [`auth.service.ts`](/home/rodrigordgfs/www/poc/todo-bmad-api/api/src/modules/auth/auth.service.ts), mas ainda nao persiste sessao. Esta story deve fechar essa lacuna sem alterar o contrato publico de `POST /api/v1/auth/login`. [Source: /home/rodrigordgfs/www/poc/todo-bmad-api/api/src/modules/auth/auth.service.ts]
- Para evitar lookup por token puro na Story 2.2, esta story deve estabelecer desde ja um identificador estavel de sessao dentro do refresh token emitido, como `sessionId` ou claim equivalente, e usar esse identificador como ponte para buscar a sessao persistida e verificar o hash. [Source: /home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/planning-artifacts/architecture.md#Communication-Patterns]
- A base atual ja possui `User` e `PasswordHashService`, o que permite reaproveitar infraestrutura existente para hash tambem do refresh token. [Source: /home/rodrigordgfs/www/poc/todo-bmad-api/api/src/modules/users/password-hash.service.ts] [Source: /home/rodrigordgfs/www/poc/todo-bmad-api/api/src/modules/users/users.service.ts]
- O schema Prisma atual ainda nao possui `RefreshToken`, entao a migration desta story precisa ser incremental e segura sobre o banco ja usado pelas stories 1.1 a 1.3. [Source: /home/rodrigordgfs/www/poc/todo-bmad-api/api/prisma/schema.prisma]
- Como a story 1.3 ainda emite refresh token sem persistencia, a implementacao desta story deve eliminar esse descolamento e garantir uma unica fonte de verdade para criacao de sessao. [Source: /home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/implementation-artifacts/1-3-permitir-login-com-emissao-de-credenciais-de-acesso.md]
- Para reduzir retrabalho na migration e no repository, esta story fixa que a invalidacao da sessao anterior deve ser modelada com `revokedAt` e substituicao controlada da sessao ativa, em vez de deixar o mecanismo aberto entre delecao fisica e revogacao logica. Isso deixa caminho mais claro para auditoria e para as stories de `refresh` e `logout`.
- O contrato global de erro deve ser preservado se a persistencia de sessao falhar por conflito ou inconsistencia, mesmo sem criar ainda os endpoints de renovacao e logout. [Source: /home/rodrigordgfs/www/poc/todo-bmad-api/api/src/common/filters/http-exception.filter.ts]

### Project Structure Notes

- Centralizar a evolucao em `api/src/modules/auth/` e `api/prisma/`, mantendo `UsersModule` apenas como fornecedor de identidade e credenciais. [Source: /home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/planning-artifacts/architecture.md#Project-Structure--Boundaries]
- Se for necessario criar repository, contracts ou types para sessao, mantelos proximos ao modulo `auth`, espelhando o padrao modular ja usado em `tasks` e `users`. [Source: /home/rodrigordgfs/www/poc/todo-bmad-api/docs/source-tree-analysis.md#Padrões-de-organizacao]
- Nao antecipar guards JWT, ownership de `Task` ou endpoints de `refresh/logout` nesta story; esses itens pertencem as stories seguintes ou a outros epicos. [Source: /home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/planning-artifacts/epics.md]

### References

- Story source: [epics.md](/home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/planning-artifacts/epics.md)
- PRD: [prd.md](/home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/planning-artifacts/prd.md)
- Architecture: [architecture.md](/home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/planning-artifacts/architecture.md)
- Sprint tracking: [sprint-status.yaml](/home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/implementation-artifacts/sprint-status.yaml)
- Auth service baseline: [auth.service.ts](/home/rodrigordgfs/www/poc/todo-bmad-api/api/src/modules/auth/auth.service.ts)
- User service baseline: [users.service.ts](/home/rodrigordgfs/www/poc/todo-bmad-api/api/src/modules/users/users.service.ts)
- Hash service baseline: [password-hash.service.ts](/home/rodrigordgfs/www/poc/todo-bmad-api/api/src/modules/users/password-hash.service.ts)
- Prisma schema: [schema.prisma](/home/rodrigordgfs/www/poc/todo-bmad-api/api/prisma/schema.prisma)
- Error filter: [http-exception.filter.ts](/home/rodrigordgfs/www/poc/todo-bmad-api/api/src/common/filters/http-exception.filter.ts)

## Dev Agent Record

### Agent Model Used

gpt-5

### Debug Log References

- `npm run prisma:migrate:dev -- --name add-refresh-token-sessions`
- `npm run prisma:generate`
- `npm test -- --runTestsByPath src/modules/auth/auth.service.spec.ts src/modules/auth/auth.login.service.spec.ts src/modules/auth/repositories/refresh-token-sessions.repository.spec.ts`
- `npm run test:e2e -- --runTestsByPath test/app.e2e-spec.ts`
- `npm run build`
- `npm run lint`
- `npm test`

### Completion Notes List

- Adicionado o modelo `RefreshToken` ao Prisma com `userId`, `tokenHash`, `expiresAt`, `revokedAt` e relacao dedicada com `User`.
- Criado `RefreshTokenSessionsRepository` para substituir atomicamente a sessao ativa e revogar a anterior com `revokedAt`.
- Ajustado `AuthService.login` para emitir refresh token com claim `sid`, derivar expiracao do token emitido, gerar hash do refresh token e persistir a sessao antes de retornar a resposta.
- Cobertura expandida com teste unitario do repository, ajustes nos testes de login e cenarios e2e para persistencia da sessao e revogacao da sessao anterior.
- Validacoes executadas com sucesso: migration Prisma, generate, `npm test`, `npm run test:e2e`, `npm run build` e `npm run lint`.

### File List

- `api/prisma/schema.prisma`
- `api/prisma/migrations/20260331192807_add_refresh_token_sessions/migration.sql`
- `api/src/modules/auth/auth.login.service.spec.ts`
- `api/src/modules/auth/auth.module.ts`
- `api/src/modules/auth/auth.service.spec.ts`
- `api/src/modules/auth/auth.service.ts`
- `api/src/modules/auth/repositories/refresh-token-sessions.repository.ts`
- `api/src/modules/auth/repositories/refresh-token-sessions.repository.spec.ts`
- `api/test/app.e2e-spec.ts`
- `_bmad-output/implementation-artifacts/2-1-persistir-e-controlar-refresh-token-por-sessao.md`

### Change Log

- 2026-03-31: Story criada para persistencia e controle de refresh token por sessao.
- 2026-03-31: Implementada persistencia de refresh token com `sid`, hash em banco, revogacao da sessao anterior e cobertura unit/e2e.
