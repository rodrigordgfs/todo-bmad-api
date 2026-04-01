# todo-bmad-api - Modelos de Dados

**Data:** 2026-03-31

## Fonte de verdade

O modelo de persistência está em [`api/prisma/schema.prisma`](../api/prisma/schema.prisma).

## Enums

### `TaskStatus`

- `OPEN`
- `COMPLETED`

### `TaskPriority`

- `LOW`
- `MEDIUM`
- `HIGH`

## Modelo `User`

| Campo | Tipo | Regras observadas |
| --- | --- | --- |
| `id` | `String` / UUID | chave primária |
| `email` | `String` | único |
| `passwordHash` | `String` | obrigatório, nunca exposto na API pública |
| `createdAt` | `DateTime` | default `now()` |
| `updatedAt` | `DateTime` | `@updatedAt` |

Relacionamentos:

- `tasks`
- `refreshTokens`

## Modelo `Task`

| Campo | Tipo | Regras observadas |
| --- | --- | --- |
| `id` | `String` / UUID | chave primária |
| `userId` | `String` / UUID | obrigatório |
| `title` | `String` | obrigatório |
| `description` | `String?` | opcional |
| `dueDate` | `DateTime?` | opcional |
| `priority` | `TaskPriority` | default `MEDIUM` |
| `tags` | `String[]` | default `[]` |
| `status` | `TaskStatus` | default `OPEN` |
| `createdAt` | `DateTime` | default `now()` |
| `updatedAt` | `DateTime` | `@updatedAt` |

Relacionamentos:

- pertence a `User`

Índices:

- `@@index([userId, status])`

## Modelo `RefreshToken`

| Campo | Tipo | Regras observadas |
| --- | --- | --- |
| `id` | `String` / UUID | funciona como `sessionId` persistido |
| `userId` | `String` / UUID | obrigatório |
| `tokenHash` | `String` | obrigatório |
| `expiresAt` | `DateTime` | obrigatório |
| `revokedAt` | `DateTime?` | nulo enquanto a sessão estiver ativa |
| `createdAt` | `DateTime` | default `now()` |
| `updatedAt` | `DateTime` | `@updatedAt` |

Relacionamentos:

- pertence a `User`

Índices:

- `@@index([userId, revokedAt])`

## Observações de persistência

- a aplicação usa PostgreSQL via Prisma
- senha do usuário é protegida com Argon2 antes da persistência
- refresh token é armazenado só como hash
- consultas de tarefa em runtime são escopadas por `userId`
- existe migração brownfield para ownership de tarefas legadas

## Impacto para futuras extensões

- novos campos de sessão exigem sincronismo entre schema, auth service e repository
- qualquer mudança em `Task` precisa refletir em repository, service, mapper, DTOs e Swagger
- qualquer mudança em `User` que afete login precisa refletir em auth, users e testes
