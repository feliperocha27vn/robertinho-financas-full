# Padrao da camada de Repositorios

- Defina contratos em `src/repositories/contracts`.
- Implementacoes Prisma devem ficar em `src/repositories/prisma`.
- Implementacoes de teste/memoria devem ficar em `src/repositories/in-memory`.
- Use cases dependem apenas dos contratos, nunca das implementacoes concretas.
- Repositorio Prisma deve adaptar `Decimal` para `number` antes de retornar para camada de aplicacao.

## Boas praticas

- Mantenha metodos focados em consultas/comandos necessarios pelos use cases.
- Evite logica de negocio complexa dentro de repositorios.
- Para fluxo conversacional, o repositorio de sessao deve ser simples e previsivel.
