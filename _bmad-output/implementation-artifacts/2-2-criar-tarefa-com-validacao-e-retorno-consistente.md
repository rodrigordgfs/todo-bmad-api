# Story 2.2: Criar tarefa com validacao e retorno consistente

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a usuario do app,
I want criar uma tarefa pela API com poucos campos obrigatorios,
so that o frontend possa suportar captura rapida sem payload complexo.

## Acceptance Criteria

1. `POST /api/v1/tasks` persiste uma tarefa valida no PostgreSQL.
2. A resposta retorna o recurso criado em formato JSON consistente.
3. Payload sem `title` valido e rejeitado com erro padronizado.

## Tasks / Subtasks

- [x] Expor a criacao de tarefa via rota versionada da feature `tasks` (AC: 1, 2, 3)
  - [x] Criar `TasksController` com `POST /api/v1/tasks`
  - [x] Registrar o controller dentro de `TasksModule`, sem quebrar o bootstrap atual nem as rotas existentes
  - [x] Garantir que a resposta de sucesso devolva o recurso criado diretamente, sem wrapper `{ data: ... }`
- [x] Implementar validacao de entrada com `zod` reaproveitando a fundacao global (AC: 3)
  - [x] Criar schema `zod` especifico de create task na feature `tasks`
  - [x] Aplicar `ZodValidationPipe` na rota de criacao, sem introduzir `class-validator` ou `class-transformer`
  - [x] Validar no minimo `title` obrigatorio e nao vazio
  - [x] Permitir campos opcionais coerentes com o schema atual: `description`, `dueDate`, `priority` e `tags`
  - [x] Garantir que erros de validacao caiam no contrato global ja implantado com `code: VALIDATION_ERROR`
- [x] Implementar fluxo de criacao sem acoplar Prisma ao controller (AC: 1, 2)
  - [x] Criar service/use-case da feature para orquestrar a criacao
  - [x] Criar camada de repository ou adapter de persistencia para concentrar o uso de `PrismaService`
  - [x] Mapear entrada HTTP para shape de persistencia sem expor tipos do Prisma na borda
  - [x] Definir defaults coerentes no fluxo de criacao quando o payload omitir campos opcionais, respeitando o schema e os defaults do banco
- [x] Retornar contrato de saida consistente para o frontend (AC: 2)
  - [x] Reaproveitar os contratos e enums criados na `2.1`
  - [x] Reaproveitar `TaskMapper` ou evolui-lo de forma coerente para serializar datas em ISO 8601 e preservar `null` quando aplicavel
  - [x] Garantir que o recurso criado contenha `id`, `status`, `priority`, `tags`, `createdAt` e `updatedAt` em formato previsivel
- [x] Cobrir o comportamento com testes unitarios e e2e (AC: 1, 2, 3)
  - [x] Criar testes unitarios para service/repository/mapeadores quando houver logica relevante
  - [x] Criar ou ampliar e2e para provar:
    - sucesso em `POST /api/v1/tasks`
    - erro de validacao para `title` invalido
  - [x] Ajustar setup de testes se a suite passar a depender de estado de banco entre casos
- [x] Validar a story antes de concluir (AC: 1, 2, 3)
  - [x] Executar `npm run prisma:validate`
  - [x] Executar `npm run prisma:generate`
  - [x] Executar `npm run build`
  - [x] Executar `npm test -- --runInBand`
  - [x] Executar `npm run test:e2e -- --runInBand`

## Dev Notes

- Esta story e a primeira entrega HTTP real do dominio `tasks`. O foco e criar tarefa com contrato enxuto, validacao defensiva e persistencia confiavel.
- O frontend precisa de um endpoint simples para captura rapida. O payload nao deve exigir mais do que o necessario.
- A `2.1` ja deixou prontos: schema Prisma de `Task`, enums `TaskStatus` e `TaskPriority`, contratos internos, mapper e `TasksModule`.
- O principal cuidado aqui e evitar que a primeira rota de dominio degrade os guardrails construidos no Epic 1:
  - nada de Prisma no controller
  - nada de erro cru do banco vazando para o cliente
  - nada de sucesso embrulhado em `{ data }`

### Project Structure Notes

- A feature deve continuar em `api/src/modules/tasks/`.
- Estrutura esperada para esta story:
  - `tasks.controller.ts`
  - `tasks.service.ts` ou use-case equivalente
  - `repositories/` ou adapter de persistencia da feature, se a separacao ficar mais clara assim
  - `schemas/` ou `validators/` para o schema `zod` de create
- Reaproveitar artefatos da `2.1` em vez de recriar tipos paralelos:
  - `contracts/task.contract.ts`
  - `dto/create-task.dto.ts`
  - `enums/task-priority.enum.ts`
  - `enums/task-status.enum.ts`
  - `mappers/task.mapper.ts`
- `PrismaService` continua em `api/src/infra/database/prisma/` e deve ser acessado por meio da camada de persistencia da feature, nao pelo controller.

### Technical Requirements

- Endpoint alvo: `POST /api/v1/tasks`
- Payload de entrada esperado:
  - `title` obrigatorio
  - `description` opcional
  - `dueDate` opcional
  - `priority` opcional
  - `tags` opcional
- Defaults esperados no recurso criado, quando omitidos:
  - `status: OPEN`
  - `priority: MEDIUM`
  - `tags: []`
- `dueDate` deve ser tratado de forma coerente com datas ISO 8601 na borda HTTP.
- Regra aplicada nesta implementacao para `dueDate`:
  - aceitar apenas ISO 8601 valido quando vier preenchido
  - tratar `null` ou ausencia como sem prazo
  - rejeitar string vazia como invalida, sem normalizacao silenciosa
- A resposta de sucesso deve devolver a tarefa criada diretamente.
- O contrato de saida precisa refletir os nomes e formatos definidos na `2.1`, inclusive enums em formato estavel e datas em string ISO.
- Se houver falha de integridade ou persistencia inesperada, ela deve ser traduzida pelo fluxo existente de erro padronizado, sem vazar detalhes internos.

### Architecture Compliance

- Controller limita-se a preocupacoes HTTP.
- Validacao de entrada na borda com `zod`.
- Regras de criacao e defaults de dominio ficam no service/use-case.
- Persistencia via camada dedicada usando `PrismaService`.
- Nenhuma query Prisma direta dentro do controller.
- Preservar respostas de sucesso diretas e shape global de erro implantado na `1.4`.

### File Structure Requirements

- Arquivos provavelmente tocados nesta story:
  - `api/src/modules/tasks/tasks.module.ts`
  - `api/src/modules/tasks/tasks.controller.ts`
  - `api/src/modules/tasks/tasks.service.ts`
  - `api/src/modules/tasks/dto/create-task.dto.ts`
  - `api/src/modules/tasks/mappers/task.mapper.ts`
  - `api/test/app.e2e-spec.ts` ou novos e2e especificos da feature
- Arquivos provaveis adicionais:
  - `api/src/modules/tasks/schemas/create-task.schema.ts`
  - `api/src/modules/tasks/repositories/tasks.repository.ts`
  - `api/src/modules/tasks/*.spec.ts`
- Evitar nesta story:
  - listagem
  - consulta por id
  - update/delete
  - endpoints de troca de status

### Testing Requirements

- Validar obrigatoriamente:
  - `npm run prisma:validate`
  - `npm run prisma:generate`
  - `npm run build`
  - `npm test -- --runInBand`
  - `npm run test:e2e -- --runInBand`
- O e2e deve provar pelo menos:
  - criacao com payload minimo valido
  - criacao com payload mais completo, se isso ajudar a cobrir mapeamento
  - rejeicao de `title` vazio ou ausente com erro padronizado
- Como a suite agora passa a mexer em banco real, o teste deve cuidar de isolamento entre casos para nao gerar flakiness.

### Previous Story Learnings

- A `2.1` ja consolidou `Task`, enums canonicos e defaults no schema; a `2.2` deve reaproveitar isso em vez de duplicar semantica em strings livres.
- O review da `2.1` mostrou a importancia de alinhar optionalidade do contrato com defaults do banco, especialmente em `tags`.
- O Epic 1 consolidou erro global e `zod`; esta e a primeira story que precisa provar esses guardrails em endpoint de negocio real.
- O app atual continua com bootstrap compartilhado, Swagger e e2e funcionando; a feature `tasks` nao pode quebrar esse baseline.
- Como o banco local foi necessario para aplicar migrations, esta story deve tratar explicitamente o estado do banco nos testes de integracao/e2e.

### Git Intelligence

- A feature `tasks` ja existe estruturalmente, mas ainda sem controller, service e persistencia real.
- O schema e as migrations ja estao em estado util para criar registros reais no PostgreSQL.
- O `TaskMapper` ja existe e deve ser reaproveitado antes de introduzir um segundo formato de serializacao.

### References

- Story source e acceptance criteria: [Source: _bmad-output/planning-artifacts/epics.md#Story-22-Criar-tarefa-com-validacao-e-retorno-consistente]
- Objetivo do Epic 2: [Source: _bmad-output/planning-artifacts/epics.md#Epic-2-Cadastro-e-Manutencao-Confiavel-de-Tarefas]
- Regras de response shape: [Source: _bmad-output/planning-artifacts/architecture.md#Format-Patterns]
- Regras de validacao e erro: [Source: _bmad-output/planning-artifacts/architecture.md#Process-Patterns]
- Regras de camada e persistencia: [Source: _bmad-output/planning-artifacts/architecture.md#Communication-Patterns]
- Learnings da modelagem de `Task`: [Source: _bmad-output/implementation-artifacts/2-1-definir-schema-task-e-contratos-de-dominio-da-api.md]

## Dev Agent Record

### Agent Model Used

Codex (GPT-5 family)

### Debug Log References

- A `2.1` ja havia deixado `TaskMapper`, enums e `TasksModule` prontos, o que permitiu focar esta story em controller, validacao e persistencia real.
- A rota de criacao foi implementada com `ZodValidationPipe`, service e repository para evitar Prisma no controller.
- Os e2e passaram a depender de banco real para criar registros; por isso a suite limpa a tabela `Task` entre testes.
- O `PrismaService` recebeu `onModuleDestroy()` para encerrar conexoes corretamente quando o app de teste fecha.

### Completion Notes List

- Implementado `POST /api/v1/tasks` com resposta direta do recurso criado.
- O schema `zod` da feature valida `title` obrigatorio, aceita opcionais coerentes e rejeita `dueDate` vazio ou fora de ISO 8601 valido.
- Defaults de dominio foram aplicados na criacao: `status: OPEN`, `priority: MEDIUM` e `tags: []`.
- A persistencia ficou encapsulada em `TasksRepository`, e o `TasksService` centraliza defaults e conversao de `dueDate` para `Date`.
- Os e2e agora cobrem payload minimo, payload completo e erro de validacao.
- Validacoes concluidas com sucesso: `npm run prisma:validate`, `npm run prisma:generate`, `npm run lint`, `npm run build`, `npm test -- --runInBand` e `npm run test:e2e -- --runInBand`.

### File List

- _bmad-output/implementation-artifacts/2-2-criar-tarefa-com-validacao-e-retorno-consistente.md
- _bmad-output/implementation-artifacts/sprint-status.yaml
- api/src/infra/database/prisma/prisma.service.ts
- api/src/modules/tasks/repositories/tasks.repository.ts
- api/src/modules/tasks/schemas/create-task.schema.ts
- api/src/modules/tasks/tasks.controller.ts
- api/src/modules/tasks/tasks.module.ts
- api/src/modules/tasks/tasks.service.ts
- api/src/modules/tasks/tasks.service.spec.ts
- api/test/app.e2e-spec.ts

### Change Log

- 2026-03-30: implementado `POST /api/v1/tasks` com validacao via `zod`, defaults de dominio, persistencia encapsulada e cobertura e2e; story promovida para `review`.
