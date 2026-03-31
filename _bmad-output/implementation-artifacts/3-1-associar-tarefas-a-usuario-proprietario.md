# Story 3.1: Associar tarefas a usuario proprietario

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want vincular cada tarefa a um usuario,
so that o dominio de tarefas passe a respeitar propriedade explicita.

## Acceptance Criteria

1. Cada registro de `Task` possui vinculo obrigatorio com um `User` por meio de `userId`.
2. As migrations Prisma refletem a nova relacao com seguranca, preservando consistencia dos dados existentes por meio de estrategia explicita de transicao.
3. Os contratos, tipos e mapeamentos internos de `tasks` passam a considerar ownership, mesmo antes da protecao JWT e das regras finais de acesso.
4. Nesta story, a origem de `userId` fica limitada a fluxo interno controlado de persistencia e testes, sem exigir ainda autenticacao JWT nas rotas publicas.

## Tasks / Subtasks

- [x] Evoluir o schema Prisma para ownership de tarefas (AC: 1, 2)
  - [x] Adicionar `userId` ao modelo `Task` em `api/prisma/schema.prisma`, com relacao obrigatoria para `User`.
  - [x] Atualizar o modelo `User` para refletir a colecao de tarefas proprietarias.
  - [x] Criar migration Prisma segura para a nova relacao usando estrategia explicita de transicao para os dados existentes de `Task`.
  - [x] Tratar as tarefas ja existentes por um caminho aprovado nesta story: migracao em duas etapas com backfill controlado, ou reset seguro dos dados locais de `Task` antes de tornar `userId` obrigatorio.
  - [x] Garantir naming e constraints alinhados com os patterns aprovados (`userId`, relation explicita, timestamps preservados).
- [x] Preparar a camada de persistencia de tarefas para ownership (AC: 1, 3, 4)
  - [x] Atualizar `TasksRepository` para aceitar `userId` nas operacoes que criam ou consultam tarefas.
  - [x] Introduzir tipos internos de persistencia e input de repository que contemplem ownership, sem ainda aplicar toda a restricao de acesso do Epic 3.
  - [x] Evitar queries novas de `Task` que ignorem o modelo de propriedade introduzido nesta story.
- [x] Propagar ownership pelos contratos internos do modulo de tarefas (AC: 3, 4)
  - [x] Atualizar tipos, mappers e servicos de `tasks` para suportar a nova shape de persistencia.
  - [x] Preservar o contrato HTTP atual de tarefas nesta story, sem ainda exigir JWT nas rotas.
  - [x] Garantir que a criacao de tarefa receba `userId` apenas por fluxo interno controlado nesta story, deixando a origem via usuario autenticado para as stories seguintes.
- [x] Preservar compatibilidade evolutiva para os proximos passos do Epic 3 (AC: 2, 3)
  - [x] Preparar o terreno para que `3.2` adicione JWT nas rotas sem retrabalho estrutural em `tasks`.
  - [x] Preparar o terreno para que `3.3` restrinja leitura e escrita ao usuario autenticado usando `userId` como eixo principal.
  - [x] Nao antecipar nesta story respostas `401`, `403`/`404` por ownership nem decorators/guards de auth.
- [x] Cobrir a evolucao estrutural com testes automatizados (AC: 1, 2, 3, 4)
  - [x] Adicionar ou ajustar testes de repository/service para refletir `Task` com `userId`.
  - [x] Validar que a migration, o client Prisma e o build continuam consistentes apos a mudanca estrutural.
  - [x] Cobrir pelo menos o caminho feliz de criacao e leitura interna de tarefa considerando ownership no nivel de persistencia.

## Dev Notes

- Esta story e a ponte entre o dominio atual de tarefas e o modelo autenticado do produto. O foco aqui nao e proteger rotas ainda, e sim tornar ownership uma capacidade estrutural do dominio. [Source: /home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/planning-artifacts/epics.md#Story-31-Associar-tarefas-a-usuario-proprietario]
- O PRD exige isolamento estrito de dados por usuario e vinculo entre usuario autenticado e tarefas. Essa story entrega a base de dados e tipos para isso, antes da autenticacao nas rotas. [Source: /home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/planning-artifacts/prd.md#Identity--Ownership] [Source: /home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/planning-artifacts/prd.md#Task-Access-Under-Authentication]
- A arquitetura aprovada ja fixou que `Task` deve depender de `userId`, enquanto `AuthModule` continua dono da autenticacao e `TasksModule` fica responsavel pelo dominio de tarefas + ownership. [Source: /home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/planning-artifacts/architecture.md#Core-Architectural-Decisions] [Source: /home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/planning-artifacts/architecture.md#Project-Structure--Boundaries]
- O schema atual ainda nao possui `userId` em `Task`, e o CRUD de tarefas atual opera de forma global. Esta story precisa corrigir essa fundacao sem tentar resolver ao mesmo tempo JWT, guards e autorizacao final por ownership. [Source: /home/rodrigordgfs/www/poc/todo-bmad-api/api/prisma/schema.prisma] [Source: /home/rodrigordgfs/www/poc/todo-bmad-api/api/src/modules/tasks/repositories/tasks.repository.ts]
- A validacao manual da Story 1.1 ja consolidou que ownership obrigatorio de `Task` pertence a esta story, nao a fundacao de identidade. Isso continua valendo aqui para evitar sobreposicao entre epicos. [Source: /home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/implementation-artifacts/1-1-modelar-identidade-do-usuario-e-credenciais-seguras.md]
- Como ja existe banco com dados de `Task`, esta story fixa que a implementacao deve escolher e documentar uma estrategia explicita de transicao antes de tornar `userId` obrigatorio: ou migracao em duas etapas com backfill controlado, ou reset seguro dos dados locais de `Task` quando o contexto do ambiente permitir.
- O modulo de tarefas hoje usa `TasksRepository`, `TasksService`, `TaskMapper` e tipos internos simples. Ownership precisa atravessar essa cadeia com o minimo de atrito, preparando `3.2` e `3.3`. [Source: /home/rodrigordgfs/www/poc/todo-bmad-api/api/src/modules/tasks/tasks.service.ts]
- Nao introduzir ainda guards JWT, decorator de usuario atual ou respostas de acesso negado nesta story; esses itens pertencem as stories seguintes do Epic 3. [Source: /home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/planning-artifacts/epics.md#Story-32-Proteger-rotas-de-tarefas-com-autenticacao-JWT]
- Para evitar ambiguidade, esta story nao deve decidir ainda o `userId` a partir de bearer token ou guard. Nesta fase, `userId` pode entrar apenas por fluxo interno controlado de persistencia/teste, suficiente para preparar schema, repository e service para as stories seguintes.

### Project Structure Notes

- Concentrar as mudancas principais em `api/prisma/` e `api/src/modules/tasks/`.
- Nao mover ownership de tarefa para `AuthModule`; a autenticacao fornece contexto, mas o dominio de propriedade continua em `TasksModule`.
- Seguir naming aprovado: `Task`, `User`, `userId`, arquivos em kebab-case e contratos em camelCase. [Source: /home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/planning-artifacts/architecture.md#Implementation-Patterns--Consistency-Rules]

### References

- Story source: [epics.md](/home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/planning-artifacts/epics.md)
- PRD: [prd.md](/home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/planning-artifacts/prd.md)
- Architecture: [architecture.md](/home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/planning-artifacts/architecture.md)
- Sprint tracking: [sprint-status.yaml](/home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/implementation-artifacts/sprint-status.yaml)
- Prisma schema atual: [schema.prisma](/home/rodrigordgfs/www/poc/todo-bmad-api/api/prisma/schema.prisma)
- Tasks service atual: [tasks.service.ts](/home/rodrigordgfs/www/poc/todo-bmad-api/api/src/modules/tasks/tasks.service.ts)
- Tasks repository atual: [tasks.repository.ts](/home/rodrigordgfs/www/poc/todo-bmad-api/api/src/modules/tasks/repositories/tasks.repository.ts)
- Story 1.1: [1-1-modelar-identidade-do-usuario-e-credenciais-seguras.md](/home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/implementation-artifacts/1-1-modelar-identidade-do-usuario-e-credenciais-seguras.md)

## Dev Agent Record

### Agent Model Used

gpt-5

### Debug Log References

- Story criada a partir do PRD, arquitetura, epics, schema Prisma atual e implementacao corrente de `tasks`.
- `npm run prisma:migrate:dev -- --name add-task-ownership`
- `npm run prisma:generate`
- `npm test -- --runTestsByPath src/modules/tasks/tasks.service.spec.ts src/modules/tasks/tasks.service.read.spec.ts src/modules/tasks/tasks.service.write.spec.ts test/app.e2e-spec.ts`
- `npm test`
- `npm run test:e2e -- --runTestsByPath test/app.e2e-spec.ts`
- `npm run build`
- `npm run lint`

### Completion Notes List

- `Task` passou a ter `userId` obrigatorio e relacao explicita com `User`.
- A migration criou um owner interno fixo para backfill das tarefas existentes e para manter o CRUD atual funcional antes do JWT.
- `TasksRepository` e `TasksService` passaram a operar com ownership interno controlado, sem alterar o contrato HTTP publico nesta story.
- A suite de `tasks`, os testes unitarios globais e o e2e principal passaram com o novo modelo de ownership.

### File List

- `_bmad-output/implementation-artifacts/3-1-associar-tarefas-a-usuario-proprietario.md`
- `api/prisma/schema.prisma`
- `api/prisma/migrations/20260331224500_add_task_ownership/migration.sql`
- `api/src/modules/tasks/constants/internal-task-owner.ts`
- `api/src/modules/tasks/repositories/tasks.repository.ts`
- `api/src/modules/tasks/tasks.service.ts`
- `api/src/modules/tasks/types/task-persistence.type.ts`
- `api/src/modules/tasks/tasks.service.spec.ts`
- `api/src/modules/tasks/tasks.service.read.spec.ts`
- `api/src/modules/tasks/tasks.service.write.spec.ts`
- `api/test/app.e2e-spec.ts`

### Change Log

- 2026-03-31: Story criada para introduzir ownership estrutural de `Task` por `User`.
- 2026-03-31: Story ajustada para fixar estrategia explicita de transicao dos dados existentes e limitar a origem de `userId` a fluxo interno nesta fase.
- 2026-03-31: Implementado ownership estrutural de `Task` com backfill para owner interno e cobertura automatizada atualizada.
