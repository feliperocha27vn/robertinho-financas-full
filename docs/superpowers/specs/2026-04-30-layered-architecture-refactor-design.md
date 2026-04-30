# Layered Architecture Refactor — robertinho-financas API

**Date:** 2026-04-30
**Status:** Approved
**Context:** In-place refactoring of `api/` from the current architecture to the Node TS Layered Backend pattern. Removes all AI/Telegram/Calendar integrations. Preserves all business logic and database schema. Adds full CRUD REST endpoints.

---

## Goal

Transform the existing `api/` into a clean layered backend following the `node-ts-layered-backend-architecture` skill rules, while:
- Removing all chatbot (AI/Telegram/Calendar) functionality
- Keeping all expenses, installments, recipes, and shopping-list business logic
- Preserving the PostgreSQL schema (Prisma) unchanged
- Adding full CRUD REST endpoints for every domain
- Adopting TDD-first workflow for all changes

## Non-Goals

- Changing the database schema or migrations
- Changing the business rules themselves (only restructuring)
- Adding new domains (budgets, categories, reports, etc.)
- Docker/deploy changes (Dockerfile, fly.toml, docker-compose kept as-is)

---

## Architecture Rules (Mandatory)

From `node-ts-layered-backend-architecture`:
1. **TDD is mandatory.** Every implementation step starts with a failing test.
2. **Controllers** are `FastifyPluginAsyncZod` — one file per route, schema inline, registered via `app.register`.
3. **Factories** are the composition root — explicit dependency wiring, no DI container.
4. **Use-cases** are framework-independent and persistence-implementation-independent.
5. **Repository contracts** are defined separately from adapters.
6. **Application errors** live in `errors/` and are translated at the HTTP edge inside each controller.
7. **Pagination** uses cursor-based approach — no `pageIndex`/`pageSize` exposed to client.
8. **Path aliases** (`@factories/`, `@use-cases/`, `@repositories/`, `@errors/`) replace relative imports.

## Tooling

| Tool | Version/Package |
|---|---|
| Runtime | Node.js + TypeScript |
| HTTP | Fastify 5.x + `fastify-type-provider-zod` 5.0.3 |
| Validation | Zod 4.x (`import z from 'zod'`) |
| Testing | Vitest + supertest |
| Package manager | pnpm |
| Dev runner | tsx |
| Build | tsup |
| Linter/formatter | Biome |
| API docs | @fastify/swagger + @scalar/fastify-api-reference |
| ORM | Prisma (existing) |

---

## What Gets Removed

### Source files to delete:
```
src/providers/          (ai/, calendar/, messaging/ — all providers)
src/functions/          (calendar handlers + declarations)
src/use-cases/conversation/  (process-message-use-case)
src/presenters/         (message-formatter — Telegram HTML)
src/telegram/           (startTelegramBot)
src/http/webhook/       (POST /webhook, POST /webhook/telegram)
src/http/mobile/        (rewritten as standard controllers)
src/container.ts        (DI container — replaced by factories)
src/lib/telegram.ts     (TelegramBot singleton)
src/domain/             (types inlined into use-cases or deleted)
```

### npm packages to remove:
```
@google/genai
node-telegram-bot-api
@types/node-telegram-bot-api
googleapis
@flydotio/dockerfile
```

### Env vars to remove:
```
GEMINI_API_KEY
MOBILE_APP_TOKEN
TELEGRAM_BOT_TOKEN
TELEGRAM_WEBHOOK_SECRET
CLIENT_EMAIL
PRIVATE_KEY_CALENDER
GOOGLE_PERSONAL_EMAIL
```

### npm packages to add:
```
@fastify/cors
@fastify/swagger
@scalar/fastify-api-reference
tsup
```

---

## Target Folder Structure

```
src/
├── app.ts
├── server.ts
├── env.ts
│
├── errors/
│   ├── resource-not-found-error.ts
│   └── unauthorized-error.ts
│
├── http/
│   └── controllers/
│       ├── index.ts
│       ├── health/
│       │   └── health-controller.ts
│       ├── summary/
│       │   └── get-home-data-controller.ts
│       ├── expenses/
│       │   ├── create-expense-controller.ts
│       │   ├── fetch-expenses-controller.ts
│       │   ├── get-expense-controller.ts
│       │   ├── update-expense-controller.ts
│       │   ├── delete-expense-controller.ts
│       │   ├── pay-expense-controller.ts
│       │   ├── unpay-expense-controller.ts
│       │   ├── pay-installment-controller.ts
│       │   ├── get-sum-expenses-controller.ts
│       │   ├── get-sum-fixed-expenses-controller.ts
│       │   ├── get-accounts-payable-controller.ts
│       │   ├── get-remaining-installments-controller.ts
│       │   ├── get-all-remaining-installments-controller.ts
│       │   └── delete-all-variable-expenses-controller.ts
│       ├── recipes/
│       │   ├── create-recipe-controller.ts
│       │   ├── fetch-recipes-controller.ts
│       │   ├── get-recipe-controller.ts
│       │   ├── update-recipe-controller.ts
│       │   └── delete-recipe-controller.ts
│       └── shopping-list/
│           ├── add-item-controller.ts
│           ├── fetch-items-controller.ts
│           └── clear-items-controller.ts
│
├── middlewares/
│   └── verify-auth-token.ts
│
├── factories/
│   ├── make-repositories.ts
│   ├── make-expenses-use-cases.ts
│   ├── make-recipes-use-cases.ts
│   └── make-shopping-list-use-cases.ts
│
├── use-cases/
│   ├── errors/
│   │   ├── resource-not-found-error.ts
│   │   └── invalid-input-error.ts
│   ├── expenses/
│   │   ├── create-expense-use-case.ts
│   │   ├── create-expense-installment-use-case.ts
│   │   ├── fetch-expenses-use-case.ts               (NEW)
│   │   ├── get-expense-use-case.ts                  (NEW)
│   │   ├── update-expense-use-case.ts               (NEW — generic update)
│   │   ├── update-expense-amount-use-case.ts
│   │   ├── delete-expense-use-case.ts               (NEW — generic delete)
│   │   ├── delete-variable-expense-by-name-use-case.ts
│   │   ├── delete-all-variable-expenses-use-case.ts
│   │   ├── pay-expense-use-case.ts                  (consolidated pay-by-names)
│   │   ├── pay-all-unpaid-use-case.ts
│   │   ├── unpay-expense-use-case.ts
│   │   ├── pay-installment-use-case.ts
│   │   ├── get-sum-expenses-use-case.ts
│   │   ├── get-sum-expenses-fixed-use-case.ts
│   │   ├── get-sum-expenses-variable-month-use-case.ts
│   │   ├── get-sum-expenses-variable-last-month-use-case.ts
│   │   ├── get-unpaid-expenses-use-case.ts
│   │   ├── get-accounts-payable-use-case.ts         (consolidated)
│   │   ├── get-remaining-installments-use-case.ts
│   │   └── get-all-remaining-installments-use-case.ts
│   ├── recipes/
│   │   ├── create-recipe-use-case.ts
│   │   ├── fetch-recipes-use-case.ts                (NEW)
│   │   ├── get-recipe-use-case.ts                   (NEW)
│   │   ├── update-recipe-use-case.ts                (NEW)
│   │   └── delete-recipe-use-case.ts                (NEW)
│   ├── shopping-list/
│   │   ├── add-item-use-case.ts
│   │   ├── fetch-items-use-case.ts
│   │   └── clear-items-use-case.ts
│   └── summary/
│       └── get-home-data-use-case.ts
│
├── repositories/
│   └── contracts/
│       ├── expenses-repository.ts
│       ├── installments-repository.ts
│       ├── recipes-repository.ts
│       └── shopping-list-repository.ts
│
├── repositories/
│   └── adapters/
│       └── prisma/
│           ├── prisma-expenses-repository.ts
│           ├── prisma-installments-repository.ts
│           ├── prisma-recipes-repository.ts
│           └── prisma-shopping-list-repository.ts
│
├── in-memory/
│   ├── in-memory-expenses-repository.ts
│   ├── in-memory-installments-repository.ts
│   ├── in-memory-recipes-repository.ts
│   └── in-memory-shopping-list-repository.ts
│
├── lib/
│   └── prisma.ts
│
└── utils/
    └── prisma-retry.ts
```

---

## Complete Route Map

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/health` | No | Health check |
| GET | `/summary/home` | No | Home dashboard data |
| POST | `/expenses` | No | Create expense |
| GET | `/expenses` | No | List expenses (cursor pagination) |
| GET | `/expenses/:id` | No | Get expense by ID |
| PUT | `/expenses/:id` | No | Update expense |
| DELETE | `/expenses/:id` | No | Delete expense |
| PATCH | `/expenses/:id/pay` | No | Pay an expense |
| PATCH | `/expenses/:id/unpay` | No | Unpay an expense |
| GET | `/expenses/sum` | No | Total sum of all expenses |
| GET | `/expenses/sum/fixed` | No | Sum of fixed expenses |
| GET | `/expenses/sum/variables` | No | Variable expenses current month |
| GET | `/expenses/sum/variables/last-month` | No | Variable expenses last month |
| GET | `/expenses/payable` | No | Accounts payable next month |
| GET | `/expenses/payable/day-fifteen` | No | Accounts payable by day 15 |
| GET | `/expenses/unpaid` | No | Unpaid expenses current month |
| PATCH | `/expenses/pay-all-unpaid` | No | Pay all unpaid current month |
| DELETE | `/expenses/variables` | No | Delete all variable expenses current month |
| POST | `/installments/:id/pay` | No | Pay an installment |
| GET | `/installments/remaining` | No | Remaining installments by name |
| GET | `/installments/remaining/all` | No | All remaining installments grouped |
| POST | `/recipes` | No | Create recipe |
| GET | `/recipes` | No | List recipes (cursor) |
| GET | `/recipes/:id` | No | Get recipe |
| PUT | `/recipes/:id` | No | Update recipe |
| DELETE | `/recipes/:id` | No | Delete recipe |
| POST | `/shopping-list` | No | Add item |
| GET | `/shopping-list` | No | List items |
| DELETE | `/shopping-list` | No | Clear all items |

---

## Use-Case Changes from Existing

Existing use-cases that currently return `MessageFormatter`-formatted strings will be changed to return plain data objects.
No use-case imports any Fastify, Prisma, or Telegram type. Only the repository contract interfaces and other use-cases.

### Deleted use-cases (existing):
- `process-message-use-case.ts` — AI chatbot orchestrator
- `get-mobile-overview-use-case.ts` — composite, inlined or split

### New use-cases to implement:
- `fetch-expenses-use-case.ts` — cursor-based list
- `get-expense-use-case.ts` — single expense by ID with installments
- `update-expense-use-case.ts` — generic field update
- `delete-expense-use-case.ts` — generic delete (not just variable by name)
- `fetch-recipes-use-case.ts` — cursor-based list
- `get-recipe-use-case.ts` — single recipe by ID
- `update-recipe-use-case.ts` — generic field update
- `delete-recipe-use-case.ts` — generic delete

### Consolidated use-cases:
- `pay-expenses-by-names-use-case` → `pay-expense-use-case` (single expense by ID)
- `accounts-payable-next-month` + `accounts-to-pay-by-day-fifteen` → two separate controllers calling reusable repository methods

---

## Controller Pattern (Example)

```typescript
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import z from 'zod'
import { makeCreateExpenseUseCase } from '@factories/make-expenses-use-cases'
import { ResourceNotFoundError } from '@errors/resource-not-found-error'

export const createExpenseController: FastifyPluginAsyncZod = async (app) => {
  app.post('/expenses', {
    schema: {
      tags: ['Expenses'],
      summary: 'Create a new expense',
      body: z.object({
        description: z.string().min(1),
        amount: z.coerce.number().positive(),
        category: z.enum(['TRANSPORT', 'OTHERS', 'STUDIES', 'RESIDENCE', 'CREDIT']),
        isFixed: z.boolean().default(false),
        numberOfInstallments: z.coerce.number().int().min(1).optional(),
      }),
      response: {
        201: z.object({
          expense: z.object({
            id: z.string().uuid(),
            description: z.string(),
            amount: z.number(),
            category: z.enum(['TRANSPORT', 'OTHERS', 'STUDIES', 'RESIDENCE', 'CREDIT']),
            isFixed: z.boolean(),
            numberOfInstallments: z.number().nullable(),
            createdAt: z.string(),
          }),
        }),
      },
    },
  }, async (request, reply) => {
    const { description, amount, category, isFixed, numberOfInstallments } = request.body

    const useCase = makeCreateExpenseUseCase()
    const result = await useCase.execute({
      description, amount, category, isFixed, numberOfInstallments,
    })

    return reply.status(201).send(result)
  })
}
```

---

## Test Strategy

- **Unit tests**: `tests/unit/use-cases/` — use `in-memory/` repositories, test business rules in isolation
- **e2e tests**: `tests/e2e/controllers/` — use `supertest` + real Fastify app + in-memory repositories (no DB needed)
- All existing use-case tests are preserved and updated to new import paths
- New use-cases and controllers must have TDD: failing test first, then implementation
- Test helpers: `makeSut()` pattern in each test file, `beforeEach` creates fresh in-memory repos

---

## Migration Order

Each step is a self-contained, testable unit. Steps are sequential.

| # | Step | Scope |
|---|---|---|
| 1 | **Cleanup** | Delete AI/Telegram/Calendar files, npm packages. Simplify env.ts, server.ts. |
| 2 | **Foundation** | Create `errors/`, `utils/`, configure path aliases (tsconfig + vitest), add `tsup` + `@fastify/swagger` + `@scalar`. Update biome scripts. |
| 3 | **Repositories** | Move `repositories/prisma/` → `repositories/adapters/prisma/`, move `in-memory/` → `src/in-memory/`. Update all imports. |
| 4 | **Factories** | Create pure factories per domain. Wire repos → use-cases. No DI container. |
| 5 | **Summary** | Migrate `get-home-data-controller` + `get-home-data-use-case`. First domain to validate the new pattern. |
| 6 | **Expenses** | Migrate all existing expense use-cases, add CRUD controllers, add new use-cases. Largest step. |
| 7 | **Recipes** | Migrate create use-case, add CRUD controllers + new use-cases. |
| 8 | **Shopping List** | Migrate existing use-cases, add list/clear controllers. |
| 9 | **Final Cleanup** | Remove dead code, run lint, verify build, full test suite pass. |

---

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Breaking existing mobile app | Mobile routes are re-implemented as standard controllers with equivalent response shapes |
| Breaking DB schema | Prisma schema and migrations are never touched |
| Regression in business logic | All existing use-case tests are preserved and updated; new CRUD gets TDD |
| Path alias resolution issues | tsup and vitest both configured with matching aliases; CI catches mismatches |
