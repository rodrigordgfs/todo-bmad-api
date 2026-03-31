# Story 2.3: Encerrar sessao com logout seguro

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a usuario autenticado,
I want encerrar minha sessao explicitamente,
so that minhas credenciais de renovacao deixem de ser validas.

## Acceptance Criteria

1. Dada uma sessao autenticada existente, quando `POST /api/v1/auth/logout` e chamado com body JSON no formato `{"refreshToken": "..."}`, a API invalida o refresh token persistido.
2. Apos o logout, nova renovacao daquela sessao e impedida.
3. O endpoint responde com `200 OK` e payload JSON minimo e consistente no formato `{"success": true}` quando o logout e concluido com sucesso.
4. Quando a sessao nao puder ser validada, o logout falha de forma segura com `401 Unauthorized` e erro padronizado, sem comportamento idempotente de sucesso.

## Tasks / Subtasks

- [x] Expor a borda HTTP de logout (AC: 1, 3, 4)
  - [x] Criar `POST /api/v1/auth/logout` em `AuthController`, mantendo `/api/v1`, JSON e padrao Swagger atual.
  - [x] Definir DTO/schema Zod para receber o refresh token explicitamente no body JSON como `{"refreshToken": "..."}`.
  - [x] Documentar no Swagger sucesso como `200 OK` com `{"success": true}` e falha com `401 Unauthorized`.
- [x] Validar a sessao a partir do refresh token apresentado (AC: 1, 4)
  - [x] Verificar assinatura e expiracao do JWT com `JWT_REFRESH_SECRET`.
  - [x] Extrair `sid` e demais claims relevantes do refresh token.
  - [x] Validar que existe sessao persistida compativel, ativa e coerente com o hash salvo.
- [x] Invalidar a sessao de forma segura (AC: 1, 2)
  - [x] Revogar a sessao persistida correspondente ao refresh token apresentado.
  - [x] Garantir que o refresh token usado no logout nao possa mais ser reutilizado em `POST /api/v1/auth/refresh`.
  - [x] Reaproveitar a mesma infraestrutura de sessao usada por login e refresh, evitando fluxo paralelo.
- [x] Preservar consistencia e seguranca do contrato (AC: 3, 4)
  - [x] Responder com contrato enxuto e previsivel `{"success": true}`, sem retornar tokens nem dados sensiveis.
  - [x] Usar `401 Unauthorized` com erro padronizado para token invalido, sessao inexistente, revogada ou expirada.
  - [x] Evitar vazamento de detalhes sobre assinatura, persistencia ou estado interno da sessao.
- [x] Cobrir logout e reuso indevido com testes automatizados (AC: 1, 2, 3, 4)
  - [x] Adicionar testes unitarios para logout valido, token invalido e sessao ja revogada/expirada.
  - [x] Adicionar testes e2e para `POST /api/v1/auth/logout` cobrindo sucesso e falhas.
  - [x] Verificar em teste que um refresh token usado no logout nao consegue mais renovar sessao.

## Dev Notes

- Esta story fecha o Epic 2 reaproveitando a base entregue nas stories 2.1 e 2.2: `sid` no refresh token, sessao persistida, hash salvo, rotacao segura e bloqueio de reuso. [Source: /home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/implementation-artifacts/2-1-persistir-e-controlar-refresh-token-por-sessao.md] [Source: /home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/implementation-artifacts/2-2-renovar-sessao-autenticada-com-refresh-token.md]
- O epic define que logout deve invalidar o refresh token persistido, impedir nova renovacao daquela sessao e responder de forma consistente. [Source: /home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/planning-artifacts/epics.md#Story-23-Encerrar-sessao-com-logout-seguro]
- O PRD exige revogacao segura de sessao e retorno previsivel ao login quando o refresh falhar. Logout e parte central desse controle. [Source: /home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/planning-artifacts/prd.md#User-Journeys] [Source: /home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/planning-artifacts/prd.md#Technical-Success]
- A arquitetura ja consolidou autenticacao em `AuthModule`, persistencia de refresh token em tabela dedicada e invalidacao de sessao como concern do dominio de auth. [Source: /home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/planning-artifacts/architecture.md#Authentication--Security]
- O `AuthService` atual ja possui os fluxos de login e refresh em [`auth.service.ts`](/home/rodrigordgfs/www/poc/todo-bmad-api/api/src/modules/auth/auth.service.ts), e o repository de sessoes ja conhece sessao ativa, revogacao e rotacao. Esta story deve estender essa infraestrutura, nao substitui-la. [Source: /home/rodrigordgfs/www/poc/todo-bmad-api/api/src/modules/auth/auth.service.ts] [Source: /home/rodrigordgfs/www/poc/todo-bmad-api/api/src/modules/auth/repositories/refresh-token-sessions.repository.ts]
- Para evitar ambiguidade de integracao, esta story fixa que `POST /api/v1/auth/logout` recebe body JSON no formato `{"refreshToken": "..."}` e responde com `200 OK` e payload `{"success": true}` em caso de sucesso.
- O contrato global de erro continua passando por [`http-exception.filter.ts`](/home/rodrigordgfs/www/poc/todo-bmad-api/api/src/common/filters/http-exception.filter.ts). Quando a sessao nao puder ser validada, o logout deve falhar com seguranca e formato previsivel, explicitamente `401 Unauthorized` com `code` estavel, sem tratar logout invalido como sucesso idempotente.

### Project Structure Notes

- Concentrar a implementacao em `api/src/modules/auth/`, incluindo controller, service, DTO/schema, Swagger e repository de sessoes.
- Nao mover a invalidacao de sessao para `UsersModule` ou `TasksModule`.
- Se a revogacao exigir helper novo no repository, mantelo junto do repositório de sessao ja existente.

### References

- Story source: [epics.md](/home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/planning-artifacts/epics.md)
- Previous stories: [2-1-persistir-e-controlar-refresh-token-por-sessao.md](/home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/implementation-artifacts/2-1-persistir-e-controlar-refresh-token-por-sessao.md), [2-2-renovar-sessao-autenticada-com-refresh-token.md](/home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/implementation-artifacts/2-2-renovar-sessao-autenticada-com-refresh-token.md)
- PRD: [prd.md](/home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/planning-artifacts/prd.md)
- Architecture: [architecture.md](/home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/planning-artifacts/architecture.md)
- Sprint tracking: [sprint-status.yaml](/home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/implementation-artifacts/sprint-status.yaml)
- Auth service baseline: [auth.service.ts](/home/rodrigordgfs/www/poc/todo-bmad-api/api/src/modules/auth/auth.service.ts)
- Auth controller baseline: [auth.controller.ts](/home/rodrigordgfs/www/poc/todo-bmad-api/api/src/modules/auth/auth.controller.ts)
- Session repository baseline: [refresh-token-sessions.repository.ts](/home/rodrigordgfs/www/poc/todo-bmad-api/api/src/modules/auth/repositories/refresh-token-sessions.repository.ts)
- Error filter: [http-exception.filter.ts](/home/rodrigordgfs/www/poc/todo-bmad-api/api/src/common/filters/http-exception.filter.ts)

## Dev Agent Record

### Agent Model Used

gpt-5

### Debug Log References

- Story criada a partir de PRD, arquitetura, epics e implementacao concluida das Stories 2.1 e 2.2.
- `npm test -- --runTestsByPath src/modules/auth/auth.logout.service.spec.ts src/modules/auth/auth.refresh.service.spec.ts src/modules/auth/repositories/refresh-token-sessions.repository.spec.ts src/modules/auth/auth.service.spec.ts`
- `npm run test:e2e -- --runTestsByPath test/app.e2e-spec.ts`
- `npm run build`
- `npm run lint`

### Completion Notes List

- Logout seguro implementado em `POST /api/v1/auth/logout` com body JSON `{"refreshToken": "..."}`.
- A revogacao reutiliza a infraestrutura de sessoes persistidas, incluindo lock por usuario e verificacao do hash salvo.
- O refresh token usado no logout passa a falhar em `POST /api/v1/auth/refresh` com `401 INVALID_REFRESH_TOKEN`.

### File List

- `_bmad-output/implementation-artifacts/2-3-encerrar-sessao-com-logout-seguro.md`
- `api/src/modules/auth/auth.controller.ts`
- `api/src/modules/auth/auth.service.ts`
- `api/src/modules/auth/dto/auth.swagger.ts`
- `api/src/modules/auth/dto/logout.dto.ts`
- `api/src/modules/auth/schemas/logout.schema.ts`
- `api/src/modules/auth/contracts/logout-response.contract.ts`
- `api/src/modules/auth/repositories/refresh-token-sessions.repository.ts`
- `api/src/modules/auth/auth.logout.service.spec.ts`
- `api/src/modules/auth/auth.refresh.service.spec.ts`
- `api/src/modules/auth/auth.service.spec.ts`
- `api/src/modules/auth/repositories/refresh-token-sessions.repository.spec.ts`
- `api/test/app.e2e-spec.ts`

### Change Log

- 2026-03-31: Story criada para logout seguro com invalidacao de refresh token persistido.
- 2026-03-31: Implementado `POST /api/v1/auth/logout` com revogacao segura da sessao persistida e cobertura automatizada.
