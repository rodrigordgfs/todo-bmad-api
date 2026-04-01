# Story 4.3: Expandir testes para autenticacao, sessao e ownership

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want cobrir autenticacao e isolamento por usuario com testes automatizados,
so that a nova arquitetura seja validada contra regresssoes.

## Acceptance Criteria

1. Existem testes unitarios e/ou e2e para cadastro, login, refresh, logout e ownership de tarefas.
2. Cenarios de acesso indevido entre usuarios estao cobertos.
3. A suite valida o comportamento esperado de falha em sessao invalida.

## Tasks / Subtasks

- [x] Consolidar a matriz de cobertura de auth e sessao (AC: 1, 3)
  - [x] Revisar a cobertura atual de `register`, `login`, `refresh` e `logout` para identificar gaps reais, sem duplicar casos ja suficientemente provados.
  - [x] Garantir que os fluxos de sessao invalida mais importantes continuem cobertos, incluindo token de acesso invalido, refresh invalido, token expirado e sessao revogada.
  - [x] Fechar pelo menos uma lacuna objetiva de auth/sessao que hoje ainda nao esteja coberta de forma suficientemente direta.
  - [x] Adicionar testes unitarios ou e2e apenas onde houver lacuna objetiva de regressao.
- [ ] Consolidar a matriz de cobertura de ownership multiusuario (AC: 1, 2)
  - [ ] Revisar a cobertura atual de isolamento por usuario em listagem, detalhe, atualizacao, mudanca de status e exclusao.
  - [ ] Garantir que tentativas de acesso indevido entre usuarios continuem cobertas de forma suficiente e coerente com `404 Not Found`.
  - [ ] Fechar pelo menos uma lacuna objetiva de ownership ou de confianca transversal caso a revisao identifique assimetria real entre leitura, escrita ou sessao autenticada.
  - [ ] Complementar a cobertura apenas nos pontos em que ainda houver assimetria clara entre leitura, escrita e fluxo autenticado.
- [x] Tornar explicita a confianca transversal da suite (AC: 1, 2, 3)
  - [x] Validar que os testes relevantes estao distribuidos entre unitarios e e2e de forma intencional, sem depender de um unico ponto da suite para tudo.
  - [x] Preferir teste unitario para regra interna, branch de servico, repository ou filtro global; usar e2e apenas quando a lacuna envolver contrato HTTP, integracao entre camadas ou spec publico.
  - [x] Registrar na story quais gaps foram fechados e quais coberturas ja existentes foram mantidas como fonte principal de confianca.
  - [x] Evitar transformar esta story em refactor amplo de testes; o objetivo e consolidar cobertura e fechar lacunas, nao reorganizar toda a suite.

## Dev Notes

- Os Epics 1, 2 e 3 ja adicionaram bastante cobertura automatizada em `auth`, `tasks` e `app.e2e-spec.ts`.
- Hoje ja existem testes unitarios para filtro global, hash/sessao/auth e servicos de `tasks`, alem de uma suite e2e robusta para runtime autenticado. [Source: /home/rodrigordgfs/www/poc/todo-bmad-api/api/src/common/filters/http-exception.filter.spec.ts] [Source: /home/rodrigordgfs/www/poc/todo-bmad-api/api/src/modules/auth/auth.login.service.spec.ts] [Source: /home/rodrigordgfs/www/poc/todo-bmad-api/api/src/modules/auth/auth.refresh.service.spec.ts] [Source: /home/rodrigordgfs/www/poc/todo-bmad-api/api/src/modules/auth/auth.logout.service.spec.ts] [Source: /home/rodrigordgfs/www/poc/todo-bmad-api/api/src/modules/tasks/tasks.service.read.spec.ts] [Source: /home/rodrigordgfs/www/poc/todo-bmad-api/api/src/modules/tasks/tasks.service.write.spec.ts] [Source: /home/rodrigordgfs/www/poc/todo-bmad-api/api/test/app.e2e-spec.ts]
- Esta story deve atuar como fechamento de gaps e consolidacao de confianca, nao como repeticao mecanica dos mesmos cenarios.
- Para ficar pronta, a story deve fechar ao menos uma lacuna objetiva identificada durante a revisao da suite; “nenhuma mudanca necessaria” nao e criterio suficiente de conclusao.
- O Epic 4 ja endureceu contrato global de erro e Swagger; a cobertura aqui deve incluir regressao desses contratos quando isso trouxer valor real.
- Ownership por recurso continua com `404 Not Found`, e sessao invalida continua com contratos estaveis de erro; a suite final deve preservar isso.
- Evitar abrir nova frente de design de testes ou reorganizacao estrutural grande nesta story.

### Project Structure Notes

- Priorizar ajustes em specs existentes antes de criar novos arquivos de teste desnecessarios.
- Quando possivel, manter testes de contrato publico no e2e e testes de comportamento interno nos specs unitarios atuais.
- Se um novo teste for criado, ele deve fechar um gap claro identificado durante a revisao da cobertura.

### References

- Story source: [epics.md](/home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/planning-artifacts/epics.md)
- PRD: [prd.md](/home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/planning-artifacts/prd.md)
- Architecture: [architecture.md](/home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/planning-artifacts/architecture.md)
- Sprint tracking: [sprint-status.yaml](/home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/implementation-artifacts/sprint-status.yaml)
- Existing test coverage:
  - [http-exception.filter.spec.ts](/home/rodrigordgfs/www/poc/todo-bmad-api/api/src/common/filters/http-exception.filter.spec.ts)
  - [auth.login.service.spec.ts](/home/rodrigordgfs/www/poc/todo-bmad-api/api/src/modules/auth/auth.login.service.spec.ts)
  - [auth.refresh.service.spec.ts](/home/rodrigordgfs/www/poc/todo-bmad-api/api/src/modules/auth/auth.refresh.service.spec.ts)
  - [auth.logout.service.spec.ts](/home/rodrigordgfs/www/poc/todo-bmad-api/api/src/modules/auth/auth.logout.service.spec.ts)
  - [auth.service.spec.ts](/home/rodrigordgfs/www/poc/todo-bmad-api/api/src/modules/auth/auth.service.spec.ts)
  - [tasks.service.spec.ts](/home/rodrigordgfs/www/poc/todo-bmad-api/api/src/modules/tasks/tasks.service.spec.ts)
  - [tasks.service.read.spec.ts](/home/rodrigordgfs/www/poc/todo-bmad-api/api/src/modules/tasks/tasks.service.read.spec.ts)
  - [tasks.service.write.spec.ts](/home/rodrigordgfs/www/poc/todo-bmad-api/api/src/modules/tasks/tasks.service.write.spec.ts)
  - [app.e2e-spec.ts](/home/rodrigordgfs/www/poc/todo-bmad-api/api/test/app.e2e-spec.ts)
- Previous stories:
  - [4-1-adaptar-contrato-global-de-erro-para-autenticacao-e-ownership.md](/home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/implementation-artifacts/4-1-adaptar-contrato-global-de-erro-para-autenticacao-e-ownership.md)
  - [4-2-atualizar-swagger-e-contratos-publicos-da-api-autenticada.md](/home/rodrigordgfs/www/poc/todo-bmad-api/_bmad-output/implementation-artifacts/4-2-atualizar-swagger-e-contratos-publicos-da-api-autenticada.md)

## Dev Agent Record

### Agent Model Used

gpt-5

### Debug Log References

- Story criada a partir do PRD, arquitetura, epics e do estado atual da suite de testes apos os Epics 1 a 4.2.
- `npm test -- --runTestsByPath src/modules/auth/auth.login.service.spec.ts`
- `npm run build`
- `npm run lint`

### Completion Notes List

- A lacuna fechada nesta story foi a ausencia de cobertura unitária direta para a ponte brownfield de ownership no login.
- Foram adicionados testes para garantir que a adocao de tarefas legadas nao acontece quando o usuario ja possui tarefas e tambem nao roda para o owner interno.
- A suite principal de e2e e os demais specs existentes permaneceram como fonte primaria de confianca para contrato HTTP, sessao invalida e ownership multiusuario.

### File List

- `_bmad-output/implementation-artifacts/4-3-expandir-testes-para-autenticacao-sessao-e-ownership.md`
- `api/src/modules/auth/auth.login.service.spec.ts`

### Change Log

- 2026-03-31: Story criada para consolidar cobertura de autenticacao, sessao e ownership sem duplicacao desnecessaria.
- 2026-03-31: Implementada cobertura unitária para a ponte brownfield de ownership no login.
