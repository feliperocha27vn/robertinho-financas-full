# Padrao da camada de Providers

- Providers encapsulam integracoes externas (Telegram, IA, etc).
- Sempre defina contrato em arquivo proprio e injete por interface.
- Implementacoes concretas nao devem vazar para use cases.
- `node-telegram-bot-api` deve ficar isolado em `providers/messaging/telegram-provider.ts`.
- Provider de IA deve apenas interpretar/normalizar comando, sem regra de negocio financeira.

## Padrao Hibrido: FSM + AI NLP Engine

- A FSM decide fluxo e estados da conversa (`idle`, `collecting_installment_due_date`, etc).
- O LLM (Gemini) NAO decide regra de negocio e NAO executa acao financeira.
- O provider de IA atua somente como tradutor de Linguagem Natural para JSON tipado.
- A saida do LLM deve ser estruturada via `responseMimeType: application/json` + schema.
- O JSON retornado deve conter apenas intencao e entidades (intent, amount, category, etc).
- Validacao final e decisoes de transicao permanecem no `ProcessMessageUseCase`.
- Em caso de JSON invalido/ambiguo, o provider retorna `intent: unknown`.

## Contrato esperado do AI Provider

- Entrada: `mensagem do usuario` + `estado atual da FSM`.
- Saida: objeto tipado (`ParsedAssistantCommand`) sem efeitos colaterais.
- Sem acesso a repositores, sem escrita em banco, sem chamada de use case.

## Testes

- Testar providers com doubles/fakes do cliente externo.
- Garantir que conversao de payload externo para contrato interno esta correta.
- Nao chamar API real em testes unitarios; sempre mockar cliente Gemini.
- Testes da FSM/use case devem mockar o provider retornando JSONs diferentes para validar transicoes.
