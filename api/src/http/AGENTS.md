# Padrao da camada HTTP

- Controllers HTTP devem apenas: validar entrada, chamar use case e serializar resposta.
- Regras de negocio ficam exclusivamente nos use cases.
- Webhook deve consumir o contrato de processamento conversacional (ex: `processMessage.execute`).
- Nunca acessar Prisma diretamente nos controllers.
- Manter schemas Zod proximos das rotas para clareza.

## Testes de integracao

- Usar `supertest` para validar status code e payload das rotas.
- Substituir container com dublês nos testes para isolar a camada HTTP.
