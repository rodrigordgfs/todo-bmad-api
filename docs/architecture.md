# todo-bmad-api - Arquitetura

**Data:** 2026-03-31
**Tipo:** backend monolítico

## Resumo arquitetural

A aplicação é uma API NestJS organizada por módulos. O módulo raiz importa a infraestrutura Prisma e o módulo de tarefas, enquanto a configuração global aplica prefixo, versionamento, CORS, Swagger e tratamento uniforme de erros. O desenho favorece simplicidade operacional e baixo acoplamento para um MVP de backend.

## Diagrama mental da aplicação

```text
HTTP Request
  -> TasksController
  -> ZodValidationPipe / ParseUUIDPipe
  -> TasksService
  -> TasksRepository
  -> PrismaService
  -> PostgreSQL
  -> TaskMapper
  -> HTTP Response
```

## Estrutura por camadas

### Bootstrap e composição

- [`api/src/main.ts`](../api/src/main.ts) instancia o `AppModule` e delega a configuração global para [`api/src/config/app.config.ts`](../api/src/config/app.config.ts).
- [`api/src/app.module.ts`](../api/src/app.module.ts) importa `PrismaModule` e `TasksModule`.

### Borda HTTP

- [`api/src/modules/tasks/tasks.controller.ts`](../api/src/modules/tasks/tasks.controller.ts) declara os endpoints versionados da feature.
- O controller usa `ZodValidationPipe` e `ParseUUIDPipe` customizado para padronizar erros de validação.
- Swagger é anotado diretamente no controller e nos DTOs auxiliares.

### Aplicação e regras de domínio

- [`api/src/modules/tasks/tasks.service.ts`](../api/src/modules/tasks/tasks.service.ts) concentra o comportamento do domínio de tarefas.
- A ordenação final da listagem é aplicada em memória por prioridade, prazo, criação e id.
- A busca textual também é aplicada na camada de serviço, usando normalização case-insensitive.

### Persistência

- [`api/src/modules/tasks/repositories/tasks.repository.ts`](../api/src/modules/tasks/repositories/tasks.repository.ts) traduz operações de domínio em consultas Prisma.
- [`api/src/infra/database/prisma/prisma.service.ts`](../api/src/infra/database/prisma/prisma.service.ts) cria o cliente com `PrismaPg` e exige `DATABASE_URL` no boot.

### Contratos e transformação

- `contracts/`, `dto/` e `schemas/` definem os limites públicos e as regras de entrada.
- `mappers/` transformam o tipo persistido para o contrato exposto.
- `shared/contracts/` concentra o contrato padronizado de erro.

## Módulos principais

### `TasksModule`

Feature principal da aplicação. Reúne:

- endpoints REST de tarefas
- regras de CRUD e mudança de status
- filtros e busca
- mapeamento de entidades persistidas para contratos

### `PrismaModule`

Módulo técnico responsável por expor o `PrismaService` para o restante da aplicação.

### `FoundationModule`

Há um controller de fundação em [`api/src/modules/foundation/foundation.controller.ts`](../api/src/modules/foundation/foundation.controller.ts) usado para validar pipe/erro e comportamento básico de infraestrutura. Ele não aparece no `AppModule` atual, então não faz parte da superfície principal exposta enquanto permanecer sem importação.

## Configuração global observada

- Prefixo global: `/api`
- Versionamento por URI: `/v1`
- CORS: origem configurável por `FRONTEND_ORIGIN`
- Swagger UI: `/api/docs`
- Swagger JSON: `/api/docs-json`
- Filtro global de erro: `HttpExceptionFilter`

## Persistência e modelo de dados

O banco usa PostgreSQL e Prisma com schema pequeno:

- entidade `Task`
- enums `TaskStatus` e `TaskPriority`
- migrations SQL versionadas em `api/prisma/migrations`

Isso sugere uma base pronta para evoluir sem camadas extras de complexidade, desde que novas features mantenham o mesmo padrão modular.

## Estratégia de testes

- Testes unitários próximos ao código em `src/`
- Testes de filtro e pipe compartilhados em `common/`
- Teste e2e em `api/test/app.e2e-spec.ts`

## Restrições e decisões implícitas

- A busca textual e a ordenação final não estão delegadas integralmente ao banco; parte do comportamento está na camada de serviço.
- O projeto depende de banco real para e2e.
- O contrato de erro é parte importante da API pública e deve ser preservado em futuras extensões.

---

_Gerado com a skill BMAD `document-project`_
