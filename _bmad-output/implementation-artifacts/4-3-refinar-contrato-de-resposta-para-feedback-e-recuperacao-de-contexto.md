# Story 4.3: Refinar contrato de resposta para feedback e recuperacao de contexto

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want consolidar respostas e erros dos fluxos de listagem e mutacao,
so that o frontend consiga exibir feedback claro, retry e estados de “nao encontrado” sem ambiguidade.

## Acceptance Criteria

1. Os contratos de sucesso e erro mantêm semântica estável entre endpoints relevantes do MVP.
2. O campo `details` dos erros de validação fica formalizado como array de objetos com `field`, `message` e `code`.
3. A documentação Swagger reflete os contratos finais do MVP.

## Tasks / Subtasks

- [x] Consolidar o contrato de erro do MVP no código e na documentação (AC: 1, 2, 3)
  - [x] Revisar o shape efetivo de erro produzido pelo filtro global
  - [x] Garantir consistência entre `VALIDATION_ERROR`, `NOT_FOUND` e `INTERNAL_SERVER_ERROR`
  - [x] Formalizar `details` como array de `{ field, message, code }`
  - [x] Evitar divergência entre comportamento real da API e documentação
- [x] Refinar o contrato de sucesso sem mudar o shape funcional já consolidado (AC: 1, 3)
  - [x] Confirmar que respostas de sucesso continuam diretas e previsíveis
  - [x] Garantir coerência entre create, read, update, delete e mudança de status
  - [x] Não introduzir wrappers como `{ data: ... }`
  - [x] Preservar `204 No Content` no delete
- [x] Evoluir a documentação Swagger/OpenAPI para refletir o estado real do MVP (AC: 3)
  - [x] Revisar a configuração atual de Swagger
  - [x] Documentar endpoints principais de `tasks` com contratos de sucesso e erro relevantes
  - [x] Garantir que o documento OpenAPI reflita os responses atuais do MVP
  - [x] Cobrir especialmente os endpoints de listagem, mutação e transição de estado
- [x] Preservar boundary com comportamento já implementado (AC: 1, 2, 3)
  - [x] Não reabrir regras de domínio de filtro, busca ou ordenação
  - [x] Não mudar o shape de resposta funcional sem necessidade explícita
  - [x] Não criar novo sistema paralelo de erro ao lado do filtro global existente
  - [x] Reaproveitar contratos compartilhados já existentes em `shared/contracts`
- [x] Cobrir a consolidação com testes e validação documental (AC: 1, 2, 3)
  - [x] Ajustar ou ampliar testes quando houver diferença entre comportamento esperado e documentado
  - [x] Validar via e2e os shapes de erro mais importantes do MVP
  - [x] Validar o `docs-json` para garantir que a documentação reflita o contrato esperado
- [x] Validar a story antes de concluir (AC: 1, 2, 3)
  - [x] Executar `npm run prisma:validate`
  - [x] Executar `npm run prisma:generate`
  - [x] Executar `npm run build`
  - [x] Executar `npm test -- --runInBand`
  - [x] Executar `npm run test:e2e -- --runInBand`

## Dev Notes

- Esta story fecha o Epic 4 e funciona como consolidação do contrato público do MVP, não como criação de um novo comportamento de domínio.
- O objetivo é alinhar três coisas que já existem, mas precisam fechar como produto:
  - shape real de erro
  - shape real de sucesso
  - documentação Swagger/OpenAPI
- O cuidado principal é não “melhorar” o contrato mudando comportamento estável sem necessidade. A preferência aqui é consolidar e documentar o que o MVP realmente faz.

### Project Structure Notes

- O trabalho deve se concentrar principalmente em:
  - `api/src/common/filters/http-exception.filter.ts`
  - `api/src/shared/contracts/error-response.contract.ts`
  - `api/src/config/swagger.config.ts`
  - `api/src/config/app.config.ts`
  - controllers da feature `tasks`
  - testes e2e e testes do filtro, se necessário
- Reaproveitar contratos compartilhados existentes em vez de criar novos formatos paralelos.

### Technical Requirements

- O shape de erro do MVP precisa continuar expondo:
  - `statusCode`
  - `code`
  - `message`
  - `details`
- Para validação, `details` deve permanecer como array de objetos com:
  - `field`
  - `message`
  - `code`
- O Swagger deve refletir os endpoints e responses efetivamente suportados hoje.
- Sucesso continua direto:
  - recurso único como objeto
  - listagem como array
  - delete como `204 No Content`
- Não introduzir paginação, wrappers ou novos envelopes de resposta nesta story.

### Architecture Compliance

- O filtro global continua sendo a fonte única do contrato de erro HTTP.
- Contratos compartilhados devem ficar em `shared/contracts`.
- Swagger deve documentar o comportamento real da API, não um contrato aspiracional.
- Nada de duplicar shape de erro em múltiplos lugares sem fonte única de verdade.
- Responses de sucesso continuam diretas e coerentes com o resto do projeto.

### File Structure Requirements

- Arquivos provavelmente tocados nesta story:
  - `api/src/common/filters/http-exception.filter.ts`
  - `api/src/shared/contracts/error-response.contract.ts`
  - `api/src/config/swagger.config.ts`
  - `api/src/config/app.config.ts`
  - `api/src/modules/tasks/tasks.controller.ts`
  - `api/test/app.e2e-spec.ts`
- Arquivos prováveis adicionais:
  - specs do filtro global
  - DTOs ou decorators auxiliares de documentação, se necessário
- Evitar nesta story:
  - mudar regra de domínio
  - introduzir paginação
  - reabrir busca, filtro ou ordenação
  - alterar a semântica de `204` no delete

### Testing Requirements

- Validar obrigatoriamente:
  - `npm run prisma:validate`
  - `npm run prisma:generate`
  - `npm run build`
  - `npm test -- --runInBand`
  - `npm run test:e2e -- --runInBand`
- O e2e deve validar pelo menos:
  - `docs-json` refletindo o contrato final esperado
  - erro de validação com `details` estruturado
  - `NOT_FOUND` estável
  - sucesso direto em endpoints relevantes
- Como os testes usam banco real, manter limpeza/isolamento entre casos.

### Previous Story Learnings

- A `4.1` e a `4.2` mostraram que comportamento e contrato HTTP precisam andar juntos; essa story fecha essa linha de trabalho.
- O Epic 3 deixou claro que query params e semântica de erro mal documentados viram dívida rápido.
- O filtro global já absorve boa parte do contrato atual; a `4.3` deve consolidar isso em vez de introduzir outro mecanismo.
- O Swagger já está ativo desde o início, então esta story é sobre refinar e alinhar, não sobre começar do zero.

### Git Intelligence

- O projeto já possui filtro global, contratos compartilhados de erro, Swagger habilitado e e2e cobrindo muitos shapes reais.
- O passo natural agora é transformar esse comportamento implícito em contrato final bem documentado do MVP.
- Como a feature `tasks` já está madura, esta story deve evitar mudanças amplas de comportamento e preferir ajustes localizados de consistência e documentação.

### References

- Story source e acceptance criteria: [Source: _bmad-output/planning-artifacts/epics.md#Story-43-Refinar-contrato-de-resposta-para-feedback-e-recuperacao-de-contexto]
- Objetivo do Epic 4: [Source: _bmad-output/planning-artifacts/epics.md#Epic-4-Descoberta-e-Consistencia-de-Estado]
- Regras de erro e `details`: [Source: _bmad-output/planning-artifacts/architecture.md#Format-Patterns]
- Regras de filtro global e output consistente: [Source: _bmad-output/planning-artifacts/architecture.md#Error-Handling-Patterns]
- Regras de Swagger/OpenAPI: [Source: _bmad-output/planning-artifacts/architecture.md#Integrated-Development-Environment]
- Learnings de busca textual: [Source: _bmad-output/implementation-artifacts/4-1-busca-textual-case-insensitive-em-campos-relevantes.md]
- Learnings da composição busca + filtro: [Source: _bmad-output/implementation-artifacts/4-2-combinar-busca-com-filtro-de-estado.md]

## Dev Agent Record

### Agent Model Used

Codex (GPT-5 family)

### Debug Log References

- A consolidação foi feita em torno do comportamento real já existente: filtro global de erro, responses diretas e Swagger já habilitado.
- Foram adicionados modelos Swagger explícitos para `Task` e para o contrato de erro, evitando que a documentação continue implícita ou incompleta.
- Os endpoints principais de `tasks` passaram a declarar responses de sucesso e erro relevantes no controller.
- O workspace atual estava sem os arquivos base `app.module.ts`, `app.controller.ts` e `app.service.ts`; eles foram restaurados para recompor o app e permitir validação real do build e dos e2e.

### Completion Notes List

- Formalizado e documentado o contrato de erro com `statusCode`, `code`, `message` e `details`.
- `details` ficou explicitamente representado em Swagger como array de `{ field, message, code }`.
- Os endpoints principais de `tasks` agora expõem documentação Swagger alinhada ao comportamento real do MVP.
- As respostas de sucesso permaneceram diretas e `DELETE` continuou com `204 No Content`.
- Validacoes concluidas com sucesso: `npm run prisma:validate`, `npm run prisma:generate`, `npm run lint`, `npm run build`, `npm test -- --runInBand` e `npm run test:e2e -- --runInBand`.

### File List

- _bmad-output/implementation-artifacts/4-3-refinar-contrato-de-resposta-para-feedback-e-recuperacao-de-contexto.md
- _bmad-output/implementation-artifacts/sprint-status.yaml
- api/src/app.controller.spec.ts
- api/src/app.controller.ts
- api/src/app.module.ts
- api/src/app.service.ts
- api/src/modules/tasks/tasks.controller.ts
- api/src/modules/tasks/contracts/task.swagger.ts
- api/src/modules/tasks/dto/tasks.swagger.ts
- api/src/shared/contracts/error-response.swagger.ts
- api/test/app.e2e-spec.ts

### Change Log

- 2026-03-31: consolidado o contrato final de sucesso/erro do MVP e alinhada a documentação Swagger com o comportamento real da API; story promovida para `review`.
