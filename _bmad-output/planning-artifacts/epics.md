---
stepsCompleted: [1, 2, 3, 4]
inputDocuments:
  - "d:\\www\\todo-bmad\\_bmad-output\\planning-artifacts\\prd.md"
  - "d:\\www\\todo-bmad\\_bmad-output\\planning-artifacts\\ux-design-specification.md"
  - "d:\\www\\todo-bmad\\_bmad-output\\planning-artifacts\\epics.md"
  - "d:\\www\\todo-bmad-api\\_bmad-output\\planning-artifacts\\architecture.md"
workflowType: 'epics-and-stories'
project_name: 'todo-bmad-api'
status: 'complete'
completedAt: '2026-03-30'
---

# todo-bmad-api - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for todo-bmad-api, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: A API permite criar uma tarefa com `title` obrigatorio e campos opcionais `description`, `dueDate`, `priority` e `tags`.
FR2: A API persiste a tarefa criada em PostgreSQL e retorna o recurso criado.
FR3: A API permite listar tarefas.
FR4: A API permite buscar uma tarefa por `id`.
FR5: A API permite editar uma tarefa existente.
FR6: A API permite excluir uma tarefa existente.
FR7: A API permite concluir uma tarefa.
FR8: A API permite reabrir uma tarefa concluida.
FR9: A API retorna estado de tarefa de forma clara e consistente para consumo do frontend.
FR10: A API permite filtrar tarefas por estado (`all`, `open`, `completed`).
FR11: A API permite busca textual case-insensitive.
FR12: A busca considera pelo menos `title`, `description` e `tags`.
FR13: A busca atua sobre o conjunto filtrado.
FR14: A API ordena tarefas por prioridade e depois por prazo.
FR15: A API aplica regra consistente para tarefas sem `dueDate`.
FR16: A API valida que `title` nao pode ficar vazio ao criar/editar.
FR17: A API expõe contrato de erro padronizado para validacao, nao encontrado e erro interno.
FR18: A API expõe endpoints REST versionados em `/api/v1`.
FR19: A API expõe documentacao Swagger/OpenAPI para os endpoints do MVP.
FR20: A API aceita consumo pelo frontend web em ambiente local via CORS configurado.

### NonFunctional Requirements

NFR1: A API deve responder de forma suficientemente rapida para nao introduzir travamentos perceptiveis no fluxo principal do app.
NFR2: A API deve preservar integridade de dados em operacoes de criar, editar, excluir, concluir e reabrir.
NFR3: A API deve usar validacao defensiva na borda de entrada com `zod`.
NFR4: A API deve manter separacao clara entre controller, service, repository e infraestrutura.
NFR5: A API deve usar PostgreSQL com migrations versionadas via Prisma.
NFR6: A API deve usar TypeScript strict, stack NestJS + Prisma e validacao padronizada com `zod`.
NFR7: A API deve usar JSON com `camelCase`, datas em ISO 8601 e booleanos reais.
NFR8: A API nao deve expor detalhes internos de banco ou stack traces ao cliente.
NFR9: A API deve estar preparada para evolucao futura com autenticacao, paginacao, observabilidade e cache sem reestruturacao radical.
NFR10: A base do projeto deve suportar CI/CD minimo com `lint`, `typecheck`, `test`, `build` e `prisma validate`.

### Additional Requirements

- Starter template obrigatorio para primeira story: `npx @nestjs/cli@latest new . --strict --package-manager npm`
- Setup inicial adicional: `npm install @prisma/client`, `npm install -D prisma`, `npx prisma init --datasource-provider postgresql`
- Biblioteca de validacao obrigatoria: `zod`
- Persistencia somente via Prisma, isolada fora dos controllers
- Padrao REST JSON com prefixo `/api/v1`
- `DELETE` retorna `204 No Content`
- Success responses do MVP nao usam wrapper `{ data: ... }`
- Error responses seguem shape consistente com `statusCode`, `code`, `message`, `details`
- Estrutura modular obrigatoria em `src/modules`, `src/common`, `src/infra`, `src/shared`
- `PrismaService` centralizado em `src/infra/database/prisma`
- Testes unitarios co-localizados e testes e2e em `test/`
- Documentacao Swagger habilitada desde o inicio
- Variaveis sensiveis via `.env`
- CORS liberado para o frontend local em desenvolvimento
- Decisao arquitetural definida: usar `status` enum como representacao principal no schema
- Decisao arquitetural definida: `tags` no schema inicial usam `String[]` no PostgreSQL
- Normalizacao de `tags` para estrutura relacional dedicada fica adiada para pos-MVP
- Decisao arquitetural definida: `details` de validacao sera um array de objetos com `field`, `message` e `code`

### UX Design Requirements

UX-DR1: A API deve fornecer respostas previsiveis e simples para manter a sensacao de clareza imediata no frontend.
UX-DR2: A API deve suportar criacao rapida de tarefa com `title` obrigatorio e campos opcionais sem exigir payload complexo.
UX-DR3: A API deve retornar dados suficientes para que o frontend atualize lista e feedback sem heuristicas locais fragis.
UX-DR4: A API deve suportar conclusao/reabertura em 1 acao com endpoint explicito e contrato claro.
UX-DR5: A API deve suportar filtro + busca combinados para evitar o estado de “sumiu”.
UX-DR6: A API deve devolver erros acionaveis e consistentes para permitir mensagens claras e retry na interface.
UX-DR7: A API deve manter semantica consistente de prioridade, prazo, tags e estado para leitura instantanea pela UI.
UX-DR8: A API deve manter comportamento deterministico de ordenacao para preservar a previsibilidade visual da lista.
UX-DR9: A API deve permitir integracao com feedback acessivel no frontend por meio de codigos e mensagens estaveis.
UX-DR10: A API deve evitar variacoes arbitrarias de formato que aumentem carga cognitiva no consumo pelo app.

### FR Coverage Map

FR1: Epic 2 - Criacao de tarefa
FR2: Epic 2 - Persistencia e retorno do recurso criado
FR3: Epic 2 - Listagem de tarefas
FR4: Epic 2 - Consulta por id
FR5: Epic 2 - Edicao de tarefa
FR6: Epic 2 - Exclusao de tarefa
FR7: Epic 3 - Concluir tarefa
FR8: Epic 3 - Reabrir tarefa
FR9: Epic 2 - Estado consistente da tarefa na resposta
FR10: Epic 3 - Filtro por estado
FR11: Epic 4 - Busca textual case-insensitive
FR12: Epic 4 - Busca em title, description e tags
FR13: Epic 4 - Busca sobre conjunto filtrado
FR14: Epic 3 - Ordenacao por prioridade e prazo
FR15: Epic 3 - Regra para tarefas sem prazo
FR16: Epic 2 - Validacao de title obrigatorio
FR17: Epic 1 - Contrato padronizado de erro
FR18: Epic 1 - API REST versionada
FR19: Epic 1 - Swagger/OpenAPI
FR20: Epic 1 - CORS para frontend local

## Epic List

### Epic 1: Fundacao Operacional da API de Tarefas
A equipe consegue subir uma API funcional, documentada e pronta para integracao, com base NestJS + Prisma + PostgreSQL, contratos estaveis e estrutura que suporta crescimento seguro.
**FRs covered:** FR17, FR18, FR19, FR20

### Epic 2: Cadastro e Manutencao Confiavel de Tarefas
O usuario consegue criar, visualizar, consultar, editar e excluir tarefas com validacao consistente e persistencia confiavel no banco.
**FRs covered:** FR1, FR2, FR3, FR4, FR5, FR6, FR9, FR16

### Epic 3: Progresso e Organizacao do Trabalho
O usuario consegue concluir e reabrir tarefas, filtrar por estado e ver a lista ordenada de forma util para decidir o que fazer agora.
**FRs covered:** FR7, FR8, FR10, FR14, FR15

### Epic 4: Descoberta e Consistencia de Estado
O usuario consegue encontrar tarefas rapidamente com busca textual combinada a filtros, enquanto o frontend recebe respostas previsiveis para feedback e recuperacao de contexto.
**FRs covered:** FR11, FR12, FR13

## Epic 1: Fundacao Operacional da API de Tarefas

A equipe consegue subir uma API funcional, documentada e pronta para integracao, com base NestJS + Prisma + PostgreSQL, contratos estaveis e estrutura que suporta crescimento seguro.

### Story 1.1: Inicializar projeto NestJS com base tipada e estrutura modular

As a developer,
I want inicializar a API com NestJS, TypeScript strict e estrutura base definida,
So that o projeto comece alinhado com a arquitetura aprovada.

**Acceptance Criteria:**

**Given** um repositorio da API sem codigo de aplicacao
**When** o projeto e inicializado com NestJS CLI e configuracoes base
**Then** a estrutura principal do projeto existe com `src/modules`, `src/common`, `src/infra`, `src/shared`, `prisma` e `test`
**And** o projeto compila e sobe em ambiente local sem erros
**And** a configuracao usa TypeScript strict e padroes de organizacao definidos em arquitetura

### Story 1.2: Configurar Prisma e conexao PostgreSQL com migrations iniciais

As a developer,
I want configurar Prisma com PostgreSQL e pipeline basico de migrations,
So that a API tenha persistencia versionada e pronta para evolucao segura.

**Acceptance Criteria:**

**Given** a base NestJS inicializada
**When** Prisma e PostgreSQL sao configurados no projeto
**Then** existe `schema.prisma` funcional com datasource PostgreSQL
**And** o projeto consegue gerar Prisma Client
**And** a estrategia de migrations esta operacional para as proximas historias

### Story 1.3: Padronizar bootstrap HTTP, CORS, versionamento e Swagger

As a developer,
I want configurar bootstrap da API com `/api/v1`, CORS local e Swagger,
So that o frontend consiga integrar e a documentacao do MVP fique disponivel desde o inicio.

**Acceptance Criteria:**

**Given** a aplicacao inicializada
**When** o bootstrap HTTP e configurado
**Then** a API expoe rotas sob o prefixo `/api/v1`
**And** CORS permite consumo pelo frontend local configurado
**And** Swagger/OpenAPI fica disponivel com os endpoints documentaveis do MVP

### Story 1.4: Implementar contrato global de erro e validacao de entrada

As a developer,
I want padronizar validacao e erro HTTP globalmente,
So that o frontend receba respostas previsiveis e acionaveis em qualquer endpoint.

**Acceptance Criteria:**

**Given** requests invalidas ou falhas de dominio/persistencia
**When** a API processa a requisicao
**Then** o erro segue shape consistente com `statusCode`, `code`, `message`, `details`
**And** a validacao de entrada usa `zod` como padrao da API
**And** erros de validacao usam `details` como array de objetos com `field`, `message` e `code`
**And** detalhes internos de banco ou stack traces nao sao expostos ao cliente

## Epic 2: Cadastro e Manutencao Confiavel de Tarefas

O usuario consegue criar, visualizar, consultar, editar e excluir tarefas com validacao consistente e persistencia confiavel no banco.

### Story 2.1: Definir schema Task e contratos de dominio da API

As a developer,
I want modelar a entidade Task no banco e nos contratos da aplicacao,
So that as proximas historias de CRUD trabalhem sobre uma base consistente.

**Acceptance Criteria:**

**Given** a infraestrutura Prisma ja configurada
**When** o schema da entidade `Task` e definido
**Then** a modelagem contempla `id`, `title`, `description`, `dueDate`, `priority`, `tags` como `String[]`, `status` como enum e timestamps
**And** a migracao inicial e gerada e aplicavel
**And** DTOs, enums e contratos internos refletem a semantica definida no schema

### Story 2.2: Criar tarefa com validacao e retorno consistente

As a usuario do app,
I want criar uma tarefa pela API com poucos campos obrigatorios,
So that o frontend possa suportar captura rapida sem payload complexo.

**Acceptance Criteria:**

**Given** um payload valido com `title` e campos opcionais
**When** `POST /api/v1/tasks` e chamado
**Then** a tarefa e persistida no PostgreSQL
**And** a resposta retorna o recurso criado em formato JSON consistente
**And** payload sem `title` valido e rejeitado com erro padronizado

### Story 2.3: Listar e consultar tarefas por id

As a usuario do app,
I want listar tarefas e consultar uma tarefa especifica,
So that a interface consiga carregar lista principal e detalhes de forma previsivel.

**Acceptance Criteria:**

**Given** tarefas persistidas no banco
**When** `GET /api/v1/tasks` ou `GET /api/v1/tasks/:id` e chamado
**Then** a API retorna dados de tarefa em formato consistente para o frontend
**And** a consulta por `id` retorna `NOT_FOUND` padronizado quando o recurso nao existir
**And** o estado da tarefa fica exposto de forma clara na resposta

### Story 2.4: Editar e excluir tarefas com seguranca de dominio

As a usuario do app,
I want editar e excluir tarefas existentes,
So that eu mantenha minha lista correta ao longo do uso.

**Acceptance Criteria:**

**Given** uma tarefa existente
**When** `PATCH /api/v1/tasks/:id` ou `DELETE /api/v1/tasks/:id` e chamado
**Then** os campos editaveis sao atualizados com validacao consistente
**And** a exclusao remove o recurso e responde com `204 No Content`
**And** operacoes sobre tarefa inexistente retornam erro padronizado de nao encontrado

## Epic 3: Progresso e Organizacao do Trabalho

O usuario consegue concluir e reabrir tarefas, filtrar por estado e ver a lista ordenada de forma util para decidir o que fazer agora.

### Story 3.1: Concluir e reabrir tarefas por endpoint explicito de estado

As a usuario do app,
I want concluir e reabrir tarefas em uma acao simples,
So that o frontend reflita progresso imediato com contrato claro.

**Acceptance Criteria:**

**Given** uma tarefa existente
**When** `PATCH /api/v1/tasks/:id/status` e chamado com o novo estado
**Then** a API atualiza o estado da tarefa com persistencia confiavel
**And** a resposta retorna a tarefa atualizada em formato consistente
**And** tentativas sobre tarefa inexistente retornam erro padronizado

### Story 3.2: Filtrar tarefas por estado

As a usuario do app,
I want listar tarefas filtradas por estado,
So that eu possa focar em abertas, concluidas ou em todas.

**Acceptance Criteria:**

**Given** tarefas em estados diferentes
**When** `GET /api/v1/tasks` recebe query de filtro por estado
**Then** apenas o subconjunto correto e retornado
**And** o filtro aceita valores compativeis com o contrato do frontend
**And** a resposta permanece consistente independentemente do filtro aplicado

### Story 3.3: Ordenar tarefas por prioridade e prazo com regra deterministica

As a usuario do app,
I want receber tarefas em ordem util para tomada de decisao,
So that a lista do frontend preserve previsibilidade visual.

**Acceptance Criteria:**

**Given** tarefas com prioridades e prazos variados
**When** a listagem e solicitada com ordenacao padrao ou explicita
**Then** a ordenacao primaria usa prioridade e o desempate usa `dueDate`
**And** tarefas sem `dueDate` seguem regra consistente documentada
**And** a API mantem comportamento deterministico entre chamadas equivalentes

## Epic 4: Descoberta e Consistencia de Estado

O usuario consegue encontrar tarefas rapidamente com busca textual combinada a filtros, enquanto o frontend recebe respostas previsiveis para feedback e recuperacao de contexto.

### Story 4.1: Busca textual case-insensitive em campos relevantes

As a usuario do app,
I want buscar tarefas por texto em campos relevantes,
So that eu encontre rapidamente o item certo mesmo com listas maiores.

**Acceptance Criteria:**

**Given** tarefas com `title`, `description` e `tags`
**When** `GET /api/v1/tasks` recebe termo de busca
**Then** a API aplica busca case-insensitive
**And** o termo e avaliado em `title`, `description` e `tags`
**And** a resposta retorna apenas tarefas correspondentes em formato consistente

### Story 4.2: Combinar busca com filtro de estado

As a usuario do app,
I want buscar dentro do conjunto filtrado,
So that o frontend suporte o fluxo de “buscar em abertas” sem comportamento ambiguo.

**Acceptance Criteria:**

**Given** um filtro de estado ativo e um termo de busca
**When** ambos sao enviados na mesma requisicao de listagem
**Then** a API aplica a busca sobre o conjunto filtrado
**And** o comportamento e previsivel e documentado
**And** a combinacao nao exige tratamento especial ou heuristica oculta no frontend

### Story 4.3: Refinar contrato de resposta para feedback e recuperacao de contexto

As a developer,
I want consolidar respostas e erros dos fluxos de listagem e mutacao,
So that o frontend consiga exibir feedback claro, retry e estados de “nao encontrado” sem ambiguidade.

**Acceptance Criteria:**

**Given** operacoes de busca, filtro, criacao, edicao e mudanca de estado
**When** a API responde ao frontend
**Then** os contratos de sucesso e erro mantem semantica estavel entre endpoints
**And** o campo `details` dos erros de validacao fica formalizado como array de objetos com `field`, `message` e `code`
**And** a documentacao Swagger reflete os contratos finais do MVP
