---
stepsCompleted:
  - step-01-init
  - step-02-discovery
  - step-02b-vision
  - step-02c-executive-summary
  - step-03-success
  - step-04-journeys
  - step-05-domain
  - step-07-project-type
  - step-08-scoping
  - step-09-functional
  - step-10-nonfunctional
  - step-11-polish
inputDocuments:
  - /home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/planning-artifacts/architecture.md
  - /home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/planning-artifacts/epics.md
  - /home/rodrigordgfs/www/poc/todo-bmad-api/docs/index.md
  - /home/rodrigordgfs/www/poc/todo-bmad-api/docs/project-overview.md
  - /home/rodrigordgfs/www/poc/todo-bmad-api/docs/source-tree-analysis.md
  - /home/rodrigordgfs/www/poc/todo-bmad-api/docs/architecture.md
  - /home/rodrigordgfs/www/poc/todo-bmad-api/docs/component-inventory.md
  - /home/rodrigordgfs/www/poc/todo-bmad-api/docs/api-contracts.md
  - /home/rodrigordgfs/www/poc/todo-bmad-api/docs/data-models.md
  - /home/rodrigordgfs/www/poc/todo-bmad-api/docs/development-guide.md
workflowType: 'prd'
documentCounts:
  briefCount: 0
  researchCount: 0
  brainstormingCount: 0
  projectDocsCount: 10
classification:
  projectType: api_backend
  domain: general
  complexity: medium
  projectContext: brownfield
---

# Product Requirements Document - todo-bmad-api

**Author:** Rodrigo
**Date:** 2026-03-31T01:07:03-03:00

## Executive Summary

O `todo-bmad-api` evoluira de uma API de tarefas sem identidade de usuario para uma plataforma com contas individuais e acesso autenticado. O objetivo dessa nova fase e proteger informacoes sensiveis, permitir uso seguro por multiplos usuarios e garantir isolamento explicito dos dados de cada conta.

A funcionalidade sera direcionada aos usuarios finais do app, que passarao a criar conta, autenticar sessao e operar suas tarefas dentro de um contexto privado. A principal necessidade atendida nao e apenas “ter login”, mas estabelecer confianca operacional: cada usuario deve acessar apenas os proprios dados, com seguranca consistente ao longo do uso da aplicacao.

### What Makes This Special

O diferencial desta evolucao esta em transformar uma API funcional de tarefas em uma base multiusuario com privacidade real por padrao. Em vez de tratar autenticacao como detalhe tecnico, o produto passa a usar seguranca e privacidade como parte central da proposta de valor.

O insight principal e que, para este produto, autenticacao nao serve apenas para identificar usuarios, mas para delimitar claramente a posse e a visibilidade das tarefas. Isso cria uma experiencia mais confiavel, escalavel e preparada para futuras evolucoes do sistema.

## Project Classification

- **Project Type:** API backend
- **Domain:** general
- **Complexity:** medium
- **Project Context:** brownfield

Esse PRD trata uma evolucao de um sistema ja existente, com impacto direto em modelo de dados, contratos de API, regras de acesso, persistencia e comportamento de leitura/escrita das tarefas.

## Success Criteria

### User Success

O usuario consegue criar conta, autenticar-se com facilidade e acessar apenas as proprias tarefas sem ambiguidade sobre posse dos dados. A experiencia e considerada bem-sucedida quando o fluxo principal de entrada no sistema nao gera friccao desnecessaria e quando o usuario percebe claramente que seu espaco e privado.

### Business Success

A evolucao e bem-sucedida quando multiplos usuarios conseguem usar a aplicacao em paralelo sem mistura de dados, sem confusao de sessao e sem quebra da experiencia principal do produto. Nos primeiros meses, o indicador central de valor e a viabilidade do app como sistema multiusuario seguro, pronto para crescimento futuro.

### Technical Success

O sistema deve proteger senhas de forma segura, emitir access token JWT e refresh token corretamente, proteger rotas autenticadas e aplicar isolamento de dados por usuario em toda operacao de leitura e escrita. O backend deve impedir, por regra de aplicacao e persistencia, que um usuario acesse ou altere tarefas de outro.

### Measurable Outcomes

- O usuario consegue concluir cadastro e login com sucesso e entrar na aplicacao com sessao valida.
- Requisicoes autenticadas acessam somente tarefas pertencentes ao usuario autenticado.
- Requisicoes sem autenticacao valida sao rejeitadas de forma consistente.
- O refresh token permite renovacao de sessao sem exigir novo login em fluxo normal de uso.
- Multiplos usuarios conseguem operar o sistema sem vazamento ou mistura de dados entre contas.

## Product Scope

### MVP - Minimum Viable Product

- cadastro de conta
- login
- refresh token
- logout
- rotas protegidas
- vinculo e isolamento de tarefas por usuario

### Growth Features (Post-MVP)

- reset de senha por email
- verificacao de email
- login social
- 2FA

### Vision (Future)

A visao futura e transformar a API atual em uma base segura de identidade e dados privados por usuario, capaz de suportar recursos mais avancados de conta, recuperacao, multiplos dispositivos e controles adicionais de seguranca sem reestruturar o dominio principal da aplicacao.

## User Journeys

### Jornada 1: Usuario principal - cadastro e primeiro acesso

O usuario chega ao app querendo usar sua lista de tarefas com seguranca e privacidade. Ele informa email e senha para criar a conta, conclui o cadastro e faz login logo em seguida. O momento de valor acontece quando ele entra com sucesso no sistema e percebe que agora existe um espaco proprio, autenticado e isolado.

A jornada e bem-sucedida quando o fluxo de criacao de conta e entrada ocorre sem friccao desnecessaria e sem exigir passos extras fora do MVP. Esse fluxo revela necessidade de endpoints de cadastro, validacao de credenciais, armazenamento seguro de senha e emissao inicial de tokens.

### Jornada 2: Usuario principal - uso recorrente com sessao autenticada

Depois do primeiro acesso, o usuario volta ao app para consultar, criar, editar e concluir tarefas. Ele nao quer repetir login a todo momento; espera que sua sessao continue valida enquanto usa o produto normalmente. O momento de valor acontece quando o sistema renova a sessao de forma transparente com refresh token e ele continua usando a aplicacao sem interrupcao.

A jornada e bem-sucedida quando a renovacao acontece automaticamente em fluxo normal e o usuario percebe continuidade, nao friccao. Isso revela necessidade de refresh token, estrategia de expiracao, renovacao segura e manutencao do contexto autenticado.

### Jornada 3: Usuario principal - falha de sessao e recuperacao segura

Em algum momento, o access token expira e a renovacao por refresh token falha, seja por expiracao, revogacao ou token invalido. Nessa hora, o usuario precisa ser redirecionado de forma clara de volta para o login, sem ficar preso em erro silencioso ou estado inconsistente. O momento critico dessa jornada e a recuperacao controlada da sessao.

A jornada e bem-sucedida quando o sistema rejeita o acesso invalido com seguranca, encerra o contexto autenticado e devolve o usuario ao login com comportamento previsivel. Isso revela necessidade de tratamento consistente de expiracao, falha de refresh, logout e respostas HTTP adequadas para cliente autenticado.

### Jornada 4: Consumidor da API autenticada - acesso isolado aos dados

O cliente da aplicacao faz chamadas autenticadas para listar ou modificar tarefas. A expectativa central e que toda leitura e escrita ocorra apenas dentro do contexto do usuario autenticado. O momento de valor aqui nao e visual, mas de confianca sistemica: a API nunca mistura recursos de usuarios diferentes.

A jornada e bem-sucedida quando toda operacao autenticada usa o usuario da sessao como escopo obrigatorio de acesso a dados. Isso revela necessidade de rotas protegidas, identificacao do usuario autenticado no backend, associacao entre tarefas e dono, e enforcement de autorizacao em consultas e mutacoes.

### Journey Requirements Summary

As jornadas acima revelam as seguintes capacidades obrigatorias:

- cadastro com email e senha
- login com email e senha
- armazenamento seguro de senha
- emissao de access token e refresh token
- renovacao automatica de sessao
- retorno ao login quando refresh falhar
- logout
- protecao de rotas autenticadas
- associacao entre usuario e tarefas
- isolamento estrito de dados por usuario

## Domain-Specific Requirements

### Compliance & Regulatory

Nao ha exigencia regulatoria ou compliance setorial especifico para o MVP desta funcionalidade.

### Technical Constraints

- a senha deve ter minimo de 6 caracteres no MVP
- o sistema deve manter apenas 1 sessao ativa por usuario
- o refresh token deve ser persistido no banco para permitir revogacao e logout seguro
- a autenticacao deve continuar baseada em JWT para access token e refresh token para renovacao de sessao

### Integration Requirements

- o backend deve associar a sessao autenticada ao usuario dono das tarefas
- a renovacao de sessao deve invalidar ou substituir a sessao anterior quando houver novo login
- o mecanismo de logout deve revogar o refresh token persistido

### Risk Mitigations

- risco de acesso indevido entre usuarios: mitigar com escopo obrigatorio por `userId` em todas as operacoes de tarefa
- risco de sessao duplicada ou inconsistente: mitigar com politica de 1 sessao por usuario
- risco de reutilizacao de refresh token: mitigar com persistencia e revogacao no banco
- risco de credenciais fracas: mitigar com politica minima de senha desde o MVP

## API Backend Specific Requirements

### Project-Type Overview

Esta evolucao mantem o produto como uma API backend REST versionada, orientada a JSON, agora com autenticacao e escopo de dados por usuario. O foco da implementacao e adicionar identidade, sessao e autorizacao sem quebrar a base ja existente da API de tarefas.

### Technical Architecture Considerations

A autenticacao deve ser baseada em JWT para access token e refresh token persistido para renovacao e revogacao de sessao. O sistema deve continuar operando sob `/api/v1`, com contratos HTTP em JSON e regras claras para autenticacao, expiracao de sessao, logout e isolamento de recursos por usuario.

A autorizacao do MVP sera simples: apenas usuario comum autenticado, sem papeis administrativos. Toda operacao sobre tarefas deve ser escopada ao usuario autenticado, impedindo acesso cruzado entre contas.

### Endpoint Specifications

Endpoints principais esperados no MVP:

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- endpoints de `tasks` existentes passam a exigir autenticacao e operar apenas sobre tarefas do usuario autenticado

### Authentication Model

- cadastro com email e senha
- login com email e senha
- access token JWT para autenticacao nas rotas protegidas
- refresh token para renovacao automatica de sessao
- refresh token persistido no banco para permitir revogacao
- politica de apenas 1 sessao ativa por usuario
- logout com invalidacao do refresh token armazenado

### Data Schemas

- requests e responses em JSON apenas
- dados de autenticacao devem incluir pelo menos credenciais de login/cadastro e tokens de sessao
- recursos de tarefa devem incorporar escopo por usuario no backend, sem expor dados de outros usuarios

### Error Codes

A API deve manter contrato de erro consistente para:

- credenciais invalidas
- acesso nao autenticado
- acesso negado por contexto de propriedade
- sessao expirada ou refresh invalido
- validacao de payload

### Versioning

- manter padrao atual `/api/v1`

### Rate Limits

- fora do MVP atual
- pode ser introduzido depois sem alterar o contrato principal da autenticacao

### Implementation Considerations

- nao ha necessidade de SDK/client especifico neste momento
- a integracao esperada e consumo direto da API pelo app existente
- a introducao da autenticacao deve preservar compatibilidade estrutural com o dominio atual de tarefas, evoluindo persistencia e contratos sem reestruturar radicalmente a base

## Project Scoping & Phased Development

### MVP Strategy & Philosophy

**MVP Approach:** MVP orientado a resolver o problema central com seguranca real, preservando uma experiencia de sessao funcional, mas priorizando isolamento de dados e protecao de credenciais acima de conveniencias secundarias.

**Resource Requirements:** implementacao backend com foco cuidadoso em autenticacao, persistencia de sessao, modelagem de usuario e adaptacao do dominio de tarefas existente. O trabalho exige atencao maior em seguranca e consistencia do que uma feature CRUD comum.

### MVP Feature Set (Phase 1)

**Core User Journeys Supported:**

- cadastro e primeiro acesso com email e senha
- login com sessao autenticada
- renovacao automatica de sessao com refresh token
- retorno ao login quando a renovacao falhar
- acesso autenticado apenas as tarefas do proprio usuario

**Must-Have Capabilities:**

- criacao de conta
- login com email e senha
- hash seguro de senha
- emissao de access token JWT
- emissao e persistencia de refresh token
- logout com revogacao de refresh token
- protecao das rotas de tarefas
- associacao entre `user` e `task`
- enforcement de isolamento por usuario em leitura e escrita
- manutencao de `/api/v1` e contratos JSON

### Post-MVP Features

**Phase 2 (Post-MVP):**

- politica rigida de 1 sessao por usuario, caso precise ser flexibilizada no corte inicial
- reset de senha por email
- verificacao de email
- melhorias de gestao de sessao e observabilidade de autenticacao

**Phase 3 (Expansion):**

- login social
- 2FA
- multiplos dispositivos com gestao explicita de sessoes
- politicas avancadas de seguranca e recuperacao de conta

### Risk Mitigation Strategy

**Technical Risks:** o maior risco e introduzir autenticacao e propriedade por usuario sem quebrar o dominio atual de tarefas. Mitigacao: modelar `User` e vinculo com `Task` de forma explicita, proteger rotas por padrao e aplicar escopo por `userId` em toda operacao.

**Market Risks:** o principal risco e entregar “login” sem transmitir confianca real. Mitigacao: garantir que o MVP ja entregue privacidade clara, sessao funcional e comportamento previsivel em falha de autenticacao.

**Resource Risks:** se o esforco crescer alem do esperado, a simplificacao prioritaria e adiar a politica estrita de 1 sessao por usuario, preservando cadastro, login, refresh, logout, rotas protegidas e isolamento dos dados como nucleo obrigatorio.

## Functional Requirements

### Account Access

- FR1: usuarios podem criar uma conta usando email e senha.
- FR2: usuarios podem autenticar-se usando email e senha.
- FR3: usuarios podem encerrar a sessao ativa por meio de logout.
- FR4: usuarios podem iniciar nova sessao mesmo apos terem usado o sistema anteriormente.
- FR5: usuarios podem receber uma nova sessao autenticada sem repetir login enquanto a sessao de renovacao ainda for valida.

### Session Management

- FR6: o sistema pode emitir credenciais de acesso para usuarios autenticados.
- FR7: o sistema pode renovar a sessao autenticada de um usuario usando mecanismo de refresh.
- FR8: o sistema pode invalidar a capacidade de renovacao de uma sessao quando ocorrer logout.
- FR9: o sistema pode tratar falha de renovacao de sessao obrigando novo login.
- FR10: o sistema pode manter controle de sessao ativa por usuario.
- FR11: o sistema pode substituir ou invalidar sessao anterior quando uma nova sessao do mesmo usuario for criada.

### Identity & Ownership

- FR12: o sistema pode identificar de forma unica cada usuario autenticado.
- FR13: o sistema pode associar tarefas a um usuario especifico.
- FR14: o sistema pode usar o contexto do usuario autenticado para determinar escopo de acesso aos dados.
- FR15: o sistema pode impedir que um usuario leia tarefas de outro usuario.
- FR16: o sistema pode impedir que um usuario altere tarefas de outro usuario.
- FR17: o sistema pode impedir que um usuario exclua tarefas de outro usuario.

### Task Access Under Authentication

- FR18: usuarios autenticados podem criar tarefas dentro do proprio contexto de conta.
- FR19: usuarios autenticados podem listar apenas as proprias tarefas.
- FR20: usuarios autenticados podem consultar uma tarefa propria por identificador.
- FR21: usuarios autenticados podem editar apenas tarefas da propria conta.
- FR22: usuarios autenticados podem excluir apenas tarefas da propria conta.
- FR23: usuarios autenticados podem concluir ou reabrir apenas tarefas da propria conta.
- FR24: usuarios autenticados podem aplicar busca, filtro e ordenacao apenas sobre o proprio conjunto de tarefas.

### Request & Response Contracts

- FR25: clientes podem consumir a API usando JSON.
- FR26: clientes podem consumir os endpoints de autenticacao sob o prefixo versionado atual da API.
- FR27: clientes podem receber respostas consistentes para sucesso em cadastro, login, refresh e logout.
- FR28: clientes podem receber erros consistentes para credenciais invalidas, acesso nao autenticado, sessao invalida e falhas de validacao.
- FR29: clientes podem distinguir falhas de autenticacao de falhas de autorizacao por propriedade do recurso.

### Validation & Credential Rules

- FR30: usuarios podem cadastrar senha que atenda a politica minima definida pelo produto.
- FR31: o sistema pode rejeitar tentativas de cadastro com credenciais invalidas.
- FR32: o sistema pode rejeitar tentativas de login com credenciais incorretas.
- FR33: o sistema pode rejeitar uso de refresh invalido, expirado ou revogado.

## Non-Functional Requirements

### Security

- senhas devem ser armazenadas de forma protegida, sem persistencia em texto puro
- tokens de sessao devem ser tratados de forma segura em emissao, renovacao e revogacao
- endpoints autenticados devem exigir credenciais validas para acesso
- o sistema deve impedir acesso cruzado entre usuarios em qualquer operacao de tarefa
- refresh tokens revogados, invalidos ou expirados nao devem permitir renovacao de sessao

### Reliability

- o fluxo de autenticacao deve manter comportamento previsivel em sucesso, expiracao de sessao, falha de refresh e logout
- o sistema deve preservar consistencia entre estado de sessao e autorizacao efetiva de acesso
- operacoes autenticadas devem falhar de maneira segura quando o contexto do usuario nao puder ser validado
- a revogacao de sessao deve surtir efeito de forma consistente no backend

### Performance

- operacoes principais de autenticacao e acesso autenticado a tarefas devem responder sem friccao perceptivel no uso normal do app
- o fluxo de renovacao de sessao nao deve introduzir interrupcoes perceptiveis no uso recorrente
- a introducao da autenticacao nao deve degradar de forma significativa a experiencia atual de CRUD de tarefas

### Integration

- a API deve manter consumo em JSON e compatibilidade com o padrao versionado `/api/v1`
- a introducao da autenticacao deve preservar integracao viavel com o app cliente atual
- respostas de erro e sucesso devem permanecer consistentes com o contrato global ja adotado no backend
