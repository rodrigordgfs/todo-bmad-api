# todo-bmad-api - Arquitetura

**Data:** 2026-03-31  
**Tipo:** backend monolítico

## Resumo arquitetural

A aplicação é uma API NestJS organizada por módulos. O módulo raiz compõe Prisma, usuários, autenticação e tarefas. A configuração global aplica prefixo, versionamento, CORS, Swagger e tratamento uniforme de erros. O desenho atual suporta identidade, sessão e ownership de tarefas sem fugir do padrão modular simples do projeto.

## Diagrama mental da aplicação

```text
HTTP Request
  -> Guard / Pipes
  -> AuthController | TasksController
  -> AuthService | TasksService | UsersService
  -> Repositories / PrismaService
  -> PostgreSQL
  -> Mappers / Contracts
  -> HTTP Response
```

## Estrutura por camadas

### Bootstrap e composição

- [`api/src/main.ts`](../api/src/main.ts) sobe o `AppModule`
- [`api/src/config/app.config.ts`](../api/src/config/app.config.ts) centraliza prefixo, versionamento, CORS, Swagger e filtro global
- [`api/src/app.module.ts`](../api/src/app.module.ts) importa `PrismaModule`, `UsersModule`, `AuthModule` e `TasksModule`

### Borda HTTP

- [`api/src/modules/auth/auth.controller.ts`](../api/src/modules/auth/auth.controller.ts) expõe `register`, `login`, `refresh` e `logout`
- [`api/src/modules/tasks/tasks.controller.ts`](../api/src/modules/tasks/tasks.controller.ts) expõe a superfície autenticada de tarefas
- validação usa `ZodValidationPipe`
- autenticação de tarefas usa [`jwt-auth.guard.ts`](../api/src/modules/auth/guards/jwt-auth.guard.ts)

### Aplicação e domínio

- [`AuthService`](../api/src/modules/auth/auth.service.ts) concentra credenciais, emissão e rotação de tokens, revogação e ponte brownfield de adoção de tarefas legadas
- [`UsersService`](../api/src/modules/users/users.service.ts) concentra identidade e acesso seguro ao usuário
- [`TasksService`](../api/src/modules/tasks/tasks.service.ts) concentra CRUD, busca, filtro, ordenação e ownership por `userId`

### Persistência

- [`TasksRepository`](../api/src/modules/tasks/repositories/tasks.repository.ts) faz queries Prisma de tarefas sempre escopadas por `userId`
- [`RefreshTokenSessionsRepository`](../api/src/modules/auth/repositories/refresh-token-sessions.repository.ts) controla persistência de sessão e rotação de refresh token
- [`PrismaService`](../api/src/infra/database/prisma/prisma.service.ts) fornece o cliente de banco

### Contratos e transformação

- DTOs, contracts e schemas vivem próximos às features
- Swagger é anotado nos controllers e DTOs auxiliares
- o contrato global de erro fica em [`api/src/shared/contracts`](../api/src/shared/contracts)

## Módulos principais

### `AuthModule`

Responsável por:

- cadastro
- login
- refresh
- logout
- guard JWT
- decorators de usuário autenticado

### `UsersModule`

Responsável por:

- persistência e lookup de usuários
- hash seguro de senha
- retorno público sem vazamento de `passwordHash`

### `TasksModule`

Responsável por:

- CRUD autenticado
- mudança explícita de status
- busca textual
- filtro por status
- ordenação determinística
- ownership por `userId`

### `PrismaModule`

Responsável por expor o `PrismaService` para o restante da aplicação.

## Configuração global observada

- prefixo global: `/api`
- versionamento por URI: `/v1`
- CORS: origem configurável por `FRONTEND_ORIGIN`
- Swagger UI: `/api/docs`
- Swagger JSON: `/api/docs-json`
- filtro global de erro: `HttpExceptionFilter`

## Persistência e modelo de dados

O schema Prisma atual tem:

- `User`
- `Task`
- `RefreshToken`
- enums `TaskStatus` e `TaskPriority`

Pontos relevantes:

- `Task.userId` é obrigatório
- `User.email` é único
- refresh token é persistido apenas como hash
- existe política de uma sessão ativa por usuário

## Estratégia de testes

- unitários próximos ao código em `src/`
- testes específicos para filtro global e serviços de auth/tasks
- e2e em [`api/test/app.e2e-spec.ts`](../api/test/app.e2e-spec.ts) cobrindo runtime autenticado, Swagger e ownership

## Restrições e decisões importantes

- ownership por recurso em `tasks` usa `404 Not Found`
- `INVALID_ACCESS_TOKEN`, `INVALID_REFRESH_TOKEN`, `INVALID_CREDENTIALS` e `EMAIL_ALREADY_EXISTS` são códigos estáveis importantes
- parte da ordenação final continua em memória no `TasksService`
- existe uma ponte brownfield para adoção de tarefas legadas no primeiro login de usuário real
