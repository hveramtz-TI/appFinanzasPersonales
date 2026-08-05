import { Transaction, TransactionType } from '../../domain/entities/Transaction';
import { EntityNotFoundError } from '../../domain/errors';

export interface TransactionRow {
  id: string;
  amount: number;
  type: string;
  categoryId: string;
  accountId: string | null;
  reminderId: string | null;
  date: number;
  description: string | null;
  tags: string;
  notes: string | null;
  createdAt: number;
  updatedAt: number;
  deletedAt: number | null;
}

export class TransactionMapper {
  static toDatabase(transaction: Transaction): TransactionRow {
    return {
      id: transaction.id,
      amount: transaction.amount,
      type: transaction.type,
      categoryId: transaction.categoryId,
      accountId: transaction.accountId ?? null,
      reminderId: transaction.reminderId ?? null,
      date: transaction.date.getTime(),
      description: transaction.description ?? null,
      tags: JSON.stringify(transaction.tags),
      notes: transaction.notes ?? null,
      createdAt: transaction.createdAt.getTime(),
      updatedAt: transaction.updatedAt.getTime(),
      deletedAt: transaction.deletedAt?.getTime() ?? null,
    };
  }

  static fromDatabase(row: TransactionRow): Transaction {
    return {
      id: row.id,
      amount: row.amount,
      type: TransactionType.parse(row.type),
      categoryId: row.categoryId,
      accountId: row.accountId ?? undefined,
      reminderId: row.reminderId ?? undefined,
      date: new Date(row.date),
      description: row.description ?? undefined,
      tags: JSON.parse(row.tags ?? '[]'),
      notes: row.notes ?? undefined,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
      deletedAt: row.deletedAt ? new Date(row.deletedAt) : null,
    };
  }
}

export { EntityNotFoundError };
