# Design: Lista de Compras Persistente por Usuario

## Contexto e objetivo

Adicionar ao bot a capacidade de manter uma lista de compras acumulada ao longo de varios dias, com ciclo simples:

1. adicionar itens por linguagem natural,
2. consultar lista quando estiver no mercado,
3. encerrar compra com confirmacao explicita,
4. limpar lista ao finalizar.

Escopo aprovado para MVP:

- uma unica lista ativa por usuario,
- item com campo unico `nome`,
- ignorar duplicados,
- apenas visualizacao da lista durante compra,
- encerramento com confirmacao (`sim`, `confirmar`, `ok`),
- resposta simples para lista vazia.

## Requisitos funcionais

### RF-01 Adicionar item

O usuario pode enviar frases como:

- "acabou pasta de dente, coloque na lista",
- "adiciona cafe na lista de compras".

O sistema deve:

- extrair nome do item,
- adicionar na lista ativa do usuario,
- evitar duplicacao case-insensitive,
- responder se foi adicionado ou se ja existia.

### RF-02 Consultar lista

O usuario pode enviar frases como:

- "estou no mercado me mande a minha lista de compras",
- "qual minha lista de compras?".

O sistema deve:

- retornar todos os itens da lista ativa, numerados,
- retornar mensagem simples quando nao houver itens.

### RF-03 Encerrar compra

O usuario pode enviar frases como:

- "terminei de comprar tudo da lista",
- "acabei as compras".

O sistema deve:

- pedir confirmacao antes de apagar,
- apagar todos os itens somente se usuario responder `sim`, `confirmar` ou `ok`,
- manter lista intacta em caso de resposta diferente.

## Requisitos nao funcionais

- Seguir Clean Architecture ja adotada no projeto.
- Nao misturar regras de negocio com provider de IA.
- Garantir testes unitarios cobrindo regras principais (TDD).
- Commits atomicos para feature, ajustes e docs.

## Arquitetura proposta

### Contrato de repositorio

Novo contrato `ShoppingListRepository` com foco em lista ativa por usuario:

- `addItem(input: { userId: string; name: string }): Promise<{ created: boolean; item: ShoppingListItem }>`
- `listItems(userId: string): Promise<ShoppingListItem[]>`
- `clearItems(userId: string): Promise<number>`

Entidade de leitura:

- `ShoppingListItem` com `id`, `userId`, `name`, `createdAt`.

### Implementacoes

- `InMemoryShoppingListRepository` para testes unitarios.
- `PrismaShoppingListRepository` para execucao real.

Observacao de persistencia:

- Tabela dedicada para lista de compras por usuario.
- Unicidade logica por (`userId`, `name_normalized`) para evitar duplicados.

### Use cases

1. `AddShoppingListItemUseCase`
   - valida `name` nao vazio,
   - chama repositorio,
   - retorna status `created` ou `already_exists`.

2. `GetShoppingListUseCase`
   - retorna itens ordenados por `createdAt` asc.

3. `ClearShoppingListUseCase`
   - remove itens do usuario,
   - retorna quantidade apagada.

### Integracao no fluxo conversacional

Declarar novas tools no Gemini:

- `add_shopping_list_item`
- `get_shopping_list`
- `clear_shopping_list`

Incluir regras no contexto de sistema:

- usar `add_shopping_list_item` para pedidos de adicionar na lista,
- usar `get_shopping_list` para pedido de consulta da lista,
- antes de `clear_shopping_list`, pedir confirmacao explicita.

Rotear tools em `ProcessMessageUseCase` como os demais fluxos financeiros.

## Fluxos detalhados

### Fluxo A: adicionar item

1. Usuario manda frase de adicionar.
2. LLM chama `add_shopping_list_item` com `name`.
3. Use case tenta inserir item normalizado.
4. Resposta:
   - criado: "adicionei X na sua lista",
   - ja existente: "X ja estava na sua lista".

### Fluxo B: consultar lista

1. Usuario pede lista.
2. LLM chama `get_shopping_list`.
3. Use case retorna itens.
4. Resposta:
   - com itens: lista numerada,
   - sem itens: "sua lista de compras esta vazia no momento".

### Fluxo C: encerrar compra

1. Usuario diz que terminou compra.
2. Assistente responde pedindo confirmacao.
3. Usuario responde:
   - `sim`/`confirmar`/`ok`: chamar `clear_shopping_list` e confirmar limpeza,
   - qualquer outro texto: nao limpar, informar como confirmar.

## Tratamento de erros

- Nome vazio ou invalido em `add_shopping_list_item`: erro de validacao amigavel.
- Erro inesperado de repositorio: resposta generica sem stack trace.
- `clear_shopping_list` com lista vazia: retorno com `clearedCount = 0` e mensagem neutra.

## Estrategia de testes (TDD)

### Unidade - use cases

`AddShoppingListItemUseCase`

- cria item novo,
- nao duplica item existente,
- rejeita nome vazio.

`GetShoppingListUseCase`

- retorna vazio sem itens,
- retorna itens ordenados.

`ClearShoppingListUseCase`

- limpa itens do usuario,
- retorna quantidade removida,
- nao afeta outros usuarios.

### Unidade - orquestracao

`ProcessMessageUseCase`

- roteia `add_shopping_list_item`,
- roteia `get_shopping_list`,
- roteia `clear_shopping_list`.

`GeminiAiProvider`

- possui novas declarations de tools,
- contem instrucoes de confirmacao para limpeza da lista.

## Plano de commits atomicos

1. `feat(shopping-list): add repository and use cases`
2. `feat(ai): wire shopping list tools in process-message flow`
3. `test(shopping-list): add unit tests for use cases and tool routing`
4. `docs(spec): add shopping list design`

## Fora de escopo (neste MVP)

- multiplas listas (mercado/farmacia/pet),
- quantidade, marca, observacao,
- marcar item individual como comprado,
- historico de listas finalizadas,
- sincronizacao com calendar/lembretes.

## Criterios de aceite

- Usuario consegue adicionar item por frase natural.
- Itens duplicados nao sao inseridos.
- Usuario consegue consultar lista completa quando quiser.
- Limpeza da lista ocorre somente apos confirmacao valida.
- Testes unitarios novos passam no CI local.
