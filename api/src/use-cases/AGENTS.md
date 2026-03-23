# Padrao da camada de Use Cases

- Cada use case deve expor somente um metodo publico: `execute`.
- Cada classe deve ter responsabilidade unica e representar uma regra de negocio clara.
- Dependencias externas devem ser injetadas no construtor via interfaces (repositorios/providers).
- Nunca importar Prisma, Fastify ou Telegram diretamente dentro de use cases.
- DTOs de entrada/saida devem ser simples e explicitos para facilitar testes.
- Validacoes de contrato devem acontecer na borda (controllers/providers) e regras no use case.

## Testes

- Testes unitarios devem instanciar use cases com repositorios em memoria.
- Mockar providers (IA/mensageria) com objetos simples contendo `execute`/metodos assinados.
- Cobrir cenarios de sucesso, falha de regra de negocio e entradas incompletas.

## Fluxos de Update

- Para comandos de atualizacao (ex: `UPDATE_EXPENSE`), o use case deve receber entidades completas quando possivel (`expenseName` + `newValue`).
- Se entidade obrigatoria faltar, a FSM deve entrar em estado de coleta (ex: `awaiting_expense_value`) ao inves de repetir fallback infinito.
- Ao receber a entidade pendente em mensagem subsequente, a FSM deve retomar o fluxo e concluir o update.
