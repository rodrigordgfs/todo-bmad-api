# todo-bmad-api - Contratos de API

**Data:** 2026-03-31  
**Base URL:** `/api/v1`

## Convenções globais

- prefixo global: `/api`
- versão padrão: `v1`
- Swagger UI: `/api/docs`
- OpenAPI JSON: `/api/docs-json`
- erros padronizados pelo filtro global
- endpoints de `tasks` protegidos por bearer token

## Auth

### `POST /api/v1/auth/register`

Cria uma conta com email e senha.

**Request body**

- `email`
- `password`

**Success**

- `201 Created`
- retorna dados seguros do usuário criado
- não retorna tokens

**Erros relevantes**

- `400 VALIDATION_ERROR`
- `409 EMAIL_ALREADY_EXISTS`

### `POST /api/v1/auth/login`

Autentica usuário com email e senha.

**Request body**

- `email`
- `password`

**Success**

- `200 OK`
- retorna:
  - `accessToken`
  - `refreshToken`

**Erros relevantes**

- `400 VALIDATION_ERROR`
- `401 INVALID_CREDENTIALS`

### `POST /api/v1/auth/refresh`

Renova a sessão autenticada.

**Request body**

- `refreshToken`

**Success**

- `200 OK`
- reutiliza o mesmo contrato de sucesso do login:
  - `accessToken`
  - `refreshToken`

**Erros relevantes**

- `400 VALIDATION_ERROR`
- `401 INVALID_REFRESH_TOKEN`

### `POST /api/v1/auth/logout`

Encerra sessão com revogação do refresh token persistido.

**Request body**

- `refreshToken`

**Success**

- `200 OK`
- retorna:
  - `success: true`

**Erros relevantes**

- `400 VALIDATION_ERROR`
- `401 INVALID_REFRESH_TOKEN`

## Tasks

Todos os endpoints abaixo exigem `Authorization: Bearer <accessToken>`.

### `GET /api/v1/tasks`

Lista tarefas do usuário autenticado.

**Query params**

- `status`: `all | open | completed` (opcional)
- `search`: `string` (opcional)

**Comportamento**

- filtra por status dentro do conjunto do próprio usuário
- aplica busca textual case-insensitive em `title`, `description` e `tags`
- ordena por prioridade, prazo, criação e id
- não mistura tarefas de outros usuários

**Erros relevantes**

- `401 INVALID_ACCESS_TOKEN`

### `GET /api/v1/tasks/:id`

Consulta uma tarefa do usuário autenticado por UUID.

**Comportamento**

- `id` inválido retorna erro de validação
- tarefa inexistente ou fora do ownership retorna `404 NOT_FOUND`

**Erros relevantes**

- `400 VALIDATION_ERROR`
- `401 INVALID_ACCESS_TOKEN`
- `404 NOT_FOUND`

### `POST /api/v1/tasks`

Cria uma nova tarefa para o usuário autenticado.

**Payload**

- `title`: obrigatório
- `description`: opcional
- `dueDate`: opcional
- `priority`: opcional
- `tags`: opcional

**Comportamento**

- `status` nasce como `OPEN`
- `priority` assume `MEDIUM` quando omitida
- `userId` vem do contexto autenticado, não do payload

**Erros relevantes**

- `400 VALIDATION_ERROR`
- `401 INVALID_ACCESS_TOKEN`

### `PATCH /api/v1/tasks/:id`

Atualiza campos editáveis da tarefa do usuário autenticado.

**Campos observados**

- `title`
- `description`
- `dueDate`
- `priority`
- `tags`

**Comportamento**

- suporta limpar `description` e `dueDate`
- tarefa inexistente ou fora do ownership retorna `404 NOT_FOUND`

**Erros relevantes**

- `400 VALIDATION_ERROR`
- `401 INVALID_ACCESS_TOKEN`
- `404 NOT_FOUND`

### `PATCH /api/v1/tasks/:id/status`

Conclui ou reabre tarefa por endpoint explícito de estado.

**Payload**

- `status`: `OPEN | COMPLETED`

**Comportamento**

- opera apenas sobre tarefa própria
- tarefa inexistente ou fora do ownership retorna `404 NOT_FOUND`

**Erros relevantes**

- `400 VALIDATION_ERROR`
- `401 INVALID_ACCESS_TOKEN`
- `404 NOT_FOUND`

### `DELETE /api/v1/tasks/:id`

Exclui a tarefa do usuário autenticado.

**Success**

- `204 No Content`

**Comportamento**

- tarefa inexistente ou fora do ownership retorna `404 NOT_FOUND`

**Erros relevantes**

- `400 VALIDATION_ERROR`
- `401 INVALID_ACCESS_TOKEN`
- `404 NOT_FOUND`

## Formato de erro

Shape público:

```json
{
  "statusCode": 401,
  "code": "INVALID_ACCESS_TOKEN",
  "message": "Invalid access token",
  "details": []
}
```

## Fontes principais

- [`api/src/modules/auth/auth.controller.ts`](../api/src/modules/auth/auth.controller.ts)
- [`api/src/modules/tasks/tasks.controller.ts`](../api/src/modules/tasks/tasks.controller.ts)
- [`api/src/common/filters/http-exception.filter.ts`](../api/src/common/filters/http-exception.filter.ts)
