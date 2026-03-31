# Story 3.3: Ordenar tarefas por prioridade e prazo com regra deterministica

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a usuario do app,
I want receber tarefas em ordem util para tomada de decisao,
so that a lista do frontend preserve previsibilidade visual.

## Acceptance Criteria

1. `GET /api/v1/tasks` passa a retornar tarefas em ordem deterministica e util para decisao.
2. A ordenacao primaria usa prioridade e o desempate usa `dueDate`.
3. Tarefas sem `dueDate` seguem regra consistente e documentada.

## Tasks / Subtasks

- [x] Implementar ordenacao deterministica na listagem da feature `tasks` (AC: 1, 2, 3)
  - [x] Evoluir `GET /api/v1/tasks` para aplicar ordenacao padrao no backend
  - [x] Manter o endpoint de listagem o mesmo, sem criar rota paralela
  - [x] Preservar resposta de sucesso como array direto de `TaskContract`
- [x] Definir e aplicar regra explicita de ordenacao de dominio (AC: 1, 2, 3)
  - [x] Ordenar primeiro por prioridade com semantica de negocio:
    - `HIGH` antes de `MEDIUM`
    - `MEDIUM` antes de `LOW`
  - [x] Dentro da mesma prioridade, ordenar por `dueDate` mais proximo primeiro
  - [x] Tratar tarefas sem `dueDate` como menos urgentes dentro da mesma prioridade, ficando depois das que possuem prazo
  - [x] Aplicar desempate final deterministico por `createdAt` e/ou `id`, para evitar respostas instaveis entre chamadas equivalentes
- [x] Centralizar a ordenacao na camada correta (AC: 1, 2, 3)
  - [x] Evoluir `TasksService` e/ou `TasksRepository` para que a regra fique unica e reutilizavel
  - [x] Nao espalhar a logica de ordenacao no controller
  - [x] Preservar o filtro de `status` da `3.2`, compondo filtro e ordenacao de forma previsivel
  - [x] Garantir que o resultado continue passando por `TaskMapper`
- [x] Preservar boundary com stories futuras (AC: 1, 2, 3)
  - [x] Nao introduzir ainda `sortBy` ou `sortOrder` externos; esta story trata a ordenacao padrao da listagem
  - [x] Nao introduzir ainda busca textual; isso pertence ao Epic 4
  - [x] Nao alterar contratos de create, update ou status
- [x] Cobrir a regra com testes unitarios e e2e (AC: 1, 2, 3)
  - [x] Criar testes unitarios para a regra de ordenacao quando houver logica relevante fora do Prisma
  - [x] Ampliar e2e para provar pelo menos:
    - tarefas de prioridades diferentes saindo na ordem esperada
    - empate de prioridade resolvido por `dueDate`
    - tarefas sem `dueDate` ficando depois das com prazo na mesma prioridade
    - combinacao com `status=open` preservando o subconjunto filtrado e a nova ordenacao
  - [x] Garantir isolamento do banco entre testes
- [x] Validar a story antes de concluir (AC: 1, 2, 3)
  - [x] Executar `npm run prisma:validate`
  - [x] Executar `npm run prisma:generate`
  - [x] Executar `npm run build`
  - [x] Executar `npm test -- --runInBand`
  - [x] Executar `npm run test:e2e -- --runInBand`

## Dev Notes

- Esta story fecha o Epic 3 consolidando a listagem em uma ordem realmente util para o frontend, sem depender de heuristica local.
- A decisao importante aqui e explicitar a regra para `dueDate` ausente: dentro da mesma prioridade, tarefas com prazo vem antes, e tarefas sem prazo ficam depois.
- O outro cuidado e manter a composicao com a `3.2`: primeiro filtra, depois ordena, sempre de forma deterministica.
- Apesar do texto macro do epic mencionar ordenacao “padrao ou explicita”, nesta story a interpretacao correta e: implementar apenas a ordenacao padrao do backend.
- Nao existe query param publico de ordenacao nesta etapa; qualquer configurabilidade externa de `sortBy`/`sortOrder` continua fora do escopo atual.

### Project Structure Notes

- A feature continua em `api/src/modules/tasks/`.
- Reaproveitar e evoluir:
  - `tasks.controller.ts`
  - `tasks.service.ts`
  - `repositories/tasks.repository.ts`
  - `dto/list-tasks-query.dto.ts`
  - `mappers/task.mapper.ts`
- Se a regra exigir logica fora do Prisma, manter helper/tipo dentro da propria feature `tasks`.
- Nao criar contratos de saida alternativos.

### Technical Requirements

- Endpoint alvo: `GET /api/v1/tasks`
- O filtro por `status` da `3.2` continua valido e deve permanecer funcionando.
- Esta story trata apenas a ordenacao padrao da listagem.
- A mencao a ordenacao “explicita” no epic nao deve ser interpretada aqui como exposicao imediata de `sortBy` ou `sortOrder`.
- `sortBy` e `sortOrder` continuam fora do contrato HTTP desta story.
- Regra de ordenacao esperada:
  - prioridade como criterio primario
  - `dueDate` como criterio secundario
  - tarefas sem `dueDate` depois das com prazo, na mesma prioridade
  - desempate final deterministico entre registros equivalentes
- A resposta continua sendo array direto de `TaskContract`.
- A serializacao continua passando por `TaskMapper`.
- A ordenacao deve ser previsivel entre chamadas equivalentes com o mesmo conjunto de dados.

### Architecture Compliance

- Controller limita-se a HTTP e query params.
- Service centraliza comportamento deterministico de listagem.
- Repository encapsula a query Prisma e/ou os dados necessarios para a ordenacao.
- Nada de Prisma direto no controller.
- Query behavior deve continuar centralizado e deterministico.
- Respostas de sucesso continuam diretas, sem wrapper.

### File Structure Requirements

- Arquivos provavelmente tocados nesta story:
  - `api/src/modules/tasks/tasks.controller.ts`
  - `api/src/modules/tasks/tasks.service.ts`
  - `api/src/modules/tasks/repositories/tasks.repository.ts`
  - `api/src/modules/tasks/dto/list-tasks-query.dto.ts`
  - `api/test/app.e2e-spec.ts`
- Arquivos provaveis adicionais:
  - `api/src/modules/tasks/*.spec.ts`
  - algum helper/tipo interno da feature para regra de ordenacao, se necessario
- Evitar nesta story:
  - expor `sortBy`
  - expor `sortOrder`
  - busca textual
  - paginacao

### Testing Requirements

- Validar obrigatoriamente:
  - `npm run prisma:validate`
  - `npm run prisma:generate`
  - `npm run build`
  - `npm test -- --runInBand`
  - `npm run test:e2e -- --runInBand`
- O e2e deve provar pelo menos:
  - prioridade `HIGH` vindo antes de `MEDIUM` e `LOW`
  - desempate por `dueDate`
  - `dueDate = null` ficando ao final dentro da mesma prioridade
  - composicao com filtro de `status`
- Como os testes usam banco real, manter limpeza/isolamento entre casos.

### Previous Story Learnings

- A `2.3` consolidou a listagem base em `GET /api/v1/tasks`; a `3.3` deve evoluir esse mesmo endpoint.
- A `3.1` consolidou mudanca explicita de estado; a ordenacao nao deve mexer nesse contrato.
- A `3.2` consolidou filtro por `status` em lowercase, validacao estrita de query e preservacao de boundary com busca/ordernacao futuras; a `3.3` deve compor com isso sem reabrir `search` nem `sort*`.
- O projeto ja deixou claro que comportamento de query precisa ser centralizado e deterministico; isso deve guiar a implementacao da regra de ordenacao.

### Git Intelligence

- A feature `tasks` ja possui CRUD base, mudanca de estado e filtro por estado funcionando na mesma arquitetura.
- A listagem atual ja e filtravel e usa `TaskMapper` como unica serializacao de saida.
- O passo natural agora e tornar a ordem da lista previsivel e util, sem abrir configurabilidade externa antes da hora.

### References

- Story source e acceptance criteria: [Source: _bmad-output/planning-artifacts/epics.md#Story-33-Ordenar-tarefas-por-prioridade-e-prazo-com-regra-deterministica]
- Objetivo do Epic 3: [Source: _bmad-output/planning-artifacts/epics.md#Epic-3-Progresso-e-Organizacao-do-Trabalho]
- Regras de query deterministica: [Source: _bmad-output/planning-artifacts/architecture.md#Error-Handling-Patterns]
- Regras de query params e naming: [Source: _bmad-output/planning-artifacts/architecture.md#Code-Naming-Conventions]
- Regras de fronteira de camadas: [Source: _bmad-output/planning-artifacts/architecture.md#Architectural-Boundaries]
- Learnings de listagem base: [Source: _bmad-output/implementation-artifacts/2-3-listar-e-consultar-tarefas-por-id.md]
- Learnings de mudanca de estado: [Source: _bmad-output/implementation-artifacts/3-1-concluir-e-reabrir-tarefas-por-endpoint-explicito-de-estado.md]
- Learnings de filtro por estado: [Source: _bmad-output/implementation-artifacts/3-2-filtrar-tarefas-por-estado.md]

## Dev Agent Record

### Agent Model Used

Codex (GPT-5 family)

### Debug Log References

- A regra de ordenacao foi concentrada no `TasksService`, para manter a semantica de dominio explicita e testavel sem depender da ordenacao natural do banco.
- A implementacao passou a ordenar por prioridade, depois por `dueDate`, com `null` ficando por ultimo dentro da mesma prioridade.
- Para evitar respostas instaveis, o comparator fecha com desempate por `createdAt` e `id`.
- Os e2e antigos da listagem precisaram ser alinhados, porque antes ainda refletiam a ordenacao por `createdAt desc` do estado anterior da feature.

### Completion Notes List

- Implementada ordenacao padrao deterministica em `GET /api/v1/tasks`.
- A listagem agora prioriza `HIGH`, depois `MEDIUM`, depois `LOW`.
- Dentro da mesma prioridade, tarefas com `dueDate` mais proximo aparecem antes, e tarefas sem `dueDate` ficam depois.
- O filtro de `status` da `3.2` continua funcionando e agora compoe corretamente com a nova ordenacao.
- Validacoes concluidas com sucesso: `npm run prisma:validate`, `npm run prisma:generate`, `npm run lint`, `npm run build`, `npm test -- --runInBand` e `npm run test:e2e -- --runInBand`.

### File List

- _bmad-output/implementation-artifacts/3-3-ordenar-tarefas-por-prioridade-e-prazo-com-regra-deterministica.md
- _bmad-output/implementation-artifacts/sprint-status.yaml
- api/src/modules/tasks/tasks.service.ts
- api/src/modules/tasks/tasks.service.read.spec.ts
- api/test/app.e2e-spec.ts

### Change Log

- 2026-03-31: implementada ordenacao deterministica por prioridade e prazo na listagem de tarefas, preservando filtro por estado e cobertura automatizada; story promovida para `review`.
