# Padrao da camada de Providers

- Providers encapsulam integracoes externas (Telegram, IA, etc).
- Sempre defina contrato em arquivo proprio e injete por interface.
- Implementacoes concretas nao devem vazar para use cases.
- `node-telegram-bot-api` deve ficar isolado em `providers/messaging/telegram-provider.ts`.
- Provider de IA deve apenas interpretar/normalizar comando, sem regra de negocio financeira.

## Testes

- Testar providers com doubles/fakes do cliente externo.
- Garantir que conversao de payload externo para contrato interno esta correta.
