# Story 2.2: Renovar sessao autenticada com refresh token

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a usuario autenticado,
I want renovar minha sessao sem repetir login,
so that eu continue usando o app sem interrupcoes desnecessarias.

## Acceptance Criteria

1. Dado um refresh token valido associado a uma sessao ativa, quando `POST /api/v1/auth/refresh` e chamado com body JSON no formato `{"refreshToken": "..."}`, a API valida a sessao e emite novas credenciais conforme a politica definida.
2. Refresh token invalido, expirado ou revogado e rejeitado com erro padronizado.
3. O fluxo de renovacao mantem comportamento previsivel para o cliente, incluindo rotacao de sessao e renovacao coerente do `sid` persistido.
4. A resposta de sucesso do refresh reutiliza exatamente o contrato `LoginResponseContract`, com `accessToken` e `refreshToken`.

## Tasks / Subtasks

- [x] Expor a borda HTTP de renovacao de sessao (AC: 1, 2, 3, 4)
  - [x] Criar `POST /api/v1/auth/refresh` em `AuthController`, mantendo `/api/v1`, JSON e padrao Swagger do modulo atual.
  - [x] Definir DTO/schema Zod para receber o refresh token explicitamente no body JSON como `{"refreshToken": "..."}`.
  - [x] Documentar a resposta de sucesso reutilizando o mesmo contrato Swagger de login, com `accessToken` e `refreshToken`.
  - [x] Documentar respostas de falha, incluindo erro padronizado para refresh invalido.
- [x] Validar refresh token com sessao persistida (AC: 1, 2)
  - [x] Verificar assinatura e expiracao do JWT com `JWT_REFRESH_SECRET`.
  - [x] Extrair o identificador estavel de sessao do token, usando o `sid` introduzido na Story 2.1.
  - [x] Buscar a sessao persistida por `sid` e rejeitar quando ela nao existir, estiver revogada ou expirada.
  - [x] Verificar o hash do refresh token recebido contra o `tokenHash` persistido.
- [x] Rotacionar credenciais durante a renovacao (AC: 1, 3, 4)
  - [x] Emitir novo `accessToken` e novo `refreshToken` quando a sessao for valida.
  - [x] Reutilizar o contrato `LoginResponseContract` como payload de sucesso da renovacao.
  - [x] Rotacionar a sessao persistida para que o refresh antigo deixe de ser reutilizavel.
  - [x] Garantir que o novo refresh token preserve o modelo de sessao ativa unica por usuario.
- [x] Preservar consistencia e seguranca no fluxo de refresh (AC: 2, 3)
  - [x] Tratar refresh revogado, expirado, token adulterado ou `sid` ausente como erro previsivel e seguro.
  - [x] Nao aceitar refresh token cujo JWT seja valido, mas cuja sessao persistida esteja revogada ou divergente do hash salvo.
  - [x] Manter o contrato global de erro, sem vazar detalhes internos de assinatura, persistencia ou estrutura de sessao.
- [x] Preparar a continuidade para logout seguro (AC: 1, 2, 3)
  - [x] Reutilizar a mesma infraestrutura de sessao para que a Story 2.3 possa invalidar o refresh token persistido sem duplicar logica.
  - [x] Evitar criar atalhos no `refresh` que tornem `logout` um caso especial fora do repositório de sessoes.
- [x] Cobrir renovacao e falhas com testes automatizados (AC: 1, 2, 3)
  - [x] Adicionar testes unitarios do service para refresh valido, sessao revogada, sessao expirada e hash divergente.
  - [x] Adicionar testes e2e para `POST /api/v1/auth/refresh` cobrindo sucesso, refresh invalido, refresh expirado/revogado e rotacao da sessao.
  - [x] Verificar em teste que o refresh token antigo deixa de ser aceito apos a rotacao.

## Dev Notes

- Esta story depende diretamente da fundacao entregue na Story 2.1: `RefreshToken` persistido, `sid` no JWT, hash salvo no banco e politica de uma sessao ativa por usuario. [Source: /home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/implementation-artifacts/2-1-persistir-e-controlar-refresh-token-por-sessao.md]
- O EPIC define que o refresh deve validar sessao ativa, emitir novas credenciais e rejeitar tokens invalidos, expirados ou revogados. [Source: /home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/planning-artifacts/epics.md#Story-22-Renovar-sessao-autenticada-com-refresh-token]
- O PRD exige renovacao automatica com refresh token, retorno ao login quando refresh falhar e persistencia no banco para permitir revogacao segura. [Source: /home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/planning-artifacts/prd.md#User-Journeys] [Source: /home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/planning-artifacts/prd.md#Technical-Success]
- A arquitetura ja fixou que a renovacao deve usar refresh token persistido, manter a logica em `AuthModule`, nunca depender de token puro no banco e tratar sessao como concern de auth. [Source: /home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/planning-artifacts/architecture.md#Authentication--Security] [Source: /home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/planning-artifacts/architecture.md#Communication-Patterns]
- O login atual em [`auth.service.ts`](/home/rodrigordgfs/www/poc/todo-bmad-api/api/src/modules/auth/auth.service.ts) ja gera `sid` e persiste a sessao. Esta story deve reaproveitar essa mesma infraestrutura para rotacionar sessao, nao criar um fluxo paralelo. [Source: /home/rodrigordgfs/www/poc/todo-bmad-api/api/src/modules/auth/auth.service.ts]
- O repositório de sessoes atual ainda oferece `findById` bruto, entao esta story deve consolidar os criterios de validade da sessao em um unico ponto: `sid` existente, `revokedAt` nulo, expiracao valida e hash conferido. [Source: /home/rodrigordgfs/www/poc/todo-bmad-api/api/src/modules/auth/repositories/refresh-token-sessions.repository.ts]
- O contrato de erro atual passa por [`http-exception.filter.ts`](/home/rodrigordgfs/www/poc/todo-bmad-api/api/src/common/filters/http-exception.filter.ts). Para refresh invalido, a API deve responder em formato consistente, preferencialmente com `401 Unauthorized` e `code` estavel.
- Para evitar ambiguidade de integracao, esta story fixa que `POST /api/v1/auth/refresh` recebe body JSON no formato `{"refreshToken": "..."}` e responde com o mesmo contrato da autenticacao inicial, isto e, `LoginResponseContract` com `accessToken` e `refreshToken`. [Source: /home/rodrigordgfs/www/poc/todo-bmad-api/api/src/modules/auth/contracts/login-response.contract.ts]
- Como o refresh envolve rotacao, os testes precisam garantir que o token antigo deixe de servir logo apos o sucesso do novo refresh. Isso e central para a seguranca desta story.

### Project Structure Notes

- Concentrar a implementacao em `api/src/modules/auth/`, incluindo controller, service, DTO/schema, Swagger e repository de sessoes. [Source: /home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/planning-artifacts/architecture.md#Project-Structure--Boundaries]
- Nao mover logica de sessao para `UsersModule` ou `TasksModule`.
- Se surgir helper de claims ou parser de token, mantelo proximo ao modulo `auth` e alinhado ao padrao atual do projeto.

### References

- Story source: [epics.md](/home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/planning-artifacts/epics.md)
- Previous story: [2-1-persistir-e-controlar-refresh-token-por-sessao.md](/home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/implementation-artifacts/2-1-persistir-e-controlar-refresh-token-por-sessao.md)
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

- `npm test -- --runTestsByPath src/modules/auth/auth.service.spec.ts src/modules/auth/auth.login.service.spec.ts src/modules/auth/auth.refresh.service.spec.ts src/modules/auth/repositories/refresh-token-sessions.repository.spec.ts`
- `npm run test:e2e -- --runTestsByPath test/app.e2e-spec.ts`
- `npm test`
- `npm run build`
- `npm run lint`

### Completion Notes List

- Adicionado `POST /api/v1/auth/refresh` com body JSON `{"refreshToken": "..."}`, validacao Zod e Swagger alinhado ao contrato de login.
- Implementado fluxo de renovacao com verificacao de assinatura JWT, leitura de `sid`, busca de sessao ativa por `sid` + `userId`, validacao de hash e rejeicao de refresh invalido, expirado ou revogado.
- A renovacao agora reutiliza `LoginResponseContract`, emite novo `accessToken` e novo `refreshToken` e rotaciona a sessao persistida para invalidar o token anterior.
- Cobertura expandida com testes unitarios do service/repository e cenarios e2e para sucesso, reutilizacao de token antigo, token invalido e sessao expirada.
- Validacoes executadas com sucesso: `npm test`, `npm run test:e2e -- --runTestsByPath test/app.e2e-spec.ts`, `npm run build` e `npm run lint`.

### File List

- `api/src/modules/auth/auth.controller.ts`
- `api/src/modules/auth/auth.refresh.service.spec.ts`
- `api/src/modules/auth/auth.service.ts`
- `api/src/modules/auth/dto/auth.swagger.ts`
- `api/src/modules/auth/dto/refresh.dto.ts`
- `api/src/modules/auth/repositories/refresh-token-sessions.repository.spec.ts`
- `api/src/modules/auth/repositories/refresh-token-sessions.repository.ts`
- `api/src/modules/auth/schemas/refresh.schema.ts`
- `api/test/app.e2e-spec.ts`
- `_bmad-output/implementation-artifacts/2-2-renovar-sessao-autenticada-com-refresh-token.md`

### Change Log

- 2026-03-31: Story criada para renovacao de sessao autenticada com refresh token.
- 2026-03-31: Implementado refresh com `sid`, validacao de hash/sessao ativa, rotacao de credenciais e cobertura unit/e2e.
