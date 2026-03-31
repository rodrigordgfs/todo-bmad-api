---
stepsCompleted:
  - 1
  - 2
  - 3
inputDocuments:
  - /home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/planning-artifacts/prd.md
  - /home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/planning-artifacts/architecture.md
workflowType: 'epics-and-stories'
project_name: 'todo-bmad-api'
status: 'complete'
completedAt: '2026-03-31'
---

# todo-bmad-api - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for todo-bmad-api, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: A API permite que usuarios criem conta com email e senha.
FR2: A API permite que usuarios autentiquem-se com email e senha.
FR3: A API permite encerrar a sessao ativa por logout.
FR4: A API permite iniciar nova sessao para usuarios ja cadastrados.
FR5: A API permite renovar a sessao autenticada sem novo login enquanto a renovacao for valida.
FR6: A API emite credenciais de acesso para usuarios autenticados.
FR7: A API renova a sessao autenticada usando refresh token.
FR8: A API invalida a capacidade de renovacao da sessao quando ocorre logout.
FR9: A API obriga novo login quando a renovacao de sessao falha.
FR10: A API mantém controle de sessao ativa por usuario.
FR11: A API substitui ou invalida sessao anterior quando uma nova sessao do mesmo usuario e criada.
FR12: A API identifica de forma unica cada usuario autenticado.
FR13: A API associa tarefas a um usuario especifico.
FR14: A API usa o contexto do usuario autenticado para determinar escopo de acesso aos dados.
FR15: A API impede que um usuario leia tarefas de outro usuario.
FR16: A API impede que um usuario altere tarefas de outro usuario.
FR17: A API impede que um usuario exclua tarefas de outro usuario.
FR18: A API permite que usuarios autenticados criem tarefas dentro do proprio contexto de conta.
FR19: A API permite que usuarios autenticados listem apenas as proprias tarefas.
FR20: A API permite que usuarios autenticados consultem uma tarefa propria por identificador.
FR21: A API permite que usuarios autenticados editem apenas tarefas da propria conta.
FR22: A API permite que usuarios autenticados excluam apenas tarefas da propria conta.
FR23: A API permite que usuarios autenticados concluam ou reabram apenas tarefas da propria conta.
FR24: A API permite que usuarios autenticados apliquem busca, filtro e ordenacao apenas sobre o proprio conjunto de tarefas.
FR25: A API pode ser consumida em JSON.
FR26: A API expõe endpoints de autenticacao sob o prefixo versionado atual.
FR27: A API retorna respostas consistentes para sucesso em cadastro, login, refresh e logout.
FR28: A API retorna erros consistentes para credenciais invalidas, acesso nao autenticado, sessao invalida e falhas de validacao.
FR29: A API permite distinguir falhas de autenticacao de falhas de autorizacao por propriedade do recurso.
FR30: A API aceita senha que atenda a politica minima definida pelo produto.
FR31: A API rejeita tentativas de cadastro com credenciais invalidas.
FR32: A API rejeita tentativas de login com credenciais incorretas.
FR33: A API rejeita uso de refresh token invalido, expirado ou revogado.

### NonFunctional Requirements

NFR1: A API deve armazenar senhas de forma protegida, sem persistencia em texto puro.
NFR2: A API deve tratar tokens de sessao de forma segura em emissao, renovacao e revogacao.
NFR3: A API deve exigir credenciais validas para endpoints autenticados.
NFR4: A API deve impedir acesso cruzado entre usuarios em qualquer operacao de tarefa.
NFR5: A API deve manter comportamento previsivel em sucesso, expiracao de sessao, falha de refresh e logout.
NFR6: A API deve preservar consistencia entre estado de sessao e autorizacao efetiva de acesso.
NFR7: A API deve falhar de maneira segura quando o contexto do usuario nao puder ser validado.
NFR8: A revogacao de sessao deve surtir efeito de forma consistente no backend.
NFR9: A autenticacao nao deve introduzir friccao perceptivel no uso normal do app.
NFR10: A renovacao de sessao nao deve introduzir interrupcoes perceptiveis no uso recorrente.
NFR11: A introducao da autenticacao nao deve degradar de forma significativa a experiencia atual de CRUD de tarefas.
NFR12: A API deve manter consumo em JSON e compatibilidade com `/api/v1`.
NFR13: A API deve preservar integracao viavel com o cliente atual.
NFR14: A API deve manter respostas de erro e sucesso consistentes com o contrato global ja adotado.
NFR15: A API deve manter separacao clara entre controller, service, repository e infraestrutura.
NFR16: A API deve continuar usando PostgreSQL com migrations versionadas via Prisma.
NFR17: A API deve continuar usando TypeScript strict e stack NestJS + Prisma.

### Additional Requirements

- Base tecnica preservada: NestJS + Prisma + PostgreSQL sobre o projeto atual
- Hash de senha obrigatorio com `argon2`
- Refresh token persistido apenas como hash no banco
- Refresh token modelado em tabela dedicada
- Modulos separados para autenticacao e usuarios: `AuthModule` e `UsersModule`
- Todas as rotas de `tasks` protegidas por guard JWT
- Ownership de tarefas obrigatoriamente escopado por `userId`
- Contrato global de erro atual deve ser preservado e estendido para auth/autorizacao
- `Task` passa a ter relacao de propriedade com `User`
- JWT bearer segue como mecanismo de autenticacao nas rotas protegidas
- Politica preferencial de 1 sessao ativa por usuario no MVP
- Swagger/OpenAPI deve refletir a superficie autenticada da API
- Testes unitarios e e2e devem ser expandidos para cobrir auth e ownership

### UX Design Requirements

Nenhum documento de UX separado foi fornecido para esta fase. Os requisitos de experiencia relevantes ja foram incorporados ao PRD:

UX-DR1: O fluxo de cadastro e login deve ocorrer sem friccao desnecessaria.
UX-DR2: A renovacao de sessao deve ser transparente em uso normal.
UX-DR3: Falha de refresh deve levar o usuario de volta ao login com comportamento previsivel.
UX-DR4: O usuario deve perceber claramente que acessa apenas o proprio espaco autenticado.

### Functional Requirements Extracted

- 33 requisitos funcionais extraidos do PRD cobrindo autenticacao, sessao, ownership e tarefas autenticadas

### Non-Functional Requirements Extracted

- 17 requisitos nao funcionais extraidos do PRD cobrindo seguranca, confiabilidade, performance, integracao e consistencia arquitetural

### Additional Requirements Extracted

- requisitos tecnicos de arquitetura para `argon2`, JWT, refresh token hash, ownership por `userId` e modularizacao `auth/users/tasks`

### FR Coverage Map

FR1: Epic 1 - Cadastro de conta
FR2: Epic 1 - Login com email e senha
FR3: Epic 2 - Logout
FR4: Epic 1 - Nova sessao para usuario ja cadastrado
FR5: Epic 2 - Renovacao de sessao sem novo login
FR6: Epic 1 - Emissao de credenciais de acesso
FR7: Epic 2 - Refresh token
FR8: Epic 2 - Invalidacao de renovacao no logout
FR9: Epic 2 - Novo login apos falha de refresh
FR10: Epic 2 - Controle de sessao ativa
FR11: Epic 2 - Substituicao/invalidacao de sessao anterior
FR12: Epic 1 - Identificacao unica do usuario autenticado
FR13: Epic 3 - Associacao de tarefas ao usuario
FR14: Epic 3 - Escopo por usuario autenticado
FR15: Epic 3 - Bloqueio de leitura entre usuarios
FR16: Epic 3 - Bloqueio de edicao entre usuarios
FR17: Epic 3 - Bloqueio de exclusao entre usuarios
FR18: Epic 3 - Criacao de tarefas no proprio contexto
FR19: Epic 3 - Listagem apenas das proprias tarefas
FR20: Epic 3 - Consulta de tarefa propria
FR21: Epic 3 - Edicao de tarefa propria
FR22: Epic 3 - Exclusao de tarefa propria
FR23: Epic 3 - Conclusao/reabertura de tarefa propria
FR24: Epic 3 - Busca, filtro e ordenacao sobre conjunto proprio
FR25: Epic 1 / Epic 4 - Consumo em JSON
FR26: Epic 1 / Epic 4 - Endpoints sob prefixo versionado
FR27: Epic 1 / Epic 2 / Epic 4 - Respostas consistentes de auth
FR28: Epic 1 / Epic 2 / Epic 4 - Erros consistentes de auth/validacao
FR29: Epic 3 / Epic 4 - Distincao entre autenticacao e autorizacao por ownership
FR30: Epic 1 - Politica minima de senha
FR31: Epic 1 - Rejeicao de cadastro invalido
FR32: Epic 1 - Rejeicao de login invalido
FR33: Epic 2 - Rejeicao de refresh invalido, expirado ou revogado

## Epic List

### Epic 1: Acesso Seguro a Conta
O usuario consegue criar conta, autenticar-se com email e senha e entrar no sistema com credenciais validas e respostas previsiveis.
**FRs covered:** FR1, FR2, FR4, FR6, FR12, FR25, FR26, FR27, FR28, FR30, FR31, FR32

### Epic 2: Sessao Autenticada e Continuidade de Uso
O usuario consegue manter sua sessao ativa com refresh token, encerrar a sessao com logout e recuperar o fluxo com seguranca quando a renovacao falhar.
**FRs covered:** FR3, FR5, FR7, FR8, FR9, FR10, FR11, FR27, FR28, FR33

### Epic 3: Isolamento de Dados e Propriedade das Tarefas
O usuario autenticado consegue operar apenas sobre as proprias tarefas, com isolamento de leitura, escrita, edicao, exclusao, busca, filtro e mudanca de estado.
**FRs covered:** FR13, FR14, FR15, FR16, FR17, FR18, FR19, FR20, FR21, FR22, FR23, FR24, FR29

### Epic 4: Endurecimento Operacional da Superficie Autenticada
A equipe consegue manter a API autenticada consistente em contrato, documentacao, testes e regras transversais sem degradar a experiencia atual do produto.
**FRs covered:** FR25, FR26, FR27, FR28, FR29

## Epic 1: Acesso Seguro a Conta

O usuario consegue criar conta, autenticar-se com email e senha e entrar no sistema com credenciais validas e respostas previsiveis.

### Story 1.1: Modelar identidade do usuario e credenciais seguras

As a developer,
I want introduzir a entidade de usuario e a persistencia segura de credenciais,
So that a API tenha uma base confiavel para cadastro e autenticacao.

**Acceptance Criteria:**

**Given** a base atual sem identidade de usuario
**When** o schema e os contratos internos sao evoluidos
**Then** existe uma entidade `User` persistida no PostgreSQL
**And** a senha do usuario nunca e armazenada em texto puro
**And** a modelagem suporta busca unica por email
**And** a estrategia de hash usa `argon2`

### Story 1.2: Permitir cadastro de conta com email e senha

As a usuario do app,
I want criar minha conta com email e senha,
So that eu possa acessar um espaco autenticado proprio.

**Acceptance Criteria:**

**Given** um payload valido de cadastro
**When** `POST /api/v1/auth/register` e chamado
**Then** a API cria um usuario com credenciais seguras
**And** retorna resposta de sucesso consistente
**And** rejeita payload invalido com erro padronizado
**And** rejeita tentativa de cadastro com email ja existente

### Story 1.3: Permitir login com emissao de credenciais de acesso

As a usuario do app,
I want fazer login com email e senha,
So that eu possa iniciar uma sessao autenticada na aplicacao.

**Acceptance Criteria:**

**Given** um usuario ja cadastrado com credenciais validas
**When** `POST /api/v1/auth/login` e chamado
**Then** a API autentica o usuario
**And** emite access token e refresh token
**And** retorna payload JSON consistente
**And** rejeita credenciais incorretas com erro padronizado

## Epic 2: Sessao Autenticada e Continuidade de Uso

O usuario consegue manter sua sessao ativa com refresh token, encerrar a sessao com logout e recuperar o fluxo com seguranca quando a renovacao falhar.

### Story 2.1: Persistir e controlar refresh token por sessao

As a developer,
I want persistir refresh tokens em estrutura dedicada,
So that a API possa revogar, renovar e controlar sessoes com seguranca.

**Acceptance Criteria:**

**Given** a necessidade de renovacao e revogacao de sessao
**When** a persistencia de sessao e implementada
**Then** existe uma tabela dedicada de refresh token vinculada ao usuario
**And** apenas o hash do refresh token e persistido
**And** a estrutura suporta invalidacao da sessao anterior quando necessario

### Story 2.2: Renovar sessao autenticada com refresh token

As a usuario autenticado,
I want renovar minha sessao sem repetir login,
So that eu continue usando o app sem interrupcoes desnecessarias.

**Acceptance Criteria:**

**Given** um refresh token valido associado a uma sessao ativa
**When** `POST /api/v1/auth/refresh` e chamado
**Then** a API valida a sessao e emite novas credenciais conforme a politica definida
**And** rejeita refresh invalido, expirado ou revogado com erro padronizado
**And** mantem comportamento previsivel para o cliente

### Story 2.3: Encerrar sessao com logout seguro

As a usuario autenticado,
I want encerrar minha sessao explicitamente,
So that minhas credenciais de renovacao deixem de ser validas.

**Acceptance Criteria:**

**Given** uma sessao autenticada existente
**When** `POST /api/v1/auth/logout` e chamado
**Then** a API invalida o refresh token persistido
**And** impede nova renovacao daquela sessao
**And** responde com contrato consistente
**And** falha de forma segura quando a sessao nao puder ser validada

## Epic 3: Isolamento de Dados e Propriedade das Tarefas

O usuario autenticado consegue operar apenas sobre as proprias tarefas, com isolamento de leitura, escrita, edicao, exclusao, busca, filtro e mudanca de estado.

### Story 3.1: Associar tarefas a usuario proprietario

As a developer,
I want vincular cada tarefa a um usuario,
So that o dominio de tarefas passe a respeitar propriedade explicita.

**Acceptance Criteria:**

**Given** a entidade `Task` ja existente
**When** o modelo de dados e evoluido para ownership
**Then** cada tarefa possui vinculo obrigatorio com um `User`
**And** as migrations refletem essa relacao com seguranca
**And** contratos e tipos internos passam a considerar propriedade

### Story 3.2: Proteger rotas de tarefas com autenticacao JWT

As a usuario autenticado,
I want acessar rotas de tarefas apenas com sessao valida,
So that o sistema proteja meus dados contra acesso nao autenticado.

**Acceptance Criteria:**

**Given** endpoints de tarefas existentes
**When** a protecao JWT e aplicada
**Then** todas as rotas de `tasks` exigem autenticacao valida
**And** requisicoes sem token ou com token invalido sao rejeitadas com erro padronizado
**And** o contexto autenticado do usuario fica disponivel para a camada de aplicacao

### Story 3.3: Restringir leitura e escrita de tarefas ao proprio usuario

As a usuario autenticado,
I want criar, listar, consultar, editar e excluir apenas minhas tarefas,
So that meus dados permanecam privados e isolados.

**Acceptance Criteria:**

**Given** multiplos usuarios com tarefas persistidas
**When** qualquer operacao de leitura ou escrita de tarefa e executada
**Then** a API considera obrigatoriamente o `userId` autenticado no escopo da operacao
**And** um usuario nao consegue acessar ou modificar tarefas de outro
**And** a criacao de tarefa associa automaticamente o recurso ao usuario autenticado

### Story 3.4: Aplicar busca, filtro, ordenacao e mudanca de estado no escopo autenticado

As a usuario autenticado,
I want usar todas as capacidades atuais de tarefas apenas sobre meu conjunto de dados,
So that a experiencia existente continue util sem violar privacidade.

**Acceptance Criteria:**

**Given** um usuario autenticado com tarefas proprias
**When** ele usa busca, filtro por status, ordenacao ou mudanca de estado
**Then** a API aplica essas operacoes apenas sobre tarefas pertencentes ao usuario autenticado
**And** o comportamento atual de busca, filtro e ordenacao e preservado dentro do escopo proprio
**And** mudancas de estado continuam respeitando o contrato existente

## Epic 4: Endurecimento Operacional da Superficie Autenticada

A equipe consegue manter a API autenticada consistente em contrato, documentacao, testes e regras transversais sem degradar a experiencia atual do produto.

### Story 4.1: Adaptar contrato global de erro para autenticacao e ownership

As a developer,
I want estender o contrato global de erro para auth e autorizacao,
So that o cliente receba respostas previsiveis em todos os cenarios novos.

**Acceptance Criteria:**

**Given** o contrato global de erro ja existente
**When** cenarios de autenticacao e ownership ocorrem
**Then** a API retorna erros consistentes para credenciais invalidas, acesso nao autenticado, sessao invalida e acesso negado por propriedade
**And** o formato global atual e preservado
**And** detalhes internos sensiveis nao sao expostos

### Story 4.2: Atualizar Swagger e contratos publicos da API autenticada

As a integrador do app,
I want consultar a documentacao atualizada da API autenticada,
So that eu consiga consumir cadastro, login, refresh, logout e tasks protegidas com clareza.

**Acceptance Criteria:**

**Given** a superficie autenticada da API implementada
**When** a documentacao Swagger/OpenAPI e revisada
**Then** endpoints de auth aparecem documentados com payloads e respostas corretas
**And** endpoints de tasks refletem exigencia de autenticacao
**And** contratos publicos permanecem consistentes com a implementacao

### Story 4.3: Expandir testes para autenticacao, sessao e ownership

As a developer,
I want cobrir autenticacao e isolamento por usuario com testes automatizados,
So that a nova arquitetura seja validada contra regresssoes.

**Acceptance Criteria:**

**Given** os fluxos de auth e tasks autenticadas implementados
**When** a suite automatizada e expandida
**Then** existem testes unitarios e/ou e2e para cadastro, login, refresh, logout e ownership de tarefas
**And** cenarios de acesso indevido entre usuarios sao cobertos
**And** a suite valida o comportamento esperado de falha em sessao invalida
