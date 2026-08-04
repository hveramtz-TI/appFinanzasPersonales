# Example

```typescript
// domain/entities/Transaction.ts
import { z } from 'zod';

export const TransactionSchema = z.object({
  id: z.string().uuid(),
  amount: z.number().positive(),
  type: z.enum(['income', 'expense']),
  categoryId: z.string().uuid(),
  date: z.coerce.date(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

// domain/repositories/ITransactionRepository.ts
export interface ITransactionRepository {
  getAll(): Promise<Transaction[]>;
  create(data: CreateTransaction): Promise<Transaction>;
  update(id: string, data: UpdateTransaction): Promise<Transaction>;
  delete(id: string): Promise<void>;
}

// data/local/repositories/TransactionRepository.ts
export class TransactionRepository implements ITransactionRepository {
  constructor(private db: SQLiteDatabase) {}
  
  async getAll(): Promise<Transaction[]> {
    const rows = await this.db.getAllAsync('SELECT * FROM transactions');
    return rows.map(row => TransactionMapper.fromDatabase(row));
  }
}
```
