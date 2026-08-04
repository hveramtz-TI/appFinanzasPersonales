# Example

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
