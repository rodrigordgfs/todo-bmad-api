# Story 1.1: Inicializar projeto NestJS com base tipada e estrutura modular

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want inicializar a API com NestJS, TypeScript strict e estrutura base definida,
so that o projeto comece alinhado com a arquitetura aprovada.

## Acceptance Criteria

1. A estrutura principal do projeto existe com `src/modules`, `src/common`, `src/infra`, `src/shared`, `prisma` e `test`.
2. O projeto compila e sobe em ambiente local sem erros.
3. A configuracao usa TypeScript strict e padroes de organizacao definidos em arquitetura.

## Tasks / Subtasks

- [x] Inicializar o projeto NestJS na pasta `/api` do repositorio usando o starter definido (AC: 1, 2, 3)
  - [x] Executar o scaffold com Nest CLI em modo strict e com `npm`
  - [x] Garantir que os arquivos-base do Nest sejam gerados na raiz correta, sem criar subpasta extra
  - [x] Confirmar que `src/`, `test/`, `package.json`, `nest-cli.json`, `tsconfig.json` e `tsconfig.build.json` existam
- [x] Reorganizar a estrutura para aderir ao desenho arquitetural aprovado (AC: 1, 3)
  - [x] Criar diretorios vazios ou com placeholders minimos para `src/modules`, `src/common`, `src/infra`, `src/shared` e `prisma`
  - [x] Manter `main.ts` e `app.module.ts` como ponto de entrada, sem introduzir modulos de dominio prematuramente
  - [x] Nao criar ainda implementacoes de `tasks`; apenas preparar a estrutura
- [x] Ajustar a configuracao do projeto para padroes de desenvolvimento acordados (AC: 2, 3)
  - [x] Verificar ou ajustar `strict` no TypeScript
  - [x] Preservar naming e organizacao definidos em arquitetura
  - [x] Preparar `.env.example` como placeholder se o scaffold nao gerar
- [x] Validar que a base sobe corretamente (AC: 2)
  - [x] Executar build ou equivalentemente validar compilacao do TypeScript
  - [x] Executar o servidor Nest e verificar boot sem erro fatal
- [x] Documentar o resultado minimo da fundacao (AC: 1, 2, 3)
  - [x] Registrar no story file quaisquer desvios necessarios do scaffold
  - [x] Listar arquivos criados/modificados na conclusao da implementacao

## Dev Notes

- Esta story e estritamente de fundacao. Ela nao deve implementar dominio `tasks`, endpoints REST, Prisma, Swagger ou Zod ainda. Esses itens pertencem as proximas historias do Epic 1 e Epic 2.
- A arquitetura aprovada define NestJS + TypeScript strict como base, com evolucao posterior para Prisma/PostgreSQL e validacao padronizada com `zod`.
- O repositorio contem artefatos de planejamento e a fundacao inicial desta story.
- O caminho oficial da aplicacao nesta story e `api/`, e nao a raiz do repositorio.

### Project Structure Notes

- A estrutura deve seguir o padrao feature-first e boundaries definidos:
  - `src/modules`
  - `src/common`
  - `src/infra`
  - `src/shared`
  - `prisma`
  - `test`
- Esta story prepara a fundacao, mas nao deve antecipar a modelagem `Task` nem criar repositorios, DTOs ou schemas de validacao do dominio.
- Preserve o scaffold padrao do Nest quando isso nao conflitar com a arquitetura. Ajuste apenas o necessario para alinhar a base do projeto.

### Technical Requirements

- Stack obrigatoria: NestJS + Node.js + TypeScript strict.
- Scaffold de referencia: `npx @nestjs/cli@latest new . --strict --package-manager npm`
- A criacao deve ocorrer dentro da pasta `api/` do projeto atual, sem subdiretorio adicional dentro dela.
- O projeto deve ficar pronto para as proximas historias:
  - `1.2` configuracao de Prisma/PostgreSQL
  - `1.3` bootstrap HTTP, CORS, versionamento e Swagger
  - `1.4` contrato global de erro e validacao com `zod`

### Architecture Compliance

- Seguir exatamente a decisao arquitetural de organizacao modular.
- Nao introduzir `class-validator` ou `class-transformer`; a estrategia aprovada para validacao futura e `zod`.
- Nao adicionar wrappers customizados de resposta, logica de dominio, ou infraestrutura de banco nesta story.
- Manter a base compativel com os padroes de erro, naming e boundaries definidos na arquitetura.

### Library / Framework Requirements

- Nest CLI oficial continua sendo a forma recomendada de criar o projeto; a documentacao oficial descreve `nest new <name>` e o uso de `--strict`. Como o projeto sera criado dentro de `api/`, adapte o comando equivalente sem quebrar a estrutura do workspace. [Source: https://docs.nestjs.com/cli/usages]
- A documentacao oficial do Nest confirma que o scaffold cria `src/` e `test/` com arquivos base de aplicacao. [Source: https://docs.nestjs.com/first-steps]
- Prisma nao deve ser configurado nesta story, mas a fundacao precisa deixar espaco para `prisma/` e para a futura integracao com PostgreSQL. [Source: D:\www\todo-bmad-api\_bmad-output\planning-artifacts\architecture.md#Starter Template Evaluation]
- Zod 4 esta estavel e e a biblioteca escolhida para validacao posterior; esta story so precisa evitar introduzir outra estrategia concorrente. [Source: https://zod.dev/]

### File Structure Requirements

- Arquivos base esperados apos esta story:
  - `package.json`
  - `nest-cli.json`
  - `tsconfig.json`
  - `tsconfig.build.json`
  - `src/main.ts`
  - `src/app.module.ts`
  - `test/`
- Diretorios arquiteturais a garantir:
  - `src/modules/`
  - `src/common/`
  - `src/infra/`
  - `src/shared/`
  - `prisma/`

### Testing Requirements

- Validar ao menos:
  - build bem-sucedido
  - boot da aplicacao sem erro fatal
- Se o scaffold criar testes default do Nest, eles podem permanecer desde que nao conflitem com a estrutura definida.
- Nao e necessario ampliar cobertura de dominio nesta story; o foco e garantir a saude da fundacao.

### Latest Tech Information

- Nest CLI atual continua suportando `nest new <name>` e opcao `--package-manager`; o scaffold padrao gera `src/` e `test/`. [Source: https://docs.nestjs.com/cli/usages]
- Prisma `init` com `--datasource-provider postgresql` permanece o caminho oficial para a proxima historia de setup do banco. [Source: https://docs.prisma.io/docs/cli/init]
- Zod 4 esta estavel no momento, reforcando que a fundacao nao deve acoplar outra biblioteca de validacao. [Source: https://zod.dev/]

### References

- Epics and story source: [Source: D:\www\todo-bmad-api\_bmad-output\planning-artifacts\epics.md#Epic-1]
- Architectural foundation and structure: [Source: D:\www\todo-bmad-api\_bmad-output\planning-artifacts\architecture.md#Project-Structure-&-Boundaries]
- Starter decision: [Source: D:\www\todo-bmad-api\_bmad-output\planning-artifacts\architecture.md#Starter-Template-Evaluation]
- Core architectural decisions: [Source: D:\www\todo-bmad-api\_bmad-output\planning-artifacts\architecture.md#Core-Architectural-Decisions]
- Implementation patterns: [Source: D:\www\todo-bmad-api\_bmad-output\planning-artifacts\architecture.md#Implementation-Patterns-&-Consistency-Rules]

## Dev Agent Record

### Agent Model Used

Codex (GPT-5 family)

### Debug Log References

- `git` passou a estar disponivel antes da execucao desta story, mas nao havia historico de codigo relevante para reaproveitar.
- O scaffold do Nest foi executado considerando a exigencia do usuario de manter a aplicacao em `api/`.
- `npm.cmd run build` precisou ser reexecutado fora do sandbox apos bloqueio `EPERM` ao atualizar `dist/`; o build final concluiu com sucesso.
- Validacoes executadas em `api/`: `npm.cmd run lint`, `npm.cmd run build`, `npm.cmd test -- --runInBand`, `npm.cmd run test:e2e -- --runInBand` e boot com `node .\\dist\\main.js`.

### Completion Notes List

- Story context criado com foco em fundacao minima e prevencao de implementacao prematura de dominio.
- Projeto NestJS inicializado com sucesso em `api/`, preservando `main.ts` e `app.module.ts` como entrada padrao.
- Estrutura arquitetural base preparada com placeholders para `src/modules`, `src/common`, `src/infra`, `src/shared` e `prisma`.
- `tsconfig.json` passou a declarar `strict: true` explicitamente e o bootstrap foi ajustado para satisfazer a regra de lint `no-floating-promises`.
- A fundacao foi validada com lint, build, teste unitario, teste e2e e boot real do servidor sem erro fatal.
- Decisoes ja fechadas e relevantes para proximas historias: `status` como enum, `tags` como `String[]`, validacao com `zod`, `details` de erro como array de objetos.

### File List

- D:\www\todo-bmad-api\_bmad-output\implementation-artifacts\1-1-inicializar-projeto-nestjs-com-base-tipada-e-estrutura-modular.md
- api/.env.example
- api/prisma/.gitkeep
- api/src/common/.gitkeep
- api/src/infra/.gitkeep
- api/src/main.ts
- api/src/modules/.gitkeep
- api/src/shared/.gitkeep
- api/tsconfig.json
- _bmad-output/implementation-artifacts/sprint-status.yaml

### Change Log

- 2026-03-30: Story 1.1 implementada em `api/` com scaffold NestJS, estrutura modular base, `strict` explicito, placeholder de ambiente e validacoes completas de fundacao.
