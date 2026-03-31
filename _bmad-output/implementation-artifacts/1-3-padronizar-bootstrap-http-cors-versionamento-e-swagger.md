# Story 1.3: Padronizar bootstrap HTTP, CORS, versionamento e Swagger

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want configurar bootstrap da API com `/api/v1`, CORS local e Swagger,
so that o frontend consiga integrar e a documentacao do MVP fique disponivel desde o inicio.

## Acceptance Criteria

1. A API expoe rotas sob o prefixo `/api/v1`.
2. CORS permite consumo pelo frontend local configurado.
3. Swagger/OpenAPI fica disponivel com os endpoints documentaveis do MVP.

## Tasks / Subtasks

- [x] Padronizar o bootstrap HTTP em `api/src/main.ts` com prefixo global e versionamento URI (AC: 1)
  - [x] Adicionar `app.setGlobalPrefix('api')` no bootstrap
  - [x] Habilitar `app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' })` para materializar `/api/v1`
  - [x] Versionar explicitamente a rota HTTP minima ja existente (`AppController`) para que uma rota real continue respondendo sob `/api/v1` apos ativar URI versioning
  - [x] Preservar o `AppModule` atual e nao introduzir ainda `TasksModule` nesta story
- [x] Configurar CORS para integracao local previsivel com o frontend (AC: 2)
  - [x] Definir origem local de desenvolvimento por configuracao explicita, sem abrir CORS genericamente em producao
  - [x] Aplicar `app.enableCors(...)` com opcoes coerentes com SPA local
  - [x] Registrar em `.env.example` a variavel necessaria para origem do frontend, se o bootstrap passar a depender dela
- [x] Habilitar Swagger/OpenAPI no bootstrap inicial da API (AC: 3)
  - [x] Instalar `@nestjs/swagger` se ainda nao estiver no projeto
  - [x] Configurar `SwaggerModule` e `DocumentBuilder` no bootstrap com metadados minimos do MVP
  - [x] Expor a UI Swagger e o JSON OpenAPI em rota previsivel, preferencialmente coerente com o prefixo global
- [x] Ajustar testes e contratos de smoke para refletir o novo bootstrap (AC: 1, 2, 3)
  - [x] Atualizar o e2e atual para validar o prefixo versionado em vez de depender de `GET /`
  - [x] Garantir que os testes continuem carregando `DATABASE_URL` de forma reprodutivel via `.env.test`
  - [x] Adicionar validacao minima de disponibilidade do Swagger sem acoplar a historia a endpoints de dominio inexistentes
- [x] Validar a fundacao HTTP/documentacao sem antecipar dominio `tasks` (AC: 1, 2, 3)
  - [x] Executar `npm run build`
  - [x] Executar `npm test -- --runInBand`
  - [x] Executar `npm run test:e2e -- --runInBand`
  - [x] Confirmar em boot real ou teste e2e que o app sobe com prefixo, versionamento e Swagger ativos

## Dev Notes

- Esta story trata apenas do bootstrap HTTP e da experiencia de integracao inicial da API. Ela nao deve implementar ainda `Task`, CRUD, schemas Prisma de dominio, filtros globais de erro ou validacao com `zod`; esses itens pertencem principalmente as stories `1.4` e `2.x`.
- O objetivo e sair desta story com uma fundacao HTTP estavel para o frontend local, com rotas versionadas, CORS controlado e documentacao OpenAPI ligada desde cedo.
- A arquitetura ja definiu que a API usa prefixo `/api/v1`, CORS para o frontend local e Swagger/OpenAPI desde o inicio. Esta story e a materializacao tecnica dessas decisoes no `main.ts`.
- Como ainda nao existe `TasksModule`, o Swagger pode inicialmente documentar apenas os endpoints ja presentes no app. O importante e habilitar o pipeline/documentacao, nao inventar endpoints de dominio antes da hora.
- O `AppController` atual expõe `GET /`; ao ligar URI versioning, a story deve orientar o dev a anotar essa rota/controlador com versao `1` ou substitui-la por outra rota minima real sob `/api/v1`, para evitar `404` geral apos o bootstrap.

### Project Structure Notes

- O bootstrap continua centralizado em `api/src/main.ts`.
- `AppModule` segue como modulo-raiz em `api/src/app.module.ts`.
- Configuracoes compartilhadas futuras podem migrar para `src/config`, mas nesta story vale preferir a menor mudanca coerente com a base atual.
- Nao criar ainda `src/modules/tasks` concretos, filtros globais de erro, pipes de validacao ou contratos de dominio.
- Se novos testes e2e forem adicionados, eles devem permanecer em `api/test/` por enquanto, seguindo a estrutura atual do projeto.

### Technical Requirements

- Stack obrigatoria desta story: NestJS 11, TypeScript strict, bootstrap HTTP via `src/main.ts`.
- A API deve combinar prefixo global `api` com versionamento URI em `v1`, resultando em rotas externas no formato `/api/v1/...`.
- O versionamento deve usar a estrategia oficial do Nest para URI versioning, evitando prefixos manuais hardcoded em controllers nesta etapa.
- O dev nao deve assumir que `defaultVersion: '1'` sozinho versiona controllers existentes; a rota minima atual precisa ser marcada com versao `1` ou trocada por uma rota equivalente explicitamente versionada.
- CORS deve privilegiar consumo do frontend local em desenvolvimento, mas sem cair em `origin: true` ou `*` por inercia se uma origem explicita puder ser configurada.
- Swagger deve nascer no bootstrap usando `@nestjs/swagger`, com `DocumentBuilder` e `SwaggerModule`, sem gerar docs artificiais fora do app real.
- Nao introduzir wrappers customizados de sucesso nem alterar o contrato de resposta padrao do MVP.
- Nao adicionar `class-validator` ou `class-transformer`; a estrategia futura de validacao continua sendo `zod`.

### Architecture Compliance

- Seguir a decisao arquitetural de REST JSON versionado em `/api/v1`.
- Manter controllers limitados a preocupacoes HTTP; esta story nao deve puxar Prisma para camada de controller.
- Preservar `camelCase` em codigo, configuracoes e futuros campos de resposta JSON.
- CORS e Swagger devem ser configurados no bootstrap da aplicacao, nao espalhados por features sem necessidade.
- A implementacao precisa continuar compativel com a futura cadeia `Controller -> Service -> Repository -> PrismaService -> PostgreSQL`.

### Library / Framework Requirements

- A documentacao oficial atual do Nest para versionamento confirma que URI versioning adiciona a versao depois do prefixo global, o que se alinha ao contrato `/api/v1`. [Source: https://docs.nestjs.com/techniques/versioning]
- A documentacao oficial atual do Nest para CORS recomenda `app.enableCors()` ou a opcao `cors` no `NestFactory.create`, com objeto de configuracao quando o comportamento precisar ser customizado. [Source: https://docs.nestjs.com/security/cors]
- A documentacao oficial atual do Nest para OpenAPI mostra `@nestjs/swagger` com `DocumentBuilder`, `SwaggerModule.createDocument()` e `SwaggerModule.setup()` no `main.ts` como fluxo padrao de bootstrap. [Source: https://docs.nestjs.com/openapi/introduction]
- O projeto atual usa `@nestjs/common`, `@nestjs/core` e `@nestjs/platform-express` na linha 11 do Nest, entao a story deve manter compatibilidade com esse stack real em `api/package.json`.

### File Structure Requirements

- Arquivos que provavelmente serao tocados nesta story:
  - `api/src/main.ts`
  - `api/src/app.module.ts` apenas se for preciso registrar modulos/config minima
  - `api/package.json`
  - `api/package-lock.json`
  - `api/.env.example`
  - `api/.env.test` se o e2e precisar de origem de frontend previsivel
  - `api/test/app.e2e-spec.ts`
  - `api/test/jest-e2e.json` e `api/test/setup-env.ts` apenas se houver necessidade de nova variavel de ambiente no setup
- Arquivos opcionais, se a implementacao ficar mais clara com configuracao dedicada sem exagero:
  - `api/src/config/swagger.config.ts`
  - `api/src/config/app.config.ts`
- Evitar criar estrutura de `tasks` ou arquivos de dominio fora do escopo.

### Testing Requirements

- Validar o bootstrap principal com:
  - `npm run build`
  - `npm test -- --runInBand`
  - `npm run test:e2e -- --runInBand`
- Atualizar o smoke e2e para refletir o contrato novo de bootstrap:
  - rota versionada disponivel sob `/api/v1`
  - Swagger UI ou JSON acessivel em rota acordada
- O smoke deve validar a rota minima realmente exposta pelo app apos o versionamento, nao apenas trocar `GET /` por `/api/v1` sem garantir que o controller correspondente foi anotado com versao.
- Se a rota raiz `/` deixar de ser relevante, os testes devem ser ajustados em vez de preservar um comportamento legado sem valor arquitetural.
- Nao e necessario criar testes de dominio; o foco e saude do bootstrap HTTP e documentacao.

### Previous Story Learnings

- `api/` ja esta inicializado, compila e possui setup de testes unitarios/e2e funcionando; reutilize essa base em vez de recriar scaffolding.
- A story `1.2` consolidou `dotenv/config`, `PrismaModule` e `DATABASE_URL` explicita; o bootstrap novo nao deve quebrar esse carregamento.
- Os testes agora carregam ambiente versionado por `api/.env.test` via `api/test/setup-env.ts`; se CORS depender de novas variaveis, mantenha esse padrao reproduzivel.
- O script `start:prod` ja foi ajustado para `dist/src/main.js`; alteracoes no bootstrap devem continuar compatveis com esse output.
- Ainda nao existe modulo de dominio `tasks`, entao esta story deve habilitar a infraestrutura HTTP/documental sem antecipar controllers de negocio.
- O `AppController` atual e o smoke e2e existente sao a ancora minima desta story; use-os para provar o bootstrap versionado antes de existir qualquer endpoint de dominio real.

### Git Intelligence

- O historico Git local disponivel ainda e minimo (`feat: Projeto iniciado`), entao os padroes mais confiaveis para esta story vem dos artefatos `1.1`, `1.2` e da arquitetura, nao de uma sequencia rica de commits intermediarios.

### Latest Tech Information

- Em 2026-03-30, a documentacao oficial do Nest continua recomendando URI versioning via `app.enableVersioning({ type: VersioningType.URI })`, e ela observa que a versao entra depois do prefixo global, o que sustenta a estrategia `/api/v1`. [Source: https://docs.nestjs.com/techniques/versioning]
- Em 2026-03-30, a documentacao oficial do Nest continua recomendando habilitar CORS com `app.enableCors()` e customizar por objeto de configuracao quando necessario. [Source: https://docs.nestjs.com/security/cors]
- Em 2026-03-30, a documentacao oficial do Nest continua mostrando `@nestjs/swagger` com `DocumentBuilder` e `SwaggerModule.setup()` no bootstrap como caminho padrao para expor UI e documento OpenAPI. [Source: https://docs.nestjs.com/openapi/introduction]

### References

- Story source e acceptance criteria: [Source: _bmad-output/planning-artifacts/epics.md#Story-13-Padronizar-bootstrap-HTTP-CORS-versionamento-e-Swagger]
- Decisoes de API, CORS, versionamento e Swagger: [Source: _bmad-output/planning-artifacts/architecture.md#API-&-Communication-Patterns]
- Boundaries e estrutura do projeto: [Source: _bmad-output/planning-artifacts/architecture.md#Project-Structure-&-Boundaries]
- Pattern enforcement e anti-patterns: [Source: _bmad-output/planning-artifacts/architecture.md#Communication-Patterns]
- Learnings da base Nest inicial: [Source: _bmad-output/implementation-artifacts/1-1-inicializar-projeto-nestjs-com-base-tipada-e-estrutura-modular.md]
- Learnings da fundacao Prisma e do setup de testes: [Source: _bmad-output/implementation-artifacts/1-2-configurar-prisma-e-conexao-postgresql-com-migrations-iniciais.md]

## Dev Agent Record

### Agent Model Used

Codex (GPT-5 family)

### Debug Log References

- A proxima story em backlog detectada no `sprint-status.yaml` foi `1-3-padronizar-bootstrap-http-cors-versionamento-e-swagger`.
- O projeto atual ainda nao possui `TasksModule`; a story foi desenhada para habilitar o bootstrap HTTP/documentacao sem antecipar endpoints de dominio.
- O estado atual do repositiorio mostra `src/main.ts` ainda minimalista, o que torna esta story o ponto correto para materializar prefixo global, versionamento, CORS e Swagger.
- A configuracao de testes ja usa `.env.test` versionado; isso foi incorporado como guardrail para qualquer nova dependencia de ambiente.
- `@nestjs/swagger` foi instalado como dependencia adicional da story para habilitar a documentacao OpenAPI no bootstrap real do app.
- O bootstrap compartilhado foi extraido para configuracao reutilizavel entre `main.ts` e o e2e, evitando divergencia entre teste e runtime.

### Completion Notes List

- Story context criado para a `1.3` com foco em bootstrap HTTP, CORS local, versionamento URI e Swagger.
- O escopo foi mantido sem antecipar modulo `tasks`, filtros globais de erro ou validacao com `zod`, que pertencem a historias posteriores.
- A story inclui ajustes esperados de teste para refletir o novo contrato `/api/v1` e a disponibilidade do Swagger.
- A story deixa explicito que a rota minima existente deve ser versionada de forma deliberada para evitar regressao para `404` ao ativar URI versioning.
- O contexto traz guardrails arquiteturais, padroes de projeto e referencias oficiais atuais do Nest para evitar implementacao divergente.
- O bootstrap agora aplica prefixo global `api`, URI versioning `v1`, CORS com origem configuravel e Swagger com UI e JSON OpenAPI.
- O `AppController` foi versionado como ancora minima para manter uma rota real disponivel em `/api/v1`.
- O e2e passou a validar tanto a rota versionada quanto a exposicao do documento Swagger.
- Validacoes concluidas com sucesso: `npm run lint`, `npm run build`, `npm test -- --runInBand` e `npm run test:e2e -- --runInBand`.

### File List

- _bmad-output/implementation-artifacts/1-3-padronizar-bootstrap-http-cors-versionamento-e-swagger.md
- _bmad-output/implementation-artifacts/sprint-status.yaml
- api/.env.example
- api/.env.test
- api/package-lock.json
- api/package.json
- api/src/app.controller.ts
- api/src/config/app.config.ts
- api/src/config/swagger.config.ts
- api/src/main.ts
- api/test/app.e2e-spec.ts

### Change Log

- 2026-03-30: implementado bootstrap HTTP com prefixo `/api/v1`, CORS configuravel para frontend local, Swagger/OpenAPI e e2e alinhado com o runtime real; story promovida para `review`.
