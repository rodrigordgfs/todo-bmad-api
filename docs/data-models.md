# todo-bmad-api - Modelos de Dados

**Data:** 2026-03-31

## Fonte de verdade

O modelo de persistência observado está em [`api/prisma/schema.prisma`](../api/prisma/schema.prisma).

## Enums

### `TaskStatus`

- `OPEN`
- `COMPLETED`

### `TaskPriority`

- `LOW`
- `MEDIUM`
- `HIGH`

## Modelo `Task`

| Campo | Tipo | Regras observadas |
| --- | --- | --- |
| `id` | `String` / UUID | chave primária, `@default(uuid())`, `@db.Uuid` |
| `title` | `String` | obrigatório |
| `description` | `String?` | opcional |
| `dueDate` | `DateTime?` | opcional |
| `priority` | `TaskPriority` | default `MEDIUM` |
| `tags` | `String[]` | default `[]` |
| `status` | `TaskStatus` | default `OPEN` |
| `createdAt` | `DateTime` | default `now()` |
| `updatedAt` | `DateTime` | `@updatedAt` |

## Observações de persistência

- A aplicação usa PostgreSQL como datasource Prisma.
- O client é gerado por `prisma-client-js`.
- O repository traduz o retorno Prisma para enums de domínio locais em TypeScript.
- A camada de serviço converte datas string para `Date` antes da persistência.

## Migrations observadas

- `20260331023730_init_task_schema`
- `20260331024017_align_task_tags_default_and_uuid_native`

As migrations SQL ficam em [`api/prisma/migrations`](../api/prisma/migrations).

## Impacto para futuras extensões

- Novos estados ou prioridades exigem alteração sincronizada em schema Prisma, enums TypeScript, validação e documentação Swagger.
- Qualquer mudança estrutural em `Task` deve refletir no repository, mapper, DTOs e contratos expostos pela API.

---

_Gerado com a skill BMAD `document-project`_
