# todo-bmad-api - Contratos de API

**Data:** 2026-03-31
**Base URL observada:** `/api/v1`

## Convenções globais

- Prefixo global: `/api`
- Versão padrão: `v1`
- Documentação Swagger UI: `/api/docs`
- JSON OpenAPI: `/api/docs-json`
- Erros padronizados por filtro global

## Endpoints da feature `tasks`

### `GET /api/v1/tasks`

Lista tarefas do MVP.

**Query params observados:**

- `status`: `all | open | completed` (opcional)
- `search`: `string` (opcional)

**Comportamento:**

- filtra por estado quando `status` é informado
- aplica busca textual case-insensitive em `title`, `description` e `tags`
- ordena por prioridade, prazo, criação e id

### `GET /api/v1/tasks/:id`

Consulta uma tarefa por UUID.

**Validação:**

- `id` inválido retorna erro de validação padronizado
- `id` inexistente retorna `NOT_FOUND`

### `POST /api/v1/tasks`

Cria uma nova tarefa.

**Payload funcional esperado:**

- `title`: obrigatório
- `description`: opcional
- `dueDate`: opcional
- `priority`: opcional
- `tags`: opcional

**Comportamento:**

- `status` nasce como `OPEN`
- `priority` assume `MEDIUM` quando omitida

### `PATCH /api/v1/tasks/:id`

Atualiza campos editáveis da tarefa.

**Campos observados:**

- `title`
- `description`
- `dueDate`
- `priority`
- `tags`

**Comportamento:**

- suporta limpar `description` e `dueDate`
- retorna `NOT_FOUND` quando o id não existe

### `PATCH /api/v1/tasks/:id/status`

Conclui ou reabre tarefa por endpoint explícito de estado.

**Payload funcional esperado:**

- `status`: `OPEN | COMPLETED`

### `DELETE /api/v1/tasks/:id`

Exclui a tarefa.

**Status esperado:** `204 No Content`

## Endpoint auxiliar

### `POST /api/v1/foundation/validation`

Valida payload com campo `title` não vazio.

### `GET /api/v1/foundation/error`

Lança erro inesperado para validar o filtro global.

Observação: o controller de foundation existe no código, mas precisa estar importado no módulo raiz para fazer parte da superfície HTTP ativa.

## Formato de erro

O projeto usa um contrato de erro compartilhado. Pelo código do controller e do filtro global, os erros seguem a estrutura conceitual:

```json
{
  "code": "VALIDATION_ERROR | NOT_FOUND | INTERNAL_SERVER_ERROR",
  "message": "Mensagem legível",
  "details": []
}
```

## Fontes principais

- [`api/src/modules/tasks/tasks.controller.ts`](../api/src/modules/tasks/tasks.controller.ts)
- [`api/src/modules/tasks/tasks.service.ts`](../api/src/modules/tasks/tasks.service.ts)
- [`api/src/modules/foundation/foundation.controller.ts`](../api/src/modules/foundation/foundation.controller.ts)
- [`api/src/config/app.config.ts`](../api/src/config/app.config.ts)

---

_Gerado com a skill BMAD `document-project`_
