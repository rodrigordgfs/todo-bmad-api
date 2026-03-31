# Story 2.1: Definir schema Task e contratos de dominio da API

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want modelar a entidade Task no banco e nos contratos da aplicacao,
so that as proximas historias de CRUD trabalhem sobre uma base consistente.

## Acceptance Criteria

1. A modelagem contempla `id`, `title`, `description`, `dueDate`, `priority`, `tags` como `String[]`, `status` como enum e timestamps.
2. A migracao inicial e gerada e aplicavel.
3. DTOs, enums e contratos internos refletem a semantica definida no schema.

## Tasks / Subtasks

- [x] Definir o schema `Task` no Prisma sem antecipar endpoints REST (AC: 1, 2)
  - [x] Adicionar `model Task` em `api/prisma/schema.prisma`
  - [x] Definir `id` com estrategia estavel para API e banco
  - [x] Modelar `title`, `description`, `dueDate`, `priority`, `tags`, `status`, `createdAt` e `updatedAt`
  - [x] Criar enum Prisma para `status` com valores canonicos e default explicito
  - [x] Criar enum Prisma para `priority` com valores canonicos e default explicito, evitando string livre temporaria
  - [x] Preservar `tags` como `String[]` no PostgreSQL, sem normalizar para tabela relacional agora
- [x] Gerar a primeira migration real do projeto e alinhar o Prisma Client (AC: 2)
  - [x] Executar `prisma migrate dev` com nome coerente para a criacao inicial de `Task`
  - [x] Garantir que `api/prisma/migrations/` passe a conter migration versionada real, e nao apenas `.gitkeep`
  - [x] Executar `prisma generate` apos a mudanca do schema
  - [x] Confirmar que a migration e reaplicavel no ambiente local esperado do projeto
- [x] Materializar contratos e tipos internos do dominio em `src/modules/tasks` (AC: 3)
  - [x] Criar a estrutura inicial de feature em `api/src/modules/tasks/`
  - [x] Criar enums e contratos internos para representar a semantica da tarefa na aplicacao
  - [x] Criar DTOs ou tipos de entrada/saida minimos para sustentar as proximas stories sem expor detalhes do Prisma diretamente
  - [x] Manter nomes, formatos e optionalidade alinhados ao schema e ao contrato HTTP esperado para o frontend
- [x] Integrar a fundacao do modulo sem antecipar CRUD completo (AC: 1, 3)
  - [x] Registrar `TasksModule` e os artefatos minimos necessarios no app apenas no nivel estrutural
  - [x] Nao implementar ainda controller CRUD completo, repository completo ou regras de negocio de create/update/delete
  - [x] Se for necessario um service, mantê-lo minimo e focado em composicao/contratos, nao em fluxo HTTP real
- [x] Cobrir a modelagem com validacoes de fundacao (AC: 1, 2, 3)
  - [x] Adicionar testes unitarios co-localizados quando houver logica real em enums, mapeadores ou contratos
  - [x] Ajustar o e2e apenas se a inicializacao do app passar a depender do `TasksModule`
  - [x] Validar que o build, os testes existentes e o pipeline Prisma continuam saudaveis
- [x] Validar a story antes de concluir (AC: 1, 2, 3)
  - [x] Executar `npm run prisma:validate`
  - [x] Executar `npm run prisma:generate`
  - [x] Executar `npm run build`
  - [x] Executar `npm test -- --runInBand`
  - [x] Executar `npm run test:e2e -- --runInBand`

## Dev Notes

- Esta story inaugura o dominio `Task`, mas ainda nao deve entregar CRUD HTTP completo. O objetivo aqui e criar a base relacional e os contratos internos que destravam as stories `2.2`, `2.3` e `2.4`.
- O projeto ja possui fundacao suficiente para isso: Prisma configurado, migrations preparadas, bootstrap `/api/v1`, Swagger habilitado e contrato global de erro/validacao pronto.
- O cuidado principal desta story e evitar dois extremos:
  - modelagem fraca demais, que gera retrabalho nas proximas stories
  - escopo grande demais, que antecipa controllers e regras de negocio fora do combinado

### Project Structure Notes

- O schema relacional continua centralizado em `api/prisma/schema.prisma`.
- A primeira migration real deve nascer em `api/prisma/migrations/`.
- A feature `tasks` deve passar a existir em `api/src/modules/tasks/`, seguindo o padrao feature-first da arquitetura.
- Contratos e enums compartilhados da feature podem ficar em `api/src/modules/tasks/` ou, se realmente forem cross-module, em `api/src/shared/`; prefira manter o que for especifico de `Task` dentro da propria feature.
- Nao mover Prisma para dentro da feature. O acesso continua isolado em `api/src/infra/database/prisma/`.
- Nao usar o modulo tecnico `foundation` como ancora de dominio; ele continua sendo so apoio de teste.

### Technical Requirements

- A entidade `Task` deve contemplar:
  - `id`
  - `title`
  - `description`
  - `dueDate`
  - `priority`
  - `tags`
  - `status`
  - `createdAt`
  - `updatedAt`
- `tags` devem permanecer como `String[]` no PostgreSQL nesta fase.
- `status` deve ser a representacao principal do estado da tarefa.
- `status` ja deve nascer com valores canonicos estaveis para suportar os epics seguintes:
  - `OPEN` como estado padrao de criacao
  - `COMPLETED` como estado de tarefa concluida
- `priority` tambem deve nascer como enum estavel nesta story, para evitar retrabalho no Epic 3:
  - `LOW`
  - `MEDIUM`
  - `HIGH`
- O valor padrao de `priority` deve ser explicito no schema e nos contratos internos; salvo impedimento tecnico claro, use `MEDIUM` como default.
- A modelagem deve preservar `camelCase` nos campos Prisma e nos contratos TypeScript.
- Datas precisam continuar compatíveis com serializacao ISO 8601 na borda HTTP.
- Os contratos internos criados agora devem facilitar:
  - `POST /api/v1/tasks`
  - `GET /api/v1/tasks`
  - `GET /api/v1/tasks/:id`
  - `PATCH /api/v1/tasks/:id`
  - `DELETE /api/v1/tasks/:id`
  - `PATCH /api/v1/tasks/:id/status`
- Evitar expor tipos do Prisma diretamente como contrato publico da API. Se usar tipos gerados internamente, manter mapeamento/abstracao clara para nao acoplar a borda HTTP ao ORM.
- A ordem semantica esperada para ordenacao futura de prioridade deve ficar clara desde ja:
  - `HIGH` acima de `MEDIUM`
  - `MEDIUM` acima de `LOW`
- Os contratos internos criados nesta story devem refletir esses enums e defaults de maneira consistente, sem depender de strings ad hoc espalhadas pelo codigo.

### Architecture Compliance

- Seguir a organizacao `controllers -> services/use-cases -> infra/repository`, mesmo que nesta story apenas a fundacao de `tasks` seja criada.
- Nenhum controller deve consultar Prisma diretamente.
- Nao introduzir wrappers `{ data: ... }` nas respostas futuras; os contratos dessa story ja devem nascer alinhados a esse padrao.
- Preservar o contrato global de erro implantado na `1.4`; esta story nao deve criar caminhos paralelos de validacao/erro.
- Manter `camelCase` em TypeScript, JSON e Prisma.
- Tratar qualquer desvio de naming, file placement ou acoplamento com Prisma como violacao arquitetural.

### File Structure Requirements

- Arquivos provavelmente tocados nesta story:
  - `api/prisma/schema.prisma`
  - `api/prisma/migrations/`
  - `api/package.json` apenas se scripts/ajustes adicionais forem estritamente necessarios
  - `api/src/app.module.ts`
  - `api/src/modules/tasks/tasks.module.ts`
- Arquivos provaveis para contratos internos da feature:
  - `api/src/modules/tasks/contracts/`
  - `api/src/modules/tasks/enums/`
  - `api/src/modules/tasks/dto/`
  - `api/src/modules/tasks/types/`
- Arquivos opcionais, somente se fizerem sentido para isolar semantica:
  - `api/src/modules/tasks/mappers/`
  - `api/src/modules/tasks/tasks.service.ts`
- Evitar nesta story:
  - controller CRUD completo
  - repository com queries reais de negocio
  - handlers HTTP de create/list/get/update/delete

### Testing Requirements

- Validar obrigatoriamente:
  - `npm run prisma:validate`
  - `npm run prisma:generate`
  - `npm run build`
  - `npm test -- --runInBand`
  - `npm run test:e2e -- --runInBand`
- Se a migration exigir banco local disponivel, documentar isso claramente na conclusao da story.
- Se houver logica em mapeadores, enums utilitarios ou contratos, criar testes unitarios co-localizados.
- Nao e necessario criar e2e de CRUD nesta story; o foco e fundacao de schema e contratos.

### Previous Story Learnings

- A `1.2` deixou o pipeline Prisma operacional, mas sem migration real; esta story e o ponto correto para criar a primeira migration versionada do projeto.
- A `1.2` tambem reforcou que `DATABASE_URL` deve ser explicita e reproduzivel, inclusive em testes.
- A `1.3` consolidou bootstrap compartilhado e rotas versionadas; qualquer introducao de `TasksModule` nao pode quebrar esse bootstrap nem o Swagger.
- A `1.4` consolidou contrato global de erro e validacao com `zod`; os contratos internos de `Task` devem nascer compatíveis com essa borda, sem reintroduzir `class-validator`.
- O review do Epic 1 mostrou um padrao importante: provas tecnicas e configuracoes de apoio nao devem vazar para o runtime real sem necessidade.

### Git Intelligence

- O historico de commits local continua pouco informativo para padroes finos; os guardrails mais confiaveis seguem sendo arquitetura, stories `1.2` a `1.4` e o estado atual do repositório.
- O repositório atual ainda nao possui `src/modules/tasks`, o que torna esta story o ponto correto para inaugurar a feature dentro da estrutura planejada.
- O `schema.prisma` atual ainda nao contem `Task`, entao a migration desta story sera a primeira a validar o fluxo real de evolucao de banco do projeto.

### References

- Story source e acceptance criteria: [Source: _bmad-output/planning-artifacts/epics.md#Story-21-Definir-schema-Task-e-contratos-de-dominio-da-API]
- Objetivo e dependencia do Epic 2: [Source: _bmad-output/planning-artifacts/epics.md#Epic-2-Cadastro-e-Manutencao-Confiavel-de-Tarefas]
- Sequencia de implementacao e impacto da modelagem: [Source: _bmad-output/planning-artifacts/architecture.md#Decision-Impact-Analysis]
- Naming, structure e anti-patterns: [Source: _bmad-output/planning-artifacts/architecture.md#Implementation-Patterns-&-Consistency-Rules]
- Boundaries do projeto: [Source: _bmad-output/planning-artifacts/architecture.md#Project-Structure-&-Boundaries]
- Learnings da fundacao Prisma: [Source: _bmad-output/implementation-artifacts/1-2-configurar-prisma-e-conexao-postgresql-com-migrations-iniciais.md]
- Learnings do bootstrap compartilhado: [Source: _bmad-output/implementation-artifacts/1-3-padronizar-bootstrap-http-cors-versionamento-e-swagger.md]
- Learnings do contrato global de erro e validacao: [Source: _bmad-output/implementation-artifacts/1-4-implementar-contrato-global-de-erro-e-validacao-de-entrada.md]

## Dev Agent Record

### Agent Model Used

Codex (GPT-5 family)

### Debug Log References

- O `schema.prisma` ainda estava vazio no inicio da story; esta implementacao materializou a primeira modelagem real do dominio.
- A primeira tentativa de `prisma migrate dev` falhou porque nao havia PostgreSQL aceitando conexoes em `localhost:5432`.
- O banco local de desenvolvimento foi inicializado com `docker compose up -d postgres`, e entao a migration `init-task-schema` foi criada e aplicada com sucesso.
- O `TasksModule` foi introduzido apenas no nivel estrutural, sem antecipar controller CRUD ou repository de negocio.

### Completion Notes List

- O schema Prisma agora define `Task`, `TaskStatus` e `TaskPriority`, com defaults explicitos para `status` e `priority`.
- A primeira migration real do projeto foi criada e aplicada, validando o fluxo de evolucao de banco antes do CRUD.
- A feature `src/modules/tasks` passou a existir com enums, DTOs, contratos, tipo de persistencia e mapper para isolar o transporte do formato Prisma.
- `TasksModule` foi registrado no `AppModule` sem quebrar o bootstrap atual, o Swagger ou os testes existentes.
- Foi adicionado teste unitario para o `TaskMapper`, cobrindo serializacao ISO e preservacao de campos opcionais nulos.
- Validacoes concluidas com sucesso: `npm run prisma:validate`, `npm run prisma:generate`, `npm run build`, `npm run lint`, `npm test -- --runInBand` e `npm run test:e2e -- --runInBand`.

### File List

- _bmad-output/implementation-artifacts/2-1-definir-schema-task-e-contratos-de-dominio-da-api.md
- _bmad-output/implementation-artifacts/sprint-status.yaml
- api/prisma/schema.prisma
- api/prisma/migrations/migration_lock.toml
- api/prisma/migrations/20260331023730_init_task_schema/migration.sql
- api/src/app.module.ts
- api/src/modules/tasks/tasks.module.ts
- api/src/modules/tasks/contracts/task.contract.ts
- api/src/modules/tasks/dto/create-task.dto.ts
- api/src/modules/tasks/dto/list-tasks-query.dto.ts
- api/src/modules/tasks/dto/update-task.dto.ts
- api/src/modules/tasks/dto/update-task-status.dto.ts
- api/src/modules/tasks/enums/task-priority.enum.ts
- api/src/modules/tasks/enums/task-status.enum.ts
- api/src/modules/tasks/mappers/task.mapper.ts
- api/src/modules/tasks/mappers/task.mapper.spec.ts
- api/src/modules/tasks/types/task-persistence.type.ts

### Change Log

- 2026-03-30: modelado o dominio `Task` no Prisma com enums e defaults, criada/aplicada a primeira migration real do projeto, e inaugurada a estrutura inicial de `src/modules/tasks`; story promovida para `review`.
