## Bots em produção

- **Telegram (`node-telegram-bot-api`)**
  - Polling: `interval: 2000ms`, `params.timeout: 20s`, `allowed_updates: ['message']` para filtrar eventos.
  - Rede: uso de `dns.setDefaultResultOrder('ipv4first')` antes de criar o bot para priorizar IPv4 e mitigar ETIMEDOUT em hosts dual-stack (sem precisar mexer nas opções de request do bot).
  - Logs: handler de `polling_error` registra `error.message` para facilitar diagnóstico.

### Operação
- Ao subir o servidor (`src/server.ts`), o bot do Telegram inicia junto do Fastify.
- Sempre reinicie o processo ao alterar configurações de polling, token ou handlers.
