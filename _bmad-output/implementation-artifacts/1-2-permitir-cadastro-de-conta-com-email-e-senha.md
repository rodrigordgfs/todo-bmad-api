# Story 1.2: Permitir cadastro de conta com email e senha

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a usuario do app,
I want criar minha conta com email e senha,
so that eu possa acessar um espaco autenticado proprio.

## Acceptance Criteria

1. Dado um payload valido de cadastro, quando `POST /api/v1/auth/register` e chamado, a API cria um usuario com credenciais seguras.
2. A resposta de sucesso do cadastro segue contrato JSON consistente com o padrao atual da API e nao emite tokens nesta story.
3. Payload invalido e rejeitado com erro padronizado.
4. Tentativa de cadastro com email ja existente e rejeitada com `409 Conflict`, sem expor detalhes sensiveis.

## Tasks / Subtasks

- [ ] Expor a borda HTTP de cadastro no modulo de autenticacao (AC: 1, 2, 3, 4)
  - [ ] Criar `AuthModule` em `api/src/modules/auth/` com `auth.controller.ts` e `auth.service.ts`, mantendo `UsersModule` separado conforme a arquitetura.
  - [ ] Registrar `AuthModule` no [`app.module.ts`](/home/rodrigordgfs/www/poc/todo-bmad-api/api/src/app.module.ts) sem alterar o padrao modular atual.
  - [ ] Definir `POST /api/v1/auth/register` usando controller versionado e convencoes iguais as rotas atuais de `tasks`.
- [ ] Modelar validacao e contratos do cadastro (AC: 1, 2, 3)
  - [ ] Criar `RegisterDto` e schema Zod para `email` e `password` em `api/src/modules/auth/dto/` e `api/src/modules/auth/schemas/`.
  - [ ] Garantir politica minima de senha de 6 caracteres.
  - [ ] Criar contrato Swagger/response para documentar o endpoint e manter compatibilidade com JSON/camelCase.
  - [ ] Fixar payload de sucesso como confirmacao de criacao segura da conta, sem `accessToken` ou `refreshToken`.
- [ ] Implementar o caso de uso de registro com credenciais seguras (AC: 1, 4)
  - [ ] Reutilizar a fundacao de `User` e `passwordHash` prevista na Story 1.1, sem persistir senha em texto puro.
  - [ ] Hash da senha com `argon2` antes da persistencia.
  - [ ] Validar unicidade de `email` e rejeitar duplicidade com erro de negocio consistente.
- [ ] Preservar contrato de erro e comportamento HTTP do projeto (AC: 2, 3, 4)
  - [ ] Reutilizar `ZodValidationPipe` e o formato atual de `HttpExceptionFilter`.
  - [ ] Padronizar erro de validacao no mesmo formato usado pelo restante da API.
  - [ ] Definir erro de conflito de email com `409 Conflict`, em formato consistente e sem vazar implementacao interna.
- [ ] Cobrir o fluxo de cadastro com testes automatizados (AC: 1, 2, 3, 4)
  - [ ] Adicionar testes unitarios de service/use case para cadastro com sucesso e email duplicado.
  - [ ] Adicionar teste e2e para `POST /api/v1/auth/register` cobrindo sucesso, payload invalido e email repetido.
  - [ ] Verificar que a senha retornada nao aparece em responses nem logs esperados da camada testada.

## Dev Notes

- Esta story depende da base tecnica da Story 1.1: entidade `User`, persistencia segura de credenciais e uso de `argon2`. Se a Story 1.1 ainda nao estiver implementada, ela deve ser concluida antes do endpoint de cadastro. [Source: /home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/planning-artifacts/epics.md#Story-11-Modelar-identidade-do-usuario-e-credenciais-seguras]
- O objetivo aqui e abrir a primeira borda de autenticacao do produto, sem ainda implementar login, refresh ou logout. Esta story deve ficar restrita ao fluxo de cadastro. [Source: /home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/planning-artifacts/epics.md#Story-12-Permitir-cadastro-de-conta-com-email-e-senha]
- O cadastro nesta story nao autentica o usuario automaticamente e nao deve emitir `accessToken` ou `refreshToken`; emissao de credenciais fica reservada para a Story 1.3. [Source: /home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/planning-artifacts/epics.md#Story-13-Permitir-login-com-emissao-de-credenciais-de-acesso]
- O PRD define que o MVP usa `email + senha`, JSON, `/api/v1` e senha minima de 6 caracteres. O endpoint esperado e `POST /api/v1/auth/register`. [Source: /home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/planning-artifacts/prd.md#Domain-Specific-Requirements] [Source: /home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/planning-artifacts/prd.md#API-Backend-Specific-Requirements]
- A arquitetura exige `AuthModule` e `UsersModule` separados, hash com `argon2`, preservacao do contrato global de erro e evolucao incremental da base atual em NestJS + Prisma. [Source: /home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/planning-artifacts/architecture.md#Core-Architectural-Decisions] [Source: /home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/planning-artifacts/architecture.md#Authentication--Security]
- A borda HTTP existente segue o padrao `controller -> service -> repository`, com validacao Zod nos endpoints, versao `v1` e anotações Swagger proximas ao dominio. O endpoint de cadastro deve seguir o mesmo estilo visto em `tasks`. [Source: /home/rodrigordgfs/www/poc/todo-bmad-api/api/src/modules/tasks/tasks.controller.ts] [Source: /home/rodrigordgfs/www/poc/todo-bmad-api/docs/source-tree-analysis.md#Padrões-de-organizacao]
- O formato de erro atual e normalizado por [`http-exception.filter.ts`](/home/rodrigordgfs/www/poc/todo-bmad-api/api/src/common/filters/http-exception.filter.ts), com `statusCode`, `code`, `message` e `details`. O cadastro deve reaproveitar esse contrato, inclusive para validacao e duplicidade de email. [Source: /home/rodrigordgfs/www/poc/todo-bmad-api/api/src/common/filters/http-exception.filter.ts]
- Como a story agora fixa duplicidade de email como `409 Conflict`, a implementacao deve explicitar `code` e `message` adequados nesse caso, sem depender apenas dos defaults do filtro global. [Source: /home/rodrigordgfs/www/poc/todo-bmad-api/api/src/common/filters/http-exception.filter.ts]
- O stack atual ainda nao possui dependencias de autenticacao no [`package.json`](/home/rodrigordgfs/www/poc/todo-bmad-api/api/package.json). Esta story provavelmente precisara adicionar pelo menos `argon2` e as dependencias Nest/Passport/JWT apenas se forem realmente necessarias para o cadastro. Como login ainda nao entra aqui, evite antecipar JWT sem necessidade. [Source: /home/rodrigordgfs/www/poc/todo-bmad-api/api/package.json]
- O schema Prisma atual possui apenas `Task`, entao o fluxo de registro deve evoluir a persistencia sem quebrar o CRUD existente. Se a Story 1.1 introduzir relacao futura de ownership em `Task`, esta story nao deve completar a protecao de tarefas ainda; isso fica para o Epic 3. [Source: /home/rodrigordgfs/www/poc/todo-bmad-api/api/prisma/schema.prisma] [Source: /home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/planning-artifacts/architecture.md#Decision-Impact-Analysis]
- Para consistencia com os patterns aprovados, nomes devem seguir `RegisterDto`, `register.schema.ts`, `users.service.ts`, `auth.controller.ts`, `passwordHash`, `email` e JSON em camelCase. [Source: /home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/planning-artifacts/architecture.md#Implementation-Patterns--Consistency-Rules]

### Project Structure Notes

- Criar a nova feature em `api/src/modules/auth/` e manter identidade em `api/src/modules/users/`, espelhando a separacao arquitetural aprovada. [Source: /home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/planning-artifacts/architecture.md#Project-Structure--Boundaries]
- Reaproveitar a infraestrutura existente em `api/src/infra/database/prisma/` e o padrao observado em `api/src/modules/tasks/` para controller, service, repository, DTO, schema e contratos. [Source: /home/rodrigordgfs/www/poc/todo-bmad-api/docs/source-tree-analysis.md#Diretórios-críticos]
- Nao criar logica de autenticacao dentro de `TasksModule`; esta story deve somente abrir o cadastro e preparar a continuidade para login na Story 1.3. [Source: /home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/planning-artifacts/architecture.md#Structure-Patterns]

### References

- Story source: [epics.md](/home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/planning-artifacts/epics.md)
- PRD: [prd.md](/home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/planning-artifacts/prd.md)
- Architecture: [architecture.md](/home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/planning-artifacts/architecture.md)
- Root module: [app.module.ts](/home/rodrigordgfs/www/poc/todo-bmad-api/api/src/app.module.ts)
- Error filter: [http-exception.filter.ts](/home/rodrigordgfs/www/poc/todo-bmad-api/api/src/common/filters/http-exception.filter.ts)
- Tasks pattern reference: [tasks.controller.ts](/home/rodrigordgfs/www/poc/todo-bmad-api/api/src/modules/tasks/tasks.controller.ts)
- Validation pattern reference: [create-task.schema.ts](/home/rodrigordgfs/www/poc/todo-bmad-api/api/src/modules/tasks/schemas/create-task.schema.ts)
- Persistence source of truth: [schema.prisma](/home/rodrigordgfs/www/poc/todo-bmad-api/api/prisma/schema.prisma)

## Dev Agent Record

### Agent Model Used

gpt-5

### Debug Log References

### Completion Notes List

### File List
