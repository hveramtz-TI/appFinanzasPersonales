---
name: expo-finance-domain-entities
description: "Trigger: finance domain, entities, transaction, category, budget, reminder, investment, entidades financieras. Create TypeScript domain entities with Zod validation for personal finance apps: transactions, categories, budgets, reminders, investments."
license: Apache-2.0
metadata:
  author: "gentle-ai"
  version: "1.0"
---

# Expo Finance Domain Entities

## Activation Contract

Create finance domain entities when:
- Building personal finance app
- Need transaction tracking (income/expense)
- Require category management
- Want budget tracking
- Need recurring payment reminders
- Require investment tracking (DP, FM, stocks)

## Hard Rules

- Use Zod for runtime validation + TypeScript types
- Define entity interfaces with all required fields
- Use UUID for primary keys
- Include createdAt, updatedAt, deletedAt timestamps
- Implement soft deletes (deletedAt field)
- Create custom error classes for domain validation
- Separate entity definition from repository interface

## Decision Gates

| Entity | Key Fields |
|--------|-----------|
| Transaction | amount, type (income/expense), categoryId, date |
| Category | name, icon, color, type, parentId (hierarchy) |
| Budget | categoryId, amount, period, alertThreshold |
| Reminder | title, amount, frequency, nextDate, payee |
| Investment | type (DP/FM/stock), amount, currentValue, purchaseDate |

## Execution Steps

1. Create Transaction entity with Zod schema
2. Create Category entity with hierarchy support
3. Create Reminder entity with frequency types
4. Create repository interfaces for each entity
5. Create custom error classes (InvalidAmountError, etc.)
6. Create use cases for business logic
7. Add unit tests for entity validation

## Output Contract

- Transaction, Category, Reminder entities with Zod validation
- Repository interfaces for each entity
- Custom error classes for domain validation
- Use cases for CRUD operations
- Unit tests for entity validation

## Example

```typescript
// domain/entities/Transaction.ts
import { z } from 'zod';

export const TransactionType = z.enum(['income', 'expense']);

export const TransactionSchema = z.object({
  id: z.string().uuid(),
  amount: z.number().positive(),
  type: TransactionType,
  categoryId: z.string().uuid(),
  date: z.coerce.date(),
  description: z.string().max(500).optional(),
  tags: z.array(z.string()).default([]),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable().default(null),
});

export type Transaction = z.infer<typeof TransactionSchema>;

// domain/errors.ts
export class InvalidAmountError extends Error {
  constructor() {
    super('Amount must be positive');
    this.name = 'InvalidAmountError';
  }
}

// domain/usecases/CreateTransaction.ts
export class CreateTransactionUseCase {
  constructor(private transactionRepository: ITransactionRepository) {}

  async execute(data: CreateTransaction): Promise<Transaction> {
    if (data.amount <= 0) {
      throw new InvalidAmountError();
    }

    if (data.amount > MAX_TRANSACTION_AMOUNT) {
      throw new AmountExceededError(MAX_TRANSACTION_AMOUNT);
    }

    return this.transactionRepository.create(data);
  }
}
```
