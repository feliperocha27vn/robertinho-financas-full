# Shopping List Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permitir lista de compras persistente por usuario com adicao por linguagem natural, consulta da lista e limpeza total apos confirmacao.

**Architecture:** Vamos adicionar um novo agregado simples de lista de compras (contrato + repositorios Prisma/InMemory + use cases), integrar as tools no function-calling do Gemini e rotear no `ProcessMessageUseCase`. A confirmacao para limpeza total fica no prompt do provider de IA, mantendo regra de negocio nos use cases.

**Tech Stack:** TypeScript, Vitest, Prisma, Gemini function calling, Clean Architecture.

---

### Task 1: Modelo de dominio e repositorio de lista de compras

**Files:**
- Create: `api/src/repositories/contracts/shopping-list-repository.ts`
- Modify: `api/src/domain/finance.ts`
- Modify: `api/src/factories/make-repositories.ts`

- [ ] **Step 1: Escrever teste falhando para o contrato de repositorio (compilacao/tipagem)**

```ts
// objetivo: garantir que ShoppingListItem e ShoppingListRepository existam
import type { ShoppingListRepository } from '../../../src/repositories/contracts/shopping-list-repository'

type AssertContract = ShoppingListRepository
```

- [ ] **Step 2: Rodar teste de tipo e validar falha inicial**

Run: `pnpm -C api test:unit`
Expected: erro de import/tipo ausente para `shopping-list-repository`.

- [ ] **Step 3: Implementar contrato e tipo de dominio minimo**

```ts
export interface ShoppingListItem {
  id: string
  userId: string
  name: string
  createdAt: Date
}

export interface ShoppingListRepository {
  addItem(input: { userId: string; name: string }): Promise<{ created: boolean; item: ShoppingListItem }>
  listItems(userId: string): Promise<ShoppingListItem[]>
  clearItems(userId: string): Promise<number>
}
```

- [ ] **Step 4: Expor dependencia no grafo de repositorios**

```ts
// make-repositories.ts
shoppingList: new PrismaShoppingListRepository(),
```

- [ ] **Step 5: Rodar teste unitario para garantir compilacao**

Run: `pnpm -C api test:unit`
Expected: suite unitaria executa (podem falhar testes ainda nao implementados das tasks seguintes).

- [ ] **Step 6: Commit atomico**

```bash
git add api/src/domain/finance.ts api/src/repositories/contracts/shopping-list-repository.ts api/src/factories/make-repositories.ts
git commit -m "feat(shopping-list): add domain type and repository contract"
```

### Task 2: Implementacoes de repositorio (InMemory e Prisma)

**Files:**
- Create: `api/src/repositories/in-memory/in-memory-shopping-list-repository.ts`
- Create: `api/src/repositories/prisma/prisma-shopping-list-repository.ts`
- Modify: `api/prisma/schema.prisma`

- [ ] **Step 1: Escrever testes falhando do repositorio em memoria**

```ts
it('nao duplica item por userId + nome normalizado', async () => {
  const repo = new InMemoryShoppingListRepository()
  await repo.addItem({ userId: 'u1', name: 'Pasta de Dente' })
  const second = await repo.addItem({ userId: 'u1', name: 'pasta de dente' })
  expect(second.created).toBe(false)
  expect((await repo.listItems('u1')).length).toBe(1)
})
```

- [ ] **Step 2: Rodar teste especifico e validar falha**

Run: `pnpm -C api vitest run tests/unit/repositories/in-memory-shopping-list-repository.test.ts`
Expected: FAIL por classe inexistente.

- [ ] **Step 3: Implementar repositorio em memoria (minimo para passar)**

```ts
const normalized = input.name.trim().toLowerCase()
const found = this.items.find(i => i.userId === input.userId && i.name.toLowerCase() === normalized)
if (found) return { created: false, item: found }
```

- [ ] **Step 4: Implementar persistencia Prisma + schema**

```prisma
model ShoppingListItems {
  id         String   @id @default(uuid()) @db.Uuid
  userId     String   @map("user_id")
  name       String
  nameNorm   String   @map("name_norm")
  createdAt  DateTime @default(now()) @map("created_at") @db.Timestamptz(6)

  @@unique([userId, nameNorm])
  @@map("shopping_list_items")
}
```

- [ ] **Step 5: Rodar testes unitarios relevantes**

Run: `pnpm -C api test:unit`
Expected: testes de repositorio em memoria passam.

- [ ] **Step 6: Commit atomico**

```bash
git add api/prisma/schema.prisma api/src/repositories/in-memory/in-memory-shopping-list-repository.ts api/src/repositories/prisma/prisma-shopping-list-repository.ts
git commit -m "feat(shopping-list): implement in-memory and prisma repositories"
```

### Task 3: Use cases de lista de compras

**Files:**
- Create: `api/src/use-cases/shopping-list/add-shopping-list-item-use-case.ts`
- Create: `api/src/use-cases/shopping-list/get-shopping-list-use-case.ts`
- Create: `api/src/use-cases/shopping-list/clear-shopping-list-use-case.ts`
- Modify: `api/src/factories/make-use-cases.ts`
- Test: `api/tests/unit/use-cases/shopping-list/add-shopping-list-item-use-case.test.ts`
- Test: `api/tests/unit/use-cases/shopping-list/get-shopping-list-use-case.test.ts`
- Test: `api/tests/unit/use-cases/shopping-list/clear-shopping-list-use-case.test.ts`

- [ ] **Step 1: Escrever testes falhando dos 3 use cases**

```ts
it('retorna already_exists para item duplicado', async () => {
  const result = await sut.execute({ userId: 'u1', name: 'cafe' })
  expect(result.status).toBe('already_exists')
})
```

- [ ] **Step 2: Rodar testes novos e confirmar falha**

Run: `pnpm -C api vitest run tests/unit/use-cases/shopping-list`
Expected: FAIL por arquivos/use cases inexistentes.

- [ ] **Step 3: Implementar use cases com regra minima**

```ts
if (!input.name.trim()) return { status: 'invalid_name' as const }
const { created, item } = await this.shoppingListRepository.addItem(...)
return created ? { status: 'created', item } : { status: 'already_exists', item }
```

- [ ] **Step 4: Registrar no `make-use-cases.ts`**

```ts
addShoppingListItem: new AddShoppingListItemUseCase(repositories.shoppingList),
getShoppingList: new GetShoppingListUseCase(repositories.shoppingList),
clearShoppingList: new ClearShoppingListUseCase(repositories.shoppingList),
```

- [ ] **Step 5: Rodar testes de use case**

Run: `pnpm -C api vitest run tests/unit/use-cases/shopping-list`
Expected: PASS.

- [ ] **Step 6: Commit atomico**

```bash
git add api/src/use-cases/shopping-list api/src/factories/make-use-cases.ts api/tests/unit/use-cases/shopping-list
git commit -m "feat(shopping-list): add shopping list use-cases"
```

### Task 4: Integrar tools da lista no function calling

**Files:**
- Modify: `api/src/providers/ai/gemini/declarations/finance-tools.ts`
- Modify: `api/src/providers/ai/gemini-ai-provider.ts`
- Modify: `api/src/use-cases/conversation/process-message-use-case.ts`
- Modify: `api/src/factories/make-process-message-use-case.ts`
- Test: `api/tests/unit/providers/gemini-ai-provider.test.ts`
- Test: `api/tests/unit/use-cases/process-message-use-case.test.ts`

- [ ] **Step 1: Escrever testes falhando para wiring das novas tools**

```ts
await context.executeTool({ name: 'add_shopping_list_item', args: { name: 'cafe' } })
await context.executeTool({ name: 'get_shopping_list', args: {} })
await context.executeTool({ name: 'clear_shopping_list', args: {} })
```

- [ ] **Step 2: Rodar testes de provider/process-message e validar falha**

Run: `pnpm -C api vitest run tests/unit/providers/gemini-ai-provider.test.ts tests/unit/use-cases/process-message-use-case.test.ts`
Expected: FAIL por tools nao declaradas/nao roteadas.

- [ ] **Step 3: Declarar tools e atualizar instrucoes no prompt**

```ts
{ name: 'add_shopping_list_item', ... }
{ name: 'get_shopping_list', ... }
{ name: 'clear_shopping_list', ... }
```

- [ ] **Step 4: Rotear tools no `ProcessMessageUseCase`**

```ts
case 'add_shopping_list_item':
  return { ok: true, result: await this.addShoppingListItemUseCase.execute(...) }
```

- [ ] **Step 5: Rodar testes de integracao unitarios do fluxo**

Run: `pnpm -C api vitest run tests/unit/providers/gemini-ai-provider.test.ts tests/unit/use-cases/process-message-use-case.test.ts`
Expected: PASS.

- [ ] **Step 6: Commit atomico**

```bash
git add api/src/providers/ai/gemini/declarations/finance-tools.ts api/src/providers/ai/gemini-ai-provider.ts api/src/use-cases/conversation/process-message-use-case.ts api/src/factories/make-process-message-use-case.ts api/tests/unit/providers/gemini-ai-provider.test.ts api/tests/unit/use-cases/process-message-use-case.test.ts
git commit -m "feat(ai): wire shopping list tools in conversation flow"
```

### Task 5: Verificacao final e estabilizacao

**Files:**
- Modify (if needed): `api/tests/unit/**`

- [ ] **Step 1: Rodar suite unitaria completa**

Run: `pnpm -C api test:unit`
Expected: PASS em todos os testes unitarios.

- [ ] **Step 2: Rodar build**

Run: `pnpm -C api build`
Expected: compilacao TypeScript sem erros.

- [ ] **Step 3: Revisar `git status` para garantir escopo limpo**

Run: `git status --short`
Expected: sem alteracoes pendentes alem do que foi intencional.

- [ ] **Step 4: Commit final apenas se houver ajustes de estabilizacao**

```bash
git add <arquivos-ajustados>
git commit -m "test(shopping-list): stabilize unit coverage and build"
```

## Mapeamento de cobertura da spec

- RF-01 (adicionar item sem duplicar): Tasks 2, 3, 4.
- RF-02 (consultar lista e vazio): Tasks 3, 4.
- RF-03 (limpar apos confirmacao): Task 4 (prompt/tooling) + Task 3 (`clear`).
- TDD + commits atomicos: todas as tasks com ciclo red/green/commit.
