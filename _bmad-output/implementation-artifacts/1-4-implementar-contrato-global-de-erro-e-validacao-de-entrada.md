# Story 1.4: Implementar contrato global de erro e validacao de entrada

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want padronizar validacao e erro HTTP globalmente,
so that o frontend receba respostas previsiveis e acionaveis em qualquer endpoint.

## Acceptance Criteria

1. O erro segue shape consistente com `statusCode`, `code`, `message`, `details`.
2. A validacao de entrada usa `zod` como padrao da API.
3. Erros de validacao usam `details` como array de objetos com `field`, `message` e `code`.
4. Detalhes internos de banco ou stack traces nao sao expostos ao cliente.

## Tasks / Subtasks

- [x] Implementar o contrato global de erro em `api/src/common/filters` (AC: 1, 4)
  - [x] Criar um filtro global HTTP que normalize `HttpException` e excecoes inesperadas para o shape `statusCode`, `code`, `message`, `details`
  - [x] Mapear falhas inesperadas para `INTERNAL_SERVER_ERROR` sem vazar stack trace ou detalhes internos do backend
  - [x] Preservar codigos HTTP corretos para erros ja conhecidos, inclusive `400`, `404` e `500`
- [x] Implementar validacao de entrada com `zod` em `api/src/common/pipes` (AC: 2, 3)
  - [x] Adicionar a dependencia `zod` ao projeto, se ainda nao estiver instalada
  - [x] Criar um pipe reutilizavel de validacao com schema `zod`
  - [x] Converter issues do `zod` para `details` no formato `{ field, message, code }`
- [x] Integrar filtro e validacao ao bootstrap atual sem antecipar dominio `tasks` (AC: 1, 2, 3, 4)
  - [x] Registrar o filtro global no bootstrap compartilhado atual
  - [x] Manter a configuracao existente de prefixo `/api/v1`, CORS e Swagger funcionando
  - [x] Criar explicitamente um controller minimo de apoio para esta fundacao, com uma rota versionada de validacao por payload e outra rota versionada que lance erro inesperado controlado para o e2e, sem introduzir ainda modulo `tasks`
- [x] Cobrir o comportamento com testes unitarios e e2e (AC: 1, 2, 3, 4)
  - [x] Adicionar testes unitarios para o filtro global e para o pipe `zod` quando houver logica relevante
  - [x] Atualizar ou ampliar o e2e para validar erro padronizado de validacao e erro inesperado normalizado
  - [x] Garantir que os testes continuem reprodutiveis com `.env.test`
- [x] Validar a fundacao de erro/validacao antes de concluir a story (AC: 1, 2, 3, 4)
  - [x] Executar `npm run lint`
  - [x] Executar `npm run build`
  - [x] Executar `npm test -- --runInBand`
  - [x] Executar `npm run test:e2e -- --runInBand`

## Dev Notes

- Esta story estabelece o contrato transversal de erro e validacao na borda HTTP. Ela nao deve implementar ainda o dominio `tasks`, CRUD completo, schema Prisma de `Task` ou queries de repositorio.
- O objetivo e sair com uma fundacao em que qualquer endpoint atual ou futuro possa devolver erros acionaveis e consistentes para o frontend.
- A arquitetura ja decidiu que a validacao padrao sera com `zod`, que os erros devem seguir shape fixo e que detalhes internos do servidor nao podem sair na resposta.
- Como o projeto ainda nao possui `TasksModule`, a demonstracao do pipe/filtro deve usar um controller minimo de apoio dedicado a esta fundacao, em vez de distorcer o `AppController` atual ou introduzir escopo de dominio prematuro.

### Project Structure Notes

- O filtro global deve nascer em `api/src/common/filters/http-exception.filter.ts`.
- O pipe de validacao com `zod` deve nascer em `api/src/common/pipes/`, mantendo a preocupacao de validacao fora de controllers concretos de dominio.
- A prova minima da story deve nascer em um controller pequeno e explicitamente tecnico, separado do `AppController` de hello-world, para exercitar:
  - uma rota `POST` versionada com payload simples validado por `zod`
  - uma rota `GET` versionada que lance erro inesperado controlado para o filtro global
- Se forem necessarios contratos reutilizaveis para o shape de erro, prefira `api/src/shared/contracts/` ou tipos simples em `api/src/common/` sem exagerar na estrutura.
- A configuracao global deve reaproveitar o bootstrap central existente em `api/src/config/app.config.ts`.
- Nao criar ainda `src/modules/tasks` concretos, repositorios ou DTOs de negocio completos.

### Technical Requirements

- Stack obrigatoria desta story: NestJS 11, TypeScript strict, `zod` para validacao e filtro global de excecao no Nest.
- O shape de erro da API deve ser sempre:
  - `statusCode`
  - `code`
  - `message`
  - `details`
- Para validacao, `details` deve ser um array de objetos com:
  - `field`
  - `message`
  - `code`
- O pipe com `zod` deve operar na borda de entrada e falhar com erro HTTP consistente, em vez de devolver `ZodError` cru.
- O filtro global deve tratar tanto `HttpException` quanto excecoes inesperadas, normalizando a resposta sem vazar `stack`, `cause` ou mensagens de infraestrutura.
- O dev nao deve improvisar a prova dessa story dentro do `GET /api/v1` atual; a estrategia minima esperada e um endpoint de validacao dedicado e um endpoint dedicado para excecao inesperada controlada.
- Nao introduzir `class-validator` ou `class-transformer`; a estrategia oficial do projeto continua sendo `zod`.
- A story deve continuar compativel com o bootstrap global implantado na `1.3`.

### Architecture Compliance

- Seguir a exigencia de contrato de erro padronizado com `statusCode`, `code`, `message`, `details`.
- Implementar validacao na borda HTTP com `zod`, conforme decisoes arquiteturais ja fechadas.
- Nao vazar detalhes internos de banco, stack traces ou mensagens tecnicas nao tratadas para o cliente.
- Manter controllers apenas com preocupacoes HTTP; pipe e filtro devem concentrar o comportamento transversal.
- Preservar `camelCase` em payloads e respostas.

### Library / Framework Requirements

- A documentacao oficial atual do Nest confirma que exception filters sao o mecanismo apropriado para controle global do formato de resposta de erro. [Source: https://docs.nestjs.com/exception-filters]
- A documentacao oficial atual do Nest para pipes mostra explicitamente o uso de `zod` em um pipe customizado que valida entrada na borda do sistema e dispara excecao quando necessario. [Source: https://docs.nestjs.com/pipes]
- A documentacao oficial atual do Zod 4 mostra que os erros ficam em `error.issues` e que a formatacao pode ser derivada dessas issues; isso e suficiente para montar `details` estavel com `field`, `message` e `code`. [Source: https://zod.dev/error-customization]
- A documentacao oficial atual do Zod 4 tambem registra a continuidade estrutural das issues e a mudanca de APIs de formatacao, o que reforca que devemos trabalhar a partir de `issues` em vez de depender de helpers depreciados. [Source: https://zod.dev/v4/changelog]

### File Structure Requirements

- Arquivos provaveis desta story:
  - `api/package.json`
  - `api/package-lock.json`
  - `api/src/config/app.config.ts`
  - `api/src/common/filters/http-exception.filter.ts`
  - `api/src/common/pipes/zod-validation.pipe.ts`
  - `api/src/common/` ou `api/src/modules/` com um controller minimo de apoio para validacao/erro desta fundacao
  - `api/src/app.module.ts` se for necessario registrar esse controller/provider auxiliar
  - `api/src/app.controller.spec.ts`
  - `api/test/app.e2e-spec.ts`
- Arquivos opcionais, se ajudarem a manter o contrato claro:
  - `api/src/shared/contracts/error-response.contract.ts`
  - `api/src/common/utils/` para mapeadores pequenos de erro
- Evitar criar estrutura de dominio `tasks` nesta story.

### Testing Requirements

- Validar com:
  - `npm run lint`
  - `npm run build`
  - `npm test -- --runInBand`
  - `npm run test:e2e -- --runInBand`
- O e2e desta story deve provar pelo menos:
  - uma falha de validacao em rota dedicada retornando `400` com `code` estavel e `details` estruturado
  - uma excecao inesperada em rota dedicada retornando erro padronizado sem vazamento de stack trace
- Os testes devem continuar reaproveitando `.env.test` e o bootstrap compartilhado.
- Nao e necessario criar ainda testes de CRUD de `tasks`.

### Previous Story Learnings

- A `1.2` consolidou `PrismaModule` e `DATABASE_URL` explicita; o contrato de erro desta story nao deve expor detalhes vindos dessa infraestrutura.
- A `1.3` consolidou um bootstrap compartilhado em `src/config/app.config.ts`; filtro global e qualquer configuracao transversal nova devem ser plugados ali para evitar divergencia entre runtime e e2e.
- O `AppController` versionado e o e2e atual continuam como ancora de bootstrap, mas a prova desta story deve ficar em endpoints tecnicos dedicados para validacao e erro inesperado.
- O projeto ja valida lint, build, unit e e2e com sucesso; preserve essa rotina como criterio de conclusao.
- O repositório continua sem `TasksModule`, entao esta story precisa demonstrar validacao/erro sem empurrar implementacao de dominio cedo demais.

### Git Intelligence

- O historico Git local visivel continua minimo (`feat: Projeto iniciado`), entao os guardrails mais confiaveis para esta story continuam vindo de arquitetura e dos artifacts `1.2` e `1.3`.

### Latest Tech Information

- Em 2026-03-30, a documentacao oficial do Nest continua recomendando exception filters para controlar o fluxo e o shape exato de respostas de erro. [Source: https://docs.nestjs.com/exception-filters]
- Em 2026-03-30, a documentacao oficial do Nest continua mostrando um pipe customizado com `zod` como abordagem valida para validacao na borda. [Source: https://docs.nestjs.com/pipes]
- Em 2026-03-30, a documentacao oficial do Zod 4 continua orientando o consumo das `issues` do erro como base principal para customizacao e serializacao de falhas de validacao. [Source: https://zod.dev/error-customization]

### References

- Story source e acceptance criteria: [Source: _bmad-output/planning-artifacts/epics.md#Story-14-Implementar-contrato-global-de-erro-e-validacao-de-entrada]
- Contrato de erro e padroes de validacao: [Source: _bmad-output/planning-artifacts/architecture.md#Format-Patterns]
- Filtro global, validacao com `zod` e anti-patterns: [Source: _bmad-output/planning-artifacts/architecture.md#Process-Patterns]
- Estrutura esperada para `common/filters` e `common/pipes`: [Source: _bmad-output/planning-artifacts/architecture.md#Project-Structure-&-Boundaries]
- Learnings de bootstrap compartilhado e e2e: [Source: _bmad-output/implementation-artifacts/1-3-padronizar-bootstrap-http-cors-versionamento-e-swagger.md]
- Learnings da fundacao Prisma e setup de ambiente: [Source: _bmad-output/implementation-artifacts/1-2-configurar-prisma-e-conexao-postgresql-com-migrations-iniciais.md]

## Dev Agent Record

### Agent Model Used

Codex (GPT-5 family)

### Debug Log References

- A proxima story em backlog detectada no `sprint-status.yaml` foi `1-4-implementar-contrato-global-de-erro-e-validacao-de-entrada`.
- A arquitetura ja define `http-exception.filter.ts` em `src/common/filters` e validacao com `zod` em `common/pipes`, o que guiou os destinos sugeridos para a implementacao.
- A story anterior introduziu bootstrap compartilhado em `src/config/app.config.ts`; esta story foi desenhada para plugar o comportamento global ali em vez de espalhar configuracao.
- O projeto ainda nao possui `TasksModule`, entao a story foi escrita para provar validacao e erro padronizado com um controller tecnico minimo e dedicado, sem criar dominio prematuramente.
- `zod` foi instalado como dependencia de runtime para alinhar a validacao real do projeto com a decisao arquitetural.
- O filtro global foi registrado no bootstrap compartilhado para manter runtime e e2e sob a mesma configuracao.
- O modulo tecnico `foundation` foi criado apenas para provar validacao e normalizacao de erro sem antecipar o dominio `tasks`.

### Completion Notes List

- Story context criado para a `1.4` com foco em filtro global de erro e validacao de entrada com `zod`.
- O escopo foi mantido transversal e sem antecipar CRUD ou modelagem `Task`.
- A story deixa explicito o shape esperado de erro, incluindo `details` estruturado para validacao.
- O contexto orienta a reutilizar o bootstrap implantado na `1.3` e os testes e2e atuais como ancora de comportamento HTTP.
- A estrategia minima de prova ficou explicita: rota dedicada de validacao com payload simples e rota dedicada de erro inesperado controlado.
- Foi implementado um filtro global que normaliza `HttpException` e erros inesperados para `statusCode`, `code`, `message` e `details`.
- Foi implementado um pipe generico com `zod` que converte `issues` para `details` no formato esperado pela arquitetura.
- O bootstrap compartilhado agora aplica o filtro global, e um modulo tecnico `foundation` prova validacao e erro inesperado em rotas versionadas dedicadas.
- Validacoes concluidas com sucesso: `npm run lint`, `npm run build`, `npm test -- --runInBand` e `npm run test:e2e -- --runInBand`.

### File List

- _bmad-output/implementation-artifacts/1-4-implementar-contrato-global-de-erro-e-validacao-de-entrada.md
- _bmad-output/implementation-artifacts/sprint-status.yaml
- api/package-lock.json
- api/package.json
- api/src/app.module.ts
- api/src/common/filters/http-exception.filter.spec.ts
- api/src/common/filters/http-exception.filter.ts
- api/src/common/pipes/zod-validation.pipe.spec.ts
- api/src/common/pipes/zod-validation.pipe.ts
- api/src/config/app.config.ts
- api/src/modules/foundation/foundation.controller.ts
- api/src/modules/foundation/foundation.module.ts
- api/src/shared/contracts/error-response.contract.ts
- api/test/app.e2e-spec.ts

### Change Log

- 2026-03-30: implementado contrato global de erro, pipe de validacao com `zod`, modulo tecnico de apoio para provas HTTP e cobertura automatizada; story promovida para `review`.
