import { z } from 'zod';

export const TransactionType = z.enum(['income', 'expense']);
export type TransactionType = z.infer<typeof TransactionType>;

export const TransactionSchema = z.object({
  id: z.string().uuid(),
  amount: z.number().positive(),
  type: TransactionType,
  categoryId: z.string().uuid(),
  accountId: z.string().uuid().optional(),
  reminderId: z.string().uuid().optional(),
  date: z.coerce.date(),
  description: z.string().max(500).optional(),
  tags: z.array(z.string()).default([]),
  notes: z.string().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable().default(null),
});

export type Transaction = z.infer<typeof TransactionSchema>;

export type CreateTransaction = Omit<Transaction, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>;
export type UpdateTransaction = Partial<CreateTransaction>;
