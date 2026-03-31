# todo-bmad-api - Inventário de Componentes

**Data:** 2026-03-31

## Componentes centrais

### `AppModule`

- **Local:** [`api/src/app.module.ts`](../api/src/app.module.ts)
- **Papel:** composição raiz da aplicação
- **Responsabilidade:** registrar módulos de infraestrutura e domínio

### `configureApp`

- **Local:** [`api/src/config/app.config.ts`](../api/src/config/app.config.ts)
- **Papel:** bootstrap transversal
- **Responsabilidade:** prefixo global, versionamento, CORS, Swagger e filtro global de exceções

### `PrismaService`

- **Local:** [`api/src/infra/database/prisma/prisma.service.ts`](../api/src/infra/database/prisma/prisma.service.ts)
- **Papel:** gateway de banco
- **Responsabilidade:** inicializar `PrismaClient`, conectar via adapter PostgreSQL e encerrar conexões no shutdown

## Feature `tasks`

### `TasksController`

- **Local:** [`api/src/modules/tasks/tasks.controller.ts`](../api/src/modules/tasks/tasks.controller.ts)
- **Responsabilidade:** expor endpoints REST, aplicar validação de entrada e declarar contratos Swagger
- **Dependências principais:** `TasksService`, `ZodValidationPipe`, `ParseUUIDPipe`

### `TasksService`

- **Local:** [`api/src/modules/tasks/tasks.service.ts`](../api/src/modules/tasks/tasks.service.ts)
- **Responsabilidade:** regras de aplicação e domínio de tarefas
- **Comportamentos observados:** criação, leitura, atualização, exclusão, transição de estado, busca textual e ordenação determinística

### `TasksRepository`

- **Local:** [`api/src/modules/tasks/repositories/tasks.repository.ts`](../api/src/modules/tasks/repositories/tasks.repository.ts)
- **Responsabilidade:** operações Prisma sobre `task`
- **Observação:** usa `updateManyAndReturn` para atualizar registros e detectar ausência de resultado

### `TaskMapper`

- **Local:** [`api/src/modules/tasks/mappers/task.mapper.ts`](../api/src/modules/tasks/mappers/task.mapper.ts)
- **Responsabilidade:** transformar persistência em contrato HTTP

## Validação e contratos

### `ZodValidationPipe`

- **Local:** [`api/src/common/pipes/zod-validation.pipe.ts`](../api/src/common/pipes/zod-validation.pipe.ts)
- **Responsabilidade:** validar payloads e query params a partir de schemas Zod

### `HttpExceptionFilter`

- **Local:** [`api/src/common/filters/http-exception.filter.ts`](../api/src/common/filters/http-exception.filter.ts)
- **Responsabilidade:** padronizar respostas de erro HTTP e inesperadas

### Schemas e DTOs de `tasks`

- **Local:** [`api/src/modules/tasks/schemas`](../api/src/modules/tasks/schemas) e [`api/src/modules/tasks/dto`](../api/src/modules/tasks/dto)
- **Responsabilidade:** separar forma externa dos dados das regras de validação

## Componentes auxiliares

### Contratos compartilhados de erro

- **Local:** [`api/src/shared/contracts`](../api/src/shared/contracts)
- **Responsabilidade:** centralizar formato de erro reaproveitável em documentação e implementação

### `FoundationController`

- **Local:** [`api/src/modules/foundation/foundation.controller.ts`](../api/src/modules/foundation/foundation.controller.ts)
- **Responsabilidade:** endpoints auxiliares para validar infraestrutura e tratamento de erros
- **Status observado:** não importado pelo módulo raiz atual

## Inventário de testes

- Testes de serviço: [`api/src/modules/tasks/tasks.service.spec.ts`](../api/src/modules/tasks/tasks.service.spec.ts), [`api/src/modules/tasks/tasks.service.read.spec.ts`](../api/src/modules/tasks/tasks.service.read.spec.ts), [`api/src/modules/tasks/tasks.service.write.spec.ts`](../api/src/modules/tasks/tasks.service.write.spec.ts)
- Testes de mapper: [`api/src/modules/tasks/mappers/task.mapper.spec.ts`](../api/src/modules/tasks/mappers/task.mapper.spec.ts)
- Testes compartilhados: [`api/src/common/filters/http-exception.filter.spec.ts`](../api/src/common/filters/http-exception.filter.spec.ts), [`api/src/common/pipes/zod-validation.pipe.spec.ts`](../api/src/common/pipes/zod-validation.pipe.spec.ts)
- Teste e2e: [`api/test/app.e2e-spec.ts`](../api/test/app.e2e-spec.ts)

---

_Gerado com a skill BMAD `document-project`_
