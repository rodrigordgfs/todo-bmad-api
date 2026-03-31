# Story 1.2: Configurar Prisma e conexao PostgreSQL com migrations iniciais

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want configurar Prisma com PostgreSQL e pipeline basico de migrations,
so that a API tenha persistencia versionada e pronta para evolucao segura.

## Acceptance Criteria

1. Existe `prisma/schema.prisma` funcional com datasource PostgreSQL configurado via `DATABASE_URL`.
2. O projeto consegue gerar Prisma Client de forma reprodutivel no ambiente local.
3. A estrategia de migrations fica operacional para as proximas historias, sem antecipar a modelagem de dominio `Task`.

## Tasks / Subtasks

- [x] Instalar e inicializar a base Prisma no projeto `api/` (AC: 1, 2, 3)
  - [x] Adicionar `prisma` como dependencia de desenvolvimento e `@prisma/client` como dependencia de runtime no `package.json`
  - [x] Inicializar a estrutura oficial do Prisma dentro de `api/prisma/`, preservando `schema.prisma` como fonte de verdade relacional
  - [x] Garantir que a configuracao use PostgreSQL por `DATABASE_URL`, sem credenciais hardcoded
- [x] Preparar a configuracao local de banco para desenvolvimento (AC: 1, 3)
  - [x] Declarar `DATABASE_URL` em `.env.example` com formato PostgreSQL e schema `public`
  - [x] Criar ou ajustar `docker-compose.yml` para um PostgreSQL local de desenvolvimento, se ainda nao existir
  - [x] Evitar dependencias em ambiente externo manual para que as proximas stories consigam aplicar migrations localmente
- [x] Garantir carregamento de configuracao em runtime, nao apenas no Prisma CLI (AC: 1, 2)
  - [x] Confirmar que `DATABASE_URL` fica disponivel para a aplicacao Nest em runtime, por meio de `ConfigModule`, `dotenv/config` ou estrategia equivalente compativel com a arquitetura atual
  - [x] Evitar um setup que funcione apenas para `npx prisma ...` mas falhe quando o `PrismaService` for instanciado pela aplicacao
- [x] Estruturar a integracao do Prisma na arquitetura aprovada (AC: 1, 2)
  - [x] Criar `src/infra/database/prisma/prisma.service.ts` como unica porta de acesso ao client Prisma
  - [x] Criar `src/infra/database/prisma/prisma.module.ts` para encapsular o provider/export do `PrismaService`
  - [x] Integrar o modulo ao `AppModule` apenas no nivel de infraestrutura, sem criar ainda `TasksModule`, repositorios de dominio ou queries em controller
- [x] Tornar o pipeline de generate/validate/migrate explicito para o time (AC: 2, 3)
  - [x] Adicionar scripts npm para `prisma generate`, `prisma validate`, `prisma migrate dev`, `prisma migrate deploy` e `prisma migrate status`
  - [x] Preparar `prisma/migrations/` como local exclusivo das migrations versionadas
  - [x] Registrar na story que a primeira migration de dominio sera gerada na story `2.1`, quando o schema `Task` existir
- [x] Validar a fundacao de persistencia sem antecipar regras de negocio (AC: 1, 2, 3)
  - [x] Executar `npx prisma validate`
  - [x] Executar `npx prisma generate`
  - [x] Executar `npm run build`
  - [x] Validar, se houver PostgreSQL local disponivel, que a conexao base responde sem criar schema de dominio artificial

## Dev Notes

- Esta story prepara a infraestrutura de persistencia. Ela nao deve implementar a entidade `Task`, CRUD, DTOs de dominio, validacao com `zod`, Swagger ou contrato global de erro.
- O objetivo aqui e deixar Prisma + PostgreSQL + pipeline de migrations preparados para destravar as stories `1.3`, `1.4` e principalmente `2.1`.
- A story anterior confirmou a base NestJS em `api/`, `strict: true`, estrutura modular inicial e placeholders em `src/modules`, `src/common`, `src/infra`, `src/shared` e `prisma`.
- A implementacao deve aprender com a `1.1`: manter a aplicacao em `api/`, preservar a organizacao arquitetural e validar com comandos reais em vez de assumir sucesso.

### Project Structure Notes

- O caminho oficial da aplicacao continua sendo `api/`.
- `prisma/schema.prisma` deve permanecer como fonte de verdade do banco.
- `prisma/migrations/` e o unico local permitido para migrations versionadas.
- A infraestrutura de banco deve nascer em `src/infra/database/prisma/`.
- Nao criar arquivos de dominio `tasks` nesta story.
- Nao mover codigo de infraestrutura para `src/common` ou `src/shared`.

### Technical Requirements

- Stack obrigatoria: NestJS + TypeScript strict + Prisma ORM + PostgreSQL.
- A conexao do datasource deve usar `DATABASE_URL` e nao valores inline no schema.
- A story deve preparar o pipeline de migrations, mas sem inventar schema de negocio apenas para forcar uma migration.
- Se a versao instalada do Prisma gerar client em caminho customizado, o import do `PrismaService` deve ser consistente com esse output.
- A compatibilidade do Prisma gerado com o runtime atual do Nest deve ser verificada explicitamente. Se a versao instalada exigir ajuste de `generator` para o formato de modulo usado pelo projeto, isso deve ser configurado nesta story em vez de ser deixado para debug posterior.
- A integracao com Prisma deve respeitar a separacao `Controller -> Service -> Repository -> PrismaService -> PostgreSQL`, mesmo que nesta story apenas a camada de infraestrutura seja criada.

### Architecture Compliance

- Prisma deve ficar isolado fora de controllers.
- Nenhum controller deve executar query Prisma diretamente.
- `camelCase` deve ser mantido em TypeScript, JSON e futuros campos Prisma.
- A configuracao criada agora nao pode conflitar com a estrategia futura de validacao com `zod`.
- Nao expor detalhes internos de banco para consumidores HTTP.

### Library / Framework Requirements

- A recipe oficial atual do Nest para Prisma mostra `prisma/schema.prisma`, `prisma.config.ts` e `.env` como base inicial do setup, alem de orientar o uso do CLI local via `npx prisma`. [Source: https://docs.nestjs.com/recipes/prisma]
- A recipe oficial atual do Nest para Prisma tambem alerta para compatibilidade do Prisma Client com o formato de modulo do projeto, incluindo ajuste de `generator` quando necessario. [Source: https://docs.nestjs.com/recipes/prisma]
- A documentacao oficial do Prisma CLI mantem `init`, `generate` e `validate` como comandos basicos de setup e verificacao. [Source: https://docs.prisma.io/docs/cli]
- A documentacao oficial de migrations define `prisma migrate dev` para criar/aplicar migrations em desenvolvimento, `migrate deploy` para aplicar pendencias e `migrate status` para inspecao do estado das migrations. [Source: https://docs.prisma.io/docs/cli/migrate]

### File Structure Requirements

- Arquivos esperados ao final desta story:
  - `api/prisma/schema.prisma`
  - `api/prisma/migrations/`
  - `api/src/infra/database/prisma/prisma.module.ts`
  - `api/src/infra/database/prisma/prisma.service.ts`
  - `api/.env.example`
  - `api/package.json`
- Arquivos opcionais, se necessarios ao setup real da versao instalada:
  - `api/prisma.config.ts`
  - `api/docker-compose.yml` ou `docker-compose.yml` na raiz, desde que a decisao seja consistente para o projeto

### Testing Requirements

- Validar ao menos:
  - `npx prisma validate`
  - `npx prisma generate`
  - `npm run build`
  - boot da aplicacao com o modulo Prisma importado, para confirmar que `DATABASE_URL` esta disponivel tambem em runtime
- Se houver PostgreSQL local operacional:
  - validar a leitura da `DATABASE_URL`
  - validar que o pipeline de migrations responde corretamente sem exigir schema de dominio prematuro
- Nao e necessario criar testes de dominio nesta story, mas qualquer logica adicionada ao `PrismaService` deve seguir o padrao de testes co-localizados quando fizer sentido.

### Previous Story Learnings

- `api/` ja esta inicializado e validado com lint, build, testes e boot real; reaproveite essa base em vez de recriar scaffolding.
- A story `1.1` proibiu explicitamente adiantar Prisma, Swagger, `zod` e dominio `tasks`; esta `1.2` deve adicionar apenas a fundacao de persistencia.
- Decisoes arquiteturais ja fechadas para o futuro:
  - `status` sera enum
  - `tags` sera `String[]`
  - validacao de entrada sera com `zod`
  - `details` de erro sera array de objetos

### Latest Tech Information

- Em `2026-03-30`, a recipe oficial do Nest para Prisma continua recomendando setup local do Prisma CLI, estrutura `prisma/` dedicada e configuracao explicita do generator/output para o client. [Source: https://docs.nestjs.com/recipes/prisma]
- Em `2026-03-30`, a documentacao oficial do Prisma continua listando `init`, `generate` e `validate` como fluxo base de setup do ORM. [Source: https://docs.prisma.io/docs/cli]
- Em `2026-03-30`, a documentacao oficial do Prisma continua definindo `migrate dev` como comando de desenvolvimento para criar/aplicar migrations e `migrate deploy` para aplicar migrations pendentes em ambientes nao dev. [Source: https://docs.prisma.io/docs/cli/migrate]

### References

- Epic e acceptance criteria da story: [Source: _bmad-output/planning-artifacts/epics.md#Story-12-Configurar-Prisma-e-conexao-PostgreSQL-com-migrations-iniciais]
- Starter e stack aprovada: [Source: _bmad-output/planning-artifacts/architecture.md#Selected-Starter-NestJS-CLI-+-Prisma-+-PostgreSQL]
- Regras de estrutura e boundaries: [Source: _bmad-output/planning-artifacts/architecture.md#Project-Structure-&-Boundaries]
- Pattern enforcement e isolamento do Prisma: [Source: _bmad-output/planning-artifacts/architecture.md#Communication-Patterns]
- Mapeamento de estrutura, banco e integracao: [Source: _bmad-output/planning-artifacts/architecture.md#Requirements-to-Structure-Mapping]
- Aprendizados da story anterior: [Source: _bmad-output/implementation-artifacts/1-1-inicializar-projeto-nestjs-com-base-tipada-e-estrutura-modular.md]

## Dev Agent Record

### Agent Model Used

Codex (GPT-5 family)

### Debug Log References

- `npx prisma init --datasource-provider postgresql` nao pode ser usado diretamente porque `api/prisma/` ja existia como placeholder da story `1.1`; o setup foi criado manualmente nessa pasta.
- Prisma 7.6.0 rejeitou `url` dentro do `datasource` no `schema.prisma`; a conexao ficou centralizada em `prisma.config.ts` e no adapter `PrismaPg` em runtime.
- A primeira tentativa com generator `prisma-client` gerou incompatibilidade com `ts-jest` nos testes e2e; o projeto foi ajustado para `prisma-client-js`, mantendo compatibilidade com Nest, Jest e Prisma 7.
- O boot manual do app subiu o `PrismaModule` com sucesso e so falhou no `listen` por restricao de sandbox (`EPERM`), nao por erro de implementacao.
- `npm run test:e2e -- --runInBand` precisou ser rerodado fora do sandbox por bloqueio de porta local; fora do sandbox o teste passou.
- Apos code review, `start:prod` foi corrigido para apontar ao entrypoint real em `dist/src/main.js`.
- Em refinamento posterior, o fallback automatico de `DATABASE_URL` foi removido para evitar credenciais hardcoded e acoplamento implicito com `localhost` em testes ou CI.

### Completion Notes List

- Setup de Prisma/PostgreSQL concluido com `prisma.config.ts`, `prisma/schema.prisma`, `.env.example`, `.env` local e `docker-compose.yml` para desenvolvimento.
- `PrismaModule` e `PrismaService` foram adicionados em `src/infra/database/prisma/` e integrados ao `AppModule` sem antecipar dominio `tasks`.
- Scripts de `generate`, `validate` e `migrate` foram adicionados ao `package.json`, e `prisma/migrations/` ficou preparado para receber a primeira migration real da story `2.1`.
- Validacoes concluidas com sucesso: `npm run prisma:validate`, `npm run prisma:generate`, `npm run build`, `npm run lint`, `npm test -- --runInBand` e `npm run test:e2e -- --runInBand` (fora do sandbox).
- O boot do app confirmou carregamento de ambiente e inicializacao do `PrismaModule`; a tentativa de `listen` local no sandbox falhou por restricao do ambiente, nao por defeito do codigo.
- O script `start:prod` ficou alinhado com o output real do build do Nest neste projeto.
- O `PrismaService` agora depende sempre de `DATABASE_URL` explicita, inclusive em testes, evitando fallback local silencioso.

### File List

- api/.env
- api/.env.example
- api/.gitignore
- api/docker-compose.yml
- api/package-lock.json
- api/package.json
- api/prisma.config.ts
- api/prisma/migrations/.gitkeep
- api/prisma/schema.prisma
- api/src/app.module.ts
- api/src/main.ts
- api/src/infra/database/prisma/prisma.module.ts
- api/src/infra/database/prisma/prisma.service.ts
- _bmad-output/implementation-artifacts/1-2-configurar-prisma-e-conexao-postgresql-com-migrations-iniciais.md
- _bmad-output/implementation-artifacts/sprint-status.yaml

### Change Log

- 2026-03-30: configurado Prisma 7 com PostgreSQL, adapter `@prisma/adapter-pg`, scripts de CLI, `PrismaModule`/`PrismaService`, `.env.example`, `.env` local e `docker-compose` de desenvolvimento; story promovida para `review`.
- 2026-03-30: apos code review, corrigido `start:prod` para o caminho real do build.
- 2026-03-30: removido fallback automatico de `DATABASE_URL` para manter configuracao explicita e evitar credenciais hardcoded em testes.
