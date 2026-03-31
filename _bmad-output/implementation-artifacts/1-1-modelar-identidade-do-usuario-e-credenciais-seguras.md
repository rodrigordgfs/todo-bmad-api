# Story 1.1: Modelar identidade do usuario e credenciais seguras

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want introduzir a entidade de usuario e a persistencia segura de credenciais,
so that a API tenha uma base confiavel para cadastro e autenticacao.

## Acceptance Criteria

1. Existe uma entidade `User` persistida no PostgreSQL com identificador estavel e busca unica por email.
2. A modelagem de usuario suporta armazenamento de senha apenas em formato protegido, nunca em texto puro.
3. A estrategia de hash de senha usa `argon2`.
4. O schema e os contratos internos sao evoluidos sem quebrar a base atual de `Task`.

## Tasks / Subtasks

- [x] Evoluir o modelo Prisma para introduzir `User` sem quebrar o dominio atual de tarefas (AC: 1, 4)
  - [x] Definir modelo `User` em [`api/prisma/schema.prisma`](/home/rodrigordgfs/www/poc/todo-bmad-api/api/prisma/schema.prisma) com `id`, `email`, `passwordHash`, timestamps e constraint de unicidade para email.
  - [x] Manter `Task` funcional e compativel com o CRUD atual, sem tornar `userId` obrigatorio nesta story.
  - [x] Gerar migration Prisma refletindo a nova entidade e as constraints introduzidas para `User`.
- [x] Criar a base modular de identidade para o backend atual (AC: 1, 4)
  - [x] Criar `UsersModule` em `api/src/modules/users/`.
  - [x] Criar repository e service minimos com pelo menos operacoes de `findByEmail` e `createUser`.
  - [x] Integrar o novo modulo ao [`api/src/app.module.ts`](/home/rodrigordgfs/www/poc/todo-bmad-api/api/src/app.module.ts) preservando a estrutura modular atual.
- [x] Introduzir a estrategia de credencial segura com `argon2` (AC: 2, 3)
  - [x] Adicionar a dependencia necessaria para hash/verificacao de senha.
  - [x] Criar encapsulamento simples para hash e verificacao de senha no contexto de autenticacao/usuarios.
  - [x] Garantir por contrato interno que somente `passwordHash` e persistido.
- [x] Criar testes para a nova fundacao de identidade (AC: 1, 2, 3, 4)
  - [x] Cobrir constraints do modelo e comportamento esperado do servico/repository de usuarios.
  - [x] Cobrir que o fluxo de credencial trabalha com hash e nao com senha em texto puro.
  - [x] Validar com `npm run build` que a base atual continua compilando com o novo modulo e o novo schema.

## Dev Notes

- Esta story e fundacional para todo o restante de autenticacao. Ela deve introduzir identidade e credenciais seguras, mas ainda nao precisa expor endpoints de cadastro/login; isso fica para historias posteriores.
- O projeto atual e um backend NestJS monolitico com `PrismaModule` global e `TasksModule` como principal modulo de negocio. A nova modelagem deve encaixar nesse desenho sem reestruturacao radical. [Source: /home/rodrigordgfs/www/poc/todo-bmad-api/docs/architecture.md#Resumo arquitetural]
- A arquitetura aprovada exige:
  - `User` como novo agregado de identidade
  - `argon2` para hash de senha
  - `UsersModule` separado de `AuthModule`
  - ownership futuro de `Task` por `userId`
  - persistencia via Prisma/PostgreSQL
  [Source: /home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/planning-artifacts/architecture.md#Core Architectural Decisions]
- A base atual ja usa Prisma em [`api/src/infra/database/prisma/prisma.module.ts`](/home/rodrigordgfs/www/poc/todo-bmad-api/api/src/infra/database/prisma/prisma.module.ts) e importa `PrismaModule` globalmente em [`api/src/app.module.ts`](/home/rodrigordgfs/www/poc/todo-bmad-api/api/src/app.module.ts). Isso favorece criar `UsersModule` sem reconfigurar infraestrutura.
- O schema atual tem apenas `Task`; esta story deve ser a primeira a introduzir `User` e preparar a relacao com `Task`. [Source: /home/rodrigordgfs/www/poc/todo-bmad-api/api/prisma/schema.prisma]
- Apesar de a arquitetura prever ownership futuro por `userId`, a relacao obrigatoria entre `Task` e `User` deve ficar para a Story 3.1, evitando quebrar o CRUD atual cedo demais. Nesta story, o foco e somente identidade e credenciais seguras. [Source: /home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/planning-artifacts/epics.md#Story-31-Associar-tarefas-a-usuario-proprietario]
- O contrato global de erro e o padrao de validacao com Zod devem ser preservados, mesmo que esta story ainda nao exponha borda HTTP nova. [Source: /home/rodrigordgfs/www/poc/todo-bmad-api/docs/architecture.md#Configuracao global observada]

### Project Structure Notes

- Seguir a estrutura modular aprovada:
  - `api/src/modules/users/` para identidade e acesso ao usuario
  - `api/src/modules/auth/` so em historias posteriores
  - `api/src/modules/tasks/` permanece focado no dominio de tarefas
  [Source: /home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/planning-artifacts/architecture.md#Project Structure & Boundaries]
- Naming conventions obrigatorias:
  - modelos Prisma em singular PascalCase: `User`
  - campos em camelCase: `passwordHash`, `userId`
  - arquivos TypeScript em kebab-case
  [Source: /home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/planning-artifacts/architecture.md#Implementation Patterns & Consistency Rules]

### References

- PRD da funcionalidade: [prd.md](/home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/planning-artifacts/prd.md#Functional-Requirements)
- Arquitetura da nova fase: [architecture.md](/home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/planning-artifacts/architecture.md#Core-Architectural-Decisions)
- Estrutura do projeto atual: [source-tree-analysis.md](/home/rodrigordgfs/www/poc/todo-bmad-api/docs/source-tree-analysis.md)
- Arquitetura atual documentada do backend: [architecture.md](/home/rodrigordgfs/www/poc/todo-bmad-api/docs/architecture.md)
- Story source: [epics.md](/home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/planning-artifacts/epics.md)

## Dev Agent Record

### Agent Model Used

gpt-5

### Debug Log References

- `npm install argon2`
- `npm test -- --runTestsByPath src/modules/users/password-hash.service.spec.ts src/modules/users/users.service.spec.ts`
- `npm run prisma:migrate:dev -- --name add-user-identity`
- `npm run prisma:generate`
- `npm test`
- `npm run build`
- `npm run lint`

### Completion Notes List

- Adicionado modelo `User` ao schema Prisma com migration versionada, mantendo o modelo `Task` inalterado nesta story.
- Criado `UsersModule` com `UsersRepository`, `UsersService` e `PasswordHashService`, expondo `findByEmail`, `createUser`, hash e verificacao de senha.
- Integrado o novo modulo ao `AppModule` sem alterar o comportamento atual do CRUD de tarefas.
- Adicionados testes unitarios para o encapsulamento com `argon2` e para a criacao de usuario com persistencia exclusiva de `passwordHash`.
- Validações executadas com sucesso: testes unitarios completos (`npm test`), build (`npm run build`) e lint (`npm run lint`).

### File List

- `api/package.json`
- `api/package-lock.json`
- `api/prisma/schema.prisma`
- `api/prisma/migrations/20260331185603_add_user_identity/migration.sql`
- `api/src/app.module.ts`
- `api/src/modules/users/password-hash.service.ts`
- `api/src/modules/users/password-hash.service.spec.ts`
- `api/src/modules/users/repositories/users.repository.ts`
- `api/src/modules/users/types/user-persistence.type.ts`
- `api/src/modules/users/users.module.ts`
- `api/src/modules/users/users.service.spec.ts`
- `api/src/modules/users/users.service.ts`

### Change Log

- 2026-03-31: Implementada a fundacao de identidade com `User`, `UsersModule`, hash seguro com `argon2`, migration Prisma e testes unitarios.
