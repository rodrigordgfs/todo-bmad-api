---
stepsCompleted:
  - 1
  - 2
  - 3
  - 4
  - 5
  - 6
  - 7
  - 8
inputDocuments:
  - /home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/planning-artifacts/prd.md
  - /home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/planning-artifacts/epics.md
  - /home/rodrigordgfs/www/poc/todo-bmad-api/docs/index.md
  - /home/rodrigordgfs/www/poc/todo-bmad-api/docs/project-overview.md
  - /home/rodrigordgfs/www/poc/todo-bmad-api/docs/source-tree-analysis.md
  - /home/rodrigordgfs/www/poc/todo-bmad-api/docs/architecture.md
  - /home/rodrigordgfs/www/poc/todo-bmad-api/docs/component-inventory.md
  - /home/rodrigordgfs/www/poc/todo-bmad-api/docs/api-contracts.md
  - /home/rodrigordgfs/www/poc/todo-bmad-api/docs/data-models.md
  - /home/rodrigordgfs/www/poc/todo-bmad-api/docs/development-guide.md
workflowType: 'architecture'
project_name: 'todo-bmad-api'
user_name: 'Rodrigo'
date: '2026-03-31T01:07:03-03:00'
lastStep: 8
status: 'complete'
completedAt: '2026-03-31'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
O PRD define 33 requisitos funcionais concentrados em cinco areas principais: acesso de conta, gestao de sessao, identidade e propriedade, acesso autenticado a tarefas e contratos de request/response. Arquiteturalmente, isso introduz um novo eixo central no sistema: alem do dominio `Task`, a aplicacao passa a precisar de um dominio explicito de `User` e de mecanismos de sessao que controlem emissao, renovacao, revogacao e invalidacao de credenciais.

O impacto funcional mais importante e que todas as operacoes atuais de tarefas deixam de ser globais e passam a ser contextualizadas pelo usuario autenticado. Isso significa que leitura, escrita, atualizacao de status, busca, filtro e ordenacao continuam existindo, mas agora sempre dentro de um escopo de propriedade. A arquitetura precisa, portanto, preservar os contratos atuais da API onde fizer sentido, ao mesmo tempo em que injeta autenticacao e autorizacao de forma consistente em toda a superficie de `tasks`.

**Non-Functional Requirements:**
Os NFRs mais determinantes para a arquitetura sao seguranca, confiabilidade, performance e integracao. Seguranca e a principal forca condutora: senhas nao podem ser persistidas em texto puro, refresh tokens invalidos ou revogados nao podem renovar sessao, e nenhuma operacao autenticada pode vazar dados entre usuarios.

Confiabilidade tambem e central porque o fluxo de autenticacao precisa ser previsivel em sucesso, expiracao, falha de refresh e logout. Em performance, o sistema nao exige tempo real, mas a autenticacao nao pode introduzir friccao perceptivel no uso normal do app. Em integracao, a API deve continuar operando em JSON sob `/api/v1`, preservando compatibilidade estrutural com o cliente atual e com o contrato global de erro existente.

**Scale & Complexity:**
O projeto continua com escopo pequeno para medio, mas a complexidade sobe de “CRUD com regras de dominio” para “backend com autenticacao stateful sobre tokens”. Nao ha sinais de multi-tenant, real-time, mensageria ou integracoes externas obrigatorias no MVP, mas ha nova complexidade em modelagem, seguranca e consistencia de sessao.

- Primary domain: backend REST API com autenticacao e isolamento de dados por usuario
- Complexity level: medium
- Estimated architectural components: 10-14 componentes principais

### Technical Constraints & Dependencies

- A base atual ja esta estruturada em NestJS com modulos, services, repositories, Prisma e PostgreSQL.
- O contrato HTTP atual usa prefixo `/api/v1`, JSON, Swagger e filtro global de erro, e isso deve ser preservado.
- O dominio `tasks` ja existe e precisa ser evoluido sem reestruturacao radical.
- O PRD exige JWT para access token e refresh token persistido para renovacao e revogacao de sessao.
- O produto quer politica de uma sessao ativa por usuario, ainda que isso possa ser flexibilizado em corte de escopo.
- O backend atual depende de Prisma e PostgreSQL; a nova solucao precisa encaixar autenticacao, propriedade e sessao dentro dessa base.
- O cliente atual ja consome a API existente, entao a integracao deve continuar viavel sem mudar o paradigma do consumo.

### Cross-Cutting Concerns Identified

- **Authentication enforcement:** rotas protegidas precisam validar contexto autenticado de forma uniforme.
- **Authorization by ownership:** toda operacao de `tasks` deve ser escopada por `userId`.
- **Session lifecycle management:** login, refresh, logout e invalidacao de sessao precisam seguir regras consistentes.
- **Credential security:** senha, tokens e revogacao precisam seguir praticas seguras e previsiveis.
- **Error contract preservation:** autenticacao e autorizacao precisam encaixar no contrato global de erro existente.
- **Backward-safe evolution:** a arquitetura precisa acrescentar `User` e sessao sem quebrar a modularidade atual da API.
- **Persistence consistency:** associacoes entre usuario, refresh token e tarefa precisam ser refletidas com clareza no modelo Prisma e nas consultas.

## Starter Template Evaluation

### Primary Technology Domain

API/backend em Node.js e TypeScript, evoluindo uma base NestJS ja existente com Prisma ORM e PostgreSQL.

### Starter Options Considered

1. **Manter a base atual em NestJS**
- Ja existe estrutura modular, scripts, testes, Prisma e convencoes consistentes.
- Evita custo de migracao desnecessario.
- Favorece introduzir autenticacao como evolucao incremental do sistema.

2. **Reiniciar com novo starter NestJS CLI**
- Continuaria sendo tecnicamente valido.
- Nao agrega vantagem real, porque o projeto ja esta inicializado e organizado.
- Criaria retrabalho e risco de divergencia com a base atual.

3. **Migrar para outro backend starter como Express/Fastify**
- Seria possivel, mas desalinhado com o objetivo.
- Troca de framework agora aumentaria risco arquitetural e nao resolve o problema central de autenticacao.

### Selected Starter: Base Atual em NestJS + Prisma + PostgreSQL

**Rationale for Selection:**
A melhor decisao arquitetural nesta fase nao e adotar um novo starter, e sim preservar o starter ja escolhido e evoluir a base existente. O projeto ja possui NestJS 11, Prisma ORM, PostgreSQL, versionamento de rota, Swagger, validacao e separacao modular por feature. Como a nova necessidade e adicionar autenticacao com JWT, refresh token e isolamento de tarefas por usuario, a arquitetura ganha mais consistencia ao expandir a fundacao atual do que ao reinicializar a aplicacao.

**Initialization Command:**

```bash
npx @nestjs/cli@latest new . --strict --package-manager npm
npm install @prisma/client
npm install -D prisma
npx prisma init --datasource-provider postgresql
```

**Architectural Decisions Provided by Starter:**

**Language & Runtime:**
- Node.js com TypeScript
- projeto NestJS com estrutura modular
- compatibilidade com decorators, DI e organizacao por modulos

**Persistence Foundation:**
- Prisma ORM integrado a PostgreSQL
- migrations versionadas
- client tipado para acesso a dados

**Build Tooling:**
- Nest CLI para build e execucao
- TypeScript strict
- scripts de desenvolvimento, teste e build ja configurados

**Testing Framework:**
- Jest para testes unitarios e e2e
- Supertest para validacao HTTP
- estrutura atual ja pronta para expansao de testes de autenticacao

**Code Organization:**
- modulos por dominio
- camadas claras entre controller, service, repository e infra
- Prisma centralizado em infraestrutura

**Development Experience:**
- ambiente atual ja operacional
- Swagger ja integrado
- padrao de erro global ja existente
- documentacao e convencoes locais ja conhecidas pelo projeto

**Note:** para esta fase, a “primeira story de implementacao” nao deve reinicializar o projeto, mas sim estender a base atual com os novos modulos, modelos e contratos de autenticacao.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- usar `argon2` para hash e verificacao de senha
- persistir apenas hash do refresh token no banco
- modelar refresh token em tabela dedicada
- separar autenticacao e usuarios em `AuthModule` e `UsersModule`
- proteger todas as rotas de `tasks` com guard JWT
- escopar todas as operacoes de tarefa por `userId`

**Important Decisions (Shape Architecture):**
- manter PostgreSQL + Prisma como base de persistencia
- manter `/api/v1` e contratos JSON
- preservar contrato global de erro e adapta-lo para autenticacao/autorizacao
- introduzir autorizacao por propriedade no service/repository de tarefas
- tratar politica de uma sessao ativa por usuario no dominio de sessao

**Deferred Decisions (Post-MVP):**
- rate limiting para endpoints de auth
- login social
- 2FA
- recuperacao de senha por email
- verificacao de email
- gestao avancada de multiplas sessoes/dispositivos

### Data Architecture

- adicionar entidade `User` como novo agregado de identidade
- adicionar tabela dedicada para refresh tokens com vinculo ao usuario
- adicionar relacao de propriedade entre `Task` e `User`
- armazenar apenas hash do refresh token, nunca o token puro
- manter Prisma Migrate como mecanismo de evolucao de schema
- manter PostgreSQL como banco unico do sistema

### Authentication & Security

- autenticacao baseada em credenciais `email + senha`
- hash de senha com `argon2`
- access token em JWT bearer para rotas protegidas
- refresh token separado para renovacao de sessao
- validacao de access token via guard JWT
- revogacao de sessao por invalidacao do refresh token persistido
- politica preferencial de uma sessao ativa por usuario
- autorizacao centrada em ownership, nao em RBAC

### API & Communication Patterns

- padrao REST JSON mantido
- endpoints de autenticacao sob `/api/v1/auth`
- endpoints de tarefas continuam sob `/api/v1/tasks`, agora protegidos
- contrato de erro permanece uniforme para validacao, autenticacao, autorizacao e nao encontrado
- Swagger/OpenAPI deve continuar refletindo a superficie autenticada da API

### Frontend Architecture

- nao ha nova arquitetura frontend neste ciclo
- o backend deve expor contratos claros para login, refresh, logout e consumo autenticado
- a integracao com o cliente atual deve continuar baseada em bearer token e JSON

### Infrastructure & Deployment

- manter a infraestrutura atual local com `.env`, PostgreSQL e Prisma
- secrets de JWT e credenciais permanecem em variaveis de ambiente
- nenhuma exigencia nova de infraestrutura distribuida no MVP
- testes e2e continuarao dependentes de banco real, agora com cenarios autenticados adicionais

### Decision Impact Analysis

**Implementation Sequence:**
1. modelar `User`, `RefreshToken` e relacao com `Task`
2. criar `UsersModule` e `AuthModule`
3. implementar hash de senha e fluxo de cadastro/login
4. implementar emissao, persistencia e renovacao de tokens
5. proteger rotas de `tasks`
6. adaptar queries e mutacoes para escopo por `userId`
7. atualizar testes e documentacao Swagger

**Cross-Component Dependencies:**
- `AuthModule` depende de `UsersModule` e da camada Prisma
- `TasksModule` passa a depender do contexto autenticado de usuario
- schema Prisma passa a sustentar identidade, sessao e propriedade de dados
- contrato global de erro precisa cobrir falhas de auth sem quebrar o padrao atual

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**Critical Conflict Points Identified:**
5 areas onde agentes poderiam divergir: naming de banco/API, organizacao de modulos, formato de resposta/erro, escopo de autorizacao e fluxo de sessao.

### Naming Patterns

**Database Naming Conventions:**
- modelos Prisma em singular PascalCase: `User`, `Task`, `RefreshToken`
- campos Prisma em camelCase: `userId`, `refreshTokenHash`, `createdAt`
- foreign keys explicitas em camelCase: `userId`
- enums em PascalCase com valores em maiusculas quando fizer sentido de dominio

**API Naming Conventions:**
- endpoints REST em plural ou nome funcional estavel: `/auth/register`, `/auth/login`, `/tasks`
- rotas versionadas sob `/api/v1`
- parametros e payloads em JSON com camelCase
- header de autenticacao padrao bearer token

**Code Naming Conventions:**
- modulos, classes e DTOs em PascalCase: `AuthModule`, `UsersModule`, `LoginDto`
- arquivos em kebab-case: `auth.module.ts`, `jwt-auth.guard.ts`, `refresh-token.repository.ts`
- funcoes e variaveis em camelCase
- schemas zod e contratos com nome alinhado ao caso de uso

### Structure Patterns

**Project Organization:**
- `src/modules/auth` para login, refresh, logout, guards e strategies
- `src/modules/users` para identidade e acesso ao usuario
- `src/modules/tasks` permanece responsavel apenas pelo dominio de tarefas
- regras transversais reutilizaveis em `src/common`
- Prisma continua em `src/infra/database/prisma`

**File Structure Patterns:**
- controllers, services, repositories, dto, schemas, contracts e mappers agrupados por modulo
- testes co-localizados quando unitarios; e2e em `test/`
- estrategias JWT e guards dentro do modulo `auth` ou subpastas explicitas dele
- nada de logica de autenticacao espalhada dentro de `tasks.controller.ts`

### Format Patterns

**API Response Formats:**
- respostas de sucesso continuam sem wrapper `data`
- respostas de erro seguem o contrato global ja existente
- autenticacao deve seguir o mesmo padrao estrutural da API atual

**Data Exchange Formats:**
- JSON em camelCase
- datas em ISO 8601
- booleanos reais
- `null` explicito quando necessario
- tokens retornados em payload de auth, nunca embutidos em formatos ad hoc

### Communication Patterns

**Authorization Flow Patterns:**
- autenticacao validada primeiro no guard JWT
- ownership validado na camada de servico e reforcado na consulta ao repositorio
- nenhuma operacao de tarefa deve depender apenas do `id` da tarefa sem `userId`

**Session Management Patterns:**
- login gera access token + refresh token
- refresh troca credenciais com validacao contra hash persistido
- logout invalida a sessao persistida
- politica de sessao unica tratada pelo dominio de sessao, nao pelo controller

### Process Patterns

**Error Handling Patterns:**
- credenciais invalidas, token invalido, token expirado e acesso sem autenticacao usam respostas consistentes com o contrato global
- acesso a recurso de outro usuario deve retornar erro de autorizacao/ownership sem vazar existencia indevida do recurso alem da decisao arquitetural escolhida depois
- falhas inesperadas continuam filtradas pelo handler global

**Validation Patterns:**
- entrada validada com Zod na borda
- transformacao de payload minima no controller
- regras de negocio e autorizacao ficam no service
- persistencia e filtros seguros ficam no repository

### Enforcement Guidelines

**All AI Agents MUST:**
- usar `userId` como eixo obrigatorio de autorizacao em todas as operacoes de tarefa
- manter camelCase em contratos JSON e Prisma TypeScript
- preservar o contrato global de erro e o padrao modular atual
- concentrar autenticacao em `AuthModule` e identidade em `UsersModule`
- persistir apenas hash do refresh token, nunca o valor puro

**Pattern Enforcement:**
- revisar novos modulos contra a mesma estrutura de `tasks`
- impedir consultas Prisma de tarefa sem filtro por `userId` em fluxos autenticados
- manter testes cobrindo login, refresh, logout e ownership de tarefas

### Pattern Examples

**Good Examples:**
- `TasksService.findById(userId, taskId)`
- `tasksRepository.findByIdOwnedByUser(taskId, userId)`
- `POST /api/v1/auth/login`
- `refreshTokenHash` salvo no banco, token puro apenas no fluxo de resposta

**Anti-Patterns:**
- buscar tarefa so por `id` e validar propriedade depois de forma inconsistente
- colocar logica de refresh token dentro de `TasksService`
- salvar refresh token puro no banco
- misturar snake_case no JSON da API
- criar respostas especiais de auth fora do contrato geral do sistema

## Project Structure & Boundaries

### Complete Project Directory Structure

```text
todo-bmad-api/
├── api/
│   ├── package.json
│   ├── tsconfig.json
│   ├── tsconfig.build.json
│   ├── nest-cli.json
│   ├── eslint.config.mjs
│   ├── docker-compose.yml
│   ├── .env
│   ├── .env.example
│   ├── .env.test
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── src/
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │   ├── config/
│   │   │   ├── app.config.ts
│   │   │   ├── swagger.config.ts
│   │   │   └── auth.config.ts
│   │   ├── common/
│   │   │   ├── filters/
│   │   │   ├── pipes/
│   │   │   ├── guards/
│   │   │   ├── decorators/
│   │   │   └── utils/
│   │   ├── infra/
│   │   │   └── database/prisma/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   │   ├── contracts/
│   │   │   │   ├── dto/
│   │   │   │   ├── guards/
│   │   │   │   ├── strategies/
│   │   │   │   ├── services/
│   │   │   │   ├── repositories/
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.module.ts
│   │   │   │   └── auth.service.ts
│   │   │   ├── users/
│   │   │   │   ├── contracts/
│   │   │   │   ├── dto/
│   │   │   │   ├── repositories/
│   │   │   │   ├── users.module.ts
│   │   │   │   └── users.service.ts
│   │   │   ├── tasks/
│   │   │   │   ├── contracts/
│   │   │   │   ├── dto/
│   │   │   │   ├── enums/
│   │   │   │   ├── mappers/
│   │   │   │   ├── repositories/
│   │   │   │   ├── schemas/
│   │   │   │   ├── types/
│   │   │   │   ├── tasks.controller.ts
│   │   │   │   ├── tasks.module.ts
│   │   │   │   └── tasks.service.ts
│   │   │   └── foundation/
│   │   └── shared/
│   │       └── contracts/
│   └── test/
│       ├── app.e2e-spec.ts
│       ├── auth.e2e-spec.ts
│       └── setup-env.ts
├── docs/
└── _bmad-output/
```

### Architectural Boundaries

**API Boundaries:**
- `AuthModule` expoe apenas cadastro, login, refresh e logout
- `UsersModule` encapsula identidade e acesso ao usuario
- `TasksModule` expoe CRUD e operacoes de estado, sempre em contexto autenticado
- `PrismaModule` continua como fronteira tecnica de persistencia

**Service Boundaries:**
- `AuthService` cuida de credenciais, emissao e revogacao de tokens
- `UsersService` cuida de busca e regras de identidade
- `TasksService` cuida apenas do dominio de tarefas + ownership
- nenhum modulo de dominio deve conhecer detalhes internos de hash alem do fluxo de auth

**Data Boundaries:**
- `User` e `RefreshToken` entram como entidades proprias no schema
- `Task` passa a depender de `userId`
- consultas autenticadas a tarefas devem sempre incluir escopo de propriedade

### Requirements to Structure Mapping

**Feature Mapping:**
- autenticacao → `src/modules/auth`
- identidade de usuario → `src/modules/users`
- tarefas autenticadas → `src/modules/tasks`
- erro global, guards e decorators transversais → `src/common`
- persistencia Prisma → `src/infra/database/prisma`

**Cross-Cutting Concerns:**
- JWT guard e decorator de usuario atual → `common/guards` e `common/decorators` ou `auth/guards` e `auth/strategies`, mantendo consistencia por modulo
- contrato global de erro permanece em `shared/contracts` + `common/filters`

### Integration Points

**Internal Communication:**
- `AuthModule` depende de `UsersModule` e `PrismaModule`
- `TasksModule` depende do contexto autenticado fornecido por guard/decorator
- `UsersModule` pode ser consumido por `AuthModule`, mas nao deve depender de `TasksModule`

**External Integrations:**
- cliente web consome `/api/v1/auth/*` e `/api/v1/tasks/*`
- nao ha integracao externa obrigatoria neste MVP alem de PostgreSQL

**Data Flow:**
- login/register -> `AuthController` -> `AuthService` -> `UsersService` / repositories -> Prisma
- rotas protegidas -> JWT guard -> controller -> service -> repository com `userId`

### File Organization Patterns

**Configuration Files:**
- configs globais continuam em `src/config`
- secrets e tempos de expiracao ficam em `.env`
- parametros de auth podem ganhar `auth.config.ts`

**Source Organization:**
- codigo por modulo funcional
- DTO, schema, repository e contract proximos ao caso de uso
- logica transversal isolada em `common` e `shared`

**Test Organization:**
- unitarios co-localizados em cada modulo
- e2e em `test/`, com cenarios especificos de auth e ownership
- testes de tasks precisam evoluir para considerar usuario autenticado

**Asset Organization:**
- irrelevante para este backend, sem necessidade de estrutura nova

### Development Workflow Integration

**Development Server Structure:**
- app Nest continua inicializada por `main.ts`
- `AppModule` passa a importar `AuthModule`, `UsersModule`, `TasksModule` e `PrismaModule`

**Build Process Structure:**
- build e execucao continuam pelos scripts atuais
- migrations Prisma passam a refletir `User`, `RefreshToken` e relacao com `Task`

**Deployment Structure:**
- sem mudanca de paradigma
- apenas novas variaveis de ambiente e novas migrations

## Architecture Validation Results

### Coherence Validation

**Decision Compatibility:**
As decisoes principais sao compativeis entre si: NestJS modular, Prisma/PostgreSQL, `argon2`, JWT bearer, refresh token com hash persistido e autorizacao por `userId` formam um conjunto coeso para o MVP proposto.

**Pattern Consistency:**
Os padroes definidos reforcam as decisoes arquiteturais centrais. Naming, boundaries, formato de resposta e enforcement de ownership estao alinhados com a stack e com o contrato atual da API.

**Structure Alignment:**
A estrutura proposta suporta a evolucao sem exigir reescrita da base atual. `AuthModule`, `UsersModule` e a adaptacao de `TasksModule` encaixam naturalmente no projeto existente.

### Requirements Coverage Validation

**Epic/Feature Coverage:**
O escopo funcional do PRD esta coberto por componentes explicitos de autenticacao, identidade, sessao e tarefas autenticadas.

**Functional Requirements Coverage:**
Os requisitos de cadastro, login, refresh, logout, ownership, protecao de rotas, contratos JSON e rejeicao de sessoes invalidas estao todos suportados pela arquitetura proposta.

**Non-Functional Requirements Coverage:**
Seguranca, confiabilidade, integracao e impacto controlado na experiencia atual estao refletidos em decisoes de hash, revogacao, escopo por usuario, preservacao do contrato global de erro e manutencao de `/api/v1`.

### Implementation Readiness Validation

**Decision Completeness:**
As decisoes criticas para comecar a implementacao ja estao explicitas: modelagem, boundaries de modulos, estrategia de token, ownership e persistencia de sessao.

**Structure Completeness:**
A estrutura de diretorios e modulos esta suficientemente definida para orientar agentes e implementacao manual.

**Pattern Completeness:**
Os principais pontos de divergencia entre agentes foram tratados: onde colocar auth, como escopar tasks, como nomear entidades e como manter consistencia de erro e resposta.

### Gap Analysis Results

**Critical Gaps:**
- nenhum gap critico bloqueando implementacao

**Important Gaps:**
- ainda sera necessario detalhar no nivel de story quais campos exatos entram em `User` e `RefreshToken`
- ainda sera necessario decidir o comportamento exato de resposta para tentativa de acesso a recurso de outro usuario (`404` vs erro explicito de autorizacao), se isso nao for fixado na implementacao/epics

**Nice-to-Have Gaps:**
- estrategia futura de rate limit para auth
- observabilidade especifica de autenticacao
- politica detalhada de expiracao de access/refresh token no nivel de configuracao operacional

### Validation Issues Addressed

- a arquitetura anterior do MVP sem autenticacao foi substituida por uma nova fundacao alinhada ao PRD atual
- a nova feature deixou de ser tratada como “adicao lateral” e passou a ser refletida como mudanca estrutural do dominio
- o risco de conflito entre agentes foi reduzido com padroes claros de modulo, naming e ownership

### Architecture Completeness Checklist

**Requirements Analysis**
- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed
- [x] Technical constraints identified
- [x] Cross-cutting concerns mapped

**Architectural Decisions**
- [x] Critical decisions documented
- [x] Technology stack fully specified
- [x] Integration patterns defined
- [x] Security considerations addressed

**Implementation Patterns**
- [x] Naming conventions established
- [x] Structure patterns defined
- [x] Communication patterns specified
- [x] Process patterns documented

**Project Structure**
- [x] Complete directory structure defined
- [x] Component boundaries established
- [x] Integration points mapped
- [x] Requirements to structure mapping complete

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION

**Confidence Level:** high

**Key Strengths:**
- preserva a base existente sem reestruturacao radical
- introduz autenticacao de forma modular e consistente
- trata ownership como regra arquitetural, nao detalhe incidental
- mantem compatibilidade com o contrato atual da API

**Areas for Future Enhancement:**
- multiplas sessoes/dispositivos
- rate limiting de autenticacao
- recuperacao/verificacao de conta
- seguranca avancada pos-MVP

### Implementation Handoff

**AI Agent Guidelines:**
- seguir `AuthModule`, `UsersModule` e `TasksModule` conforme as fronteiras documentadas
- aplicar `userId` como eixo obrigatorio de ownership em toda operacao autenticada
- manter contratos JSON e padrao global de erro
- persistir apenas hash de refresh token

**First Implementation Priority:**
- evoluir `schema.prisma` com `User`, `RefreshToken` e relacao de propriedade em `Task`
