# Story 4.1: Adaptar contrato global de erro para autenticacao e ownership

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want estender o contrato global de erro para auth e autorizacao,
so that o cliente receba respostas previsiveis em todos os cenarios novos.

## Acceptance Criteria

1. A API retorna erros consistentes para credenciais invalidas, acesso nao autenticado, sessao invalida e acesso negado por ownership.
2. O formato global atual de erro e preservado em todos os cenarios novos.
3. Detalhes internos sensiveis nao sao expostos nas respostas de erro.

## Tasks / Subtasks

- [x] Consolidar o contrato global de erro para auth e ownership (AC: 1, 2)
  - [x] Revisar `HttpExceptionFilter` para garantir que cenarios de `401`, `404` e `409` preservam o mesmo shape global de erro, sem reabrir `403` para ownership de tarefa.
  - [x] Mapear explicitamente os codigos ja consolidados pela aplicacao, como `EMAIL_ALREADY_EXISTS`, `INVALID_CREDENTIALS`, `INVALID_REFRESH_TOKEN`, `INVALID_ACCESS_TOKEN` e `NOT_FOUND`.
  - [x] Garantir que erros de bearer invalido, refresh invalido e ownership de tarefa nao dependam acidentalmente de defaults genericos como `HTTP_ERROR`.
  - [x] Fixar a estrategia desta story para status sem `code` explicito: o filtro global deve fornecer defaults estaveis ao menos para `401` e `409`, em vez de deixar esses casos cairem em `HTTP_ERROR`.
- [x] Evitar exposicao de detalhes internos sensiveis (AC: 2, 3)
  - [x] Verificar que falhas de JWT, sessao, Prisma e validacao nao vazam stack trace, segredo, hash, claims ou detalhes internos do banco.
  - [x] Preservar apenas `statusCode`, `code`, `message` e `details` no contrato publico, mantendo `details` vazio quando nao houver informacao segura para expor.
- [x] Expandir cobertura automatizada para o contrato de erro autenticado (AC: 1, 2, 3)
  - [x] Adicionar testes unitarios e/ou e2e cobrindo pelo menos um exemplo representativo de credenciais invalidas, access token invalido, refresh token invalido, conflito de email e ownership com `404`.
  - [x] Validar que todos esses cenarios seguem o mesmo shape global de resposta.
  - [x] Validar que mensagens e `code` permanecem estaveis nos fluxos ja entregues dos Epics 1 a 3.

## Dev Notes

- O filtro global atual ja normaliza excecoes para `statusCode`, `code`, `message` e `details`, mas seus defaults ainda sao genericos para varios status, inclusive retornando `HTTP_ERROR` fora de `400`, `404` e `5xx`. [Source: /home/rodrigordgfs/www/poc/todo-bmad-api/api/src/common/filters/http-exception.filter.ts]
- Os Epics 1 e 2 introduziram codigos estaveis em auth, como `EMAIL_ALREADY_EXISTS`, `INVALID_CREDENTIALS`, `INVALID_REFRESH_TOKEN` e contratos `401` consistentes para login, refresh e logout.
- O Epic 3 consolidou `404 Not Found` para recurso fora do ownership em `tasks`, entao esta story deve preservar essa semantica sem reabrir a decisao de produto. [Source: /home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/implementation-artifacts/3-3-restringir-leitura-e-escrita-de-tarefas-ao-proprio-usuario.md]
- O objetivo aqui nao e criar novos fluxos funcionais, e sim endurecer o contrato transversal de erro para que auth e ownership fiquem previsiveis no filtro global, nos guards e nos controllers.
- Ownership por recurso continua sendo `404 Not Found`; esta story nao deve introduzir `403` para esse caso.
- Para reduzir ambiguidade de implementacao, esta story assume que o filtro global deve passar a ter defaults estaveis para `401` e `409`, evitando `HTTP_ERROR` quando excecoes desses status chegarem sem `code` explicito.
- Evitar mudar contratos de sucesso nesta story; o foco e padronizacao de erro.

### Project Structure Notes

- Manter o filtro global centralizado em `api/src/common/filters/http-exception.filter.ts`.
- Ajustes localizados em guards, services ou controllers sao aceitaveis quando forem necessarios para garantir o `code` e a `message` corretos, mas o shape final deve continuar centralizado no filtro global.
- Preferir concentrar a validacao dessa story em testes de contrato e nao em reescrita dos fluxos de negocio ja entregues.

### References

- Story source: [epics.md](/home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/planning-artifacts/epics.md)
- PRD: [prd.md](/home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/planning-artifacts/prd.md)
- Architecture: [architecture.md](/home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/planning-artifacts/architecture.md)
- Sprint tracking: [sprint-status.yaml](/home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/implementation-artifacts/sprint-status.yaml)
- Error filter atual: [http-exception.filter.ts](/home/rodrigordgfs/www/poc/todo-bmad-api/api/src/common/filters/http-exception.filter.ts)
- Auth controller: [auth.controller.ts](/home/rodrigordgfs/www/poc/todo-bmad-api/api/src/modules/auth/auth.controller.ts)
- JWT guard: [jwt-auth.guard.ts](/home/rodrigordgfs/www/poc/todo-bmad-api/api/src/modules/auth/guards/jwt-auth.guard.ts)
- Previous stories:
  - [1-2-permitir-cadastro-de-conta-com-email-e-senha.md](/home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/implementation-artifacts/1-2-permitir-cadastro-de-conta-com-email-e-senha.md)
  - [1-3-permitir-login-com-emissao-de-credenciais-de-acesso.md](/home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/implementation-artifacts/1-3-permitir-login-com-emissao-de-credenciais-de-acesso.md)
  - [2-2-renovar-sessao-autenticada-com-refresh-token.md](/home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/implementation-artifacts/2-2-renovar-sessao-autenticada-com-refresh-token.md)
  - [2-3-encerrar-sessao-com-logout-seguro.md](/home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/implementation-artifacts/2-3-encerrar-sessao-com-logout-seguro.md)
  - [3-2-proteger-rotas-de-tarefas-com-autenticacao-jwt.md](/home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/implementation-artifacts/3-2-proteger-rotas-de-tarefas-com-autenticacao-jwt.md)
  - [3-3-restringir-leitura-e-escrita-de-tarefas-ao-proprio-usuario.md](/home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/implementation-artifacts/3-3-restringir-leitura-e-escrita-de-tarefas-ao-proprio-usuario.md)

## Dev Agent Record

### Agent Model Used

gpt-5

### Debug Log References

- Story criada a partir do PRD, arquitetura, epics e do estado atual do filtro global de erro apos os Epics 1, 2 e 3.
- `npm test -- --runTestsByPath src/common/filters/http-exception.filter.spec.ts`
- `npm run test:e2e -- --runTestsByPath test/app.e2e-spec.ts`
- `npm run build`
- `npm run lint`

### Completion Notes List

- O filtro global passou a fornecer defaults estaveis para `401` (`UNAUTHORIZED`) e `409` (`CONFLICT`) quando excecoes chegarem sem `code` explicito.
- Os contratos ja consolidados de auth e ownership permaneceram intactos, sem reabrir `404` para recurso fora do ownership.
- A cobertura do filtro foi expandida com testes unitarios especificos para defaults de `401` e `409`, enquanto os e2e existentes continuaram validando os codigos estaveis dos fluxos entregues.

### File List

- `_bmad-output/implementation-artifacts/4-1-adaptar-contrato-global-de-erro-para-autenticacao-e-ownership.md`
- `api/src/common/filters/http-exception.filter.ts`
- `api/src/common/filters/http-exception.filter.spec.ts`

### Change Log

- 2026-03-31: Story criada para consolidar contrato global de erro para autenticacao, sessao e ownership.
- 2026-03-31: Story ajustada para preservar `404` em ownership e travar defaults estaveis de erro para `401` e `409`.
- 2026-03-31: Implementados defaults estaveis no filtro global para `401` e `409`, com cobertura automatizada do contrato de erro.
