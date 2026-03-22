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
