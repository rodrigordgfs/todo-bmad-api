# todo-bmad-api - Inventário de Componentes

**Data:** 2026-03-31

## Componentes centrais

### `AppModule`

- **Local:** [`api/src/app.module.ts`](../api/src/app.module.ts)
- **Papel:** composição raiz da aplicação
- **Responsabilidade:** registrar Prisma, usuários, auth e tarefas

### `configureApp`

- **Local:** [`api/src/config/app.config.ts`](../api/src/config/app.config.ts)
- **Papel:** bootstrap transversal
- **Responsabilidade:** prefixo global, versionamento, CORS, Swagger e filtro global de exceções

### `PrismaService`

- **Local:** [`api/src/infra/database/prisma/prisma.service.ts`](../api/src/infra/database/prisma/prisma.service.ts)
- **Papel:** gateway de banco
- **Responsabilidade:** inicializar `PrismaClient` e exigir `DATABASE_URL` no boot

## Feature `auth`

### `AuthController`

- **Local:** [`api/src/modules/auth/auth.controller.ts`](../api/src/modules/auth/auth.controller.ts)
- **Responsabilidade:** expor `register`, `login`, `refresh` e `logout`

### `AuthService`

- **Local:** [`api/src/modules/auth/auth.service.ts`](../api/src/modules/auth/auth.service.ts)
- **Responsabilidade:** cadastro, autenticação, emissão/rotação de tokens, revogação de sessão e adoção brownfield de tarefas legadas

### `JwtAuthGuard`

- **Local:** [`api/src/modules/auth/guards/jwt-auth.guard.ts`](../api/src/modules/auth/guards/jwt-auth.guard.ts)
- **Responsabilidade:** validar bearer token e injetar identidade autenticada no request

### `RefreshTokenSessionsRepository`

- **Local:** [`api/src/modules/auth/repositories/refresh-token-sessions.repository.ts`](../api/src/modules/auth/repositories/refresh-token-sessions.repository.ts)
- **Responsabilidade:** persistir, rotacionar e revogar sessões de refresh token

## Feature `users`

### `UsersService`

- **Local:** [`api/src/modules/users/users.service.ts`](../api/src/modules/users/users.service.ts)
- **Responsabilidade:** lookup de usuários, criação segura e API pública sem `passwordHash`

### `UsersRepository`

- **Local:** [`api/src/modules/users/repositories/users.repository.ts`](../api/src/modules/users/repositories/users.repository.ts)
- **Responsabilidade:** operações Prisma sobre `user`

### `PasswordHashService`

- **Local:** [`api/src/modules/users/password-hash.service.ts`](../api/src/modules/users/password-hash.service.ts)
- **Responsabilidade:** hash e verificação de senha/refresh token com Argon2

## Feature `tasks`

### `TasksController`

- **Local:** [`api/src/modules/tasks/tasks.controller.ts`](../api/src/modules/tasks/tasks.controller.ts)
- **Responsabilidade:** expor endpoints protegidos de tarefas e declarar contratos Swagger

### `TasksService`

- **Local:** [`api/src/modules/tasks/tasks.service.ts`](../api/src/modules/tasks/tasks.service.ts)
- **Responsabilidade:** CRUD, ownership por `userId`, busca, filtro e ordenação

### `TasksRepository`

- **Local:** [`api/src/modules/tasks/repositories/tasks.repository.ts`](../api/src/modules/tasks/repositories/tasks.repository.ts)
- **Responsabilidade:** operações Prisma sobre `task` sempre escopadas por `userId`

### `TaskMapper`

- **Local:** [`api/src/modules/tasks/mappers/task.mapper.ts`](../api/src/modules/tasks/mappers/task.mapper.ts)
- **Responsabilidade:** transformar persistência em contrato HTTP

## Componentes transversais

### `ZodValidationPipe`

- **Local:** [`api/src/common/pipes/zod-validation.pipe.ts`](../api/src/common/pipes/zod-validation.pipe.ts)
- **Responsabilidade:** validar payloads e query params com Zod

### `HttpExceptionFilter`

- **Local:** [`api/src/common/filters/http-exception.filter.ts`](../api/src/common/filters/http-exception.filter.ts)
- **Responsabilidade:** padronizar respostas de erro HTTP e inesperadas

### Contratos compartilhados de erro

- **Local:** [`api/src/shared/contracts`](../api/src/shared/contracts)
- **Responsabilidade:** centralizar shape de erro para runtime e Swagger
