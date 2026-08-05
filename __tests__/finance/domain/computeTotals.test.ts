import { Transaction } from '@domain/entities/Transaction';
import { computeTotals } from '@modules/finance/domain';

function createTransaction(
  overrides: Partial<Transaction> = {}
): Transaction {
  return {
    id: '123e4567-e89b-12d3-a456-426614174000',
    amount: 100,
    type: 'expense',
    categoryId: '123e4567-e89b-12d3-a456-426614174001',
    accountId: '123e4567-e89b-12d3-a456-426614174002',
    date: new Date('2026-08-01'),
    description: 'Test transaction',
    tags: [],
    notes: '',
    createdAt: new Date('2026-08-01'),
    updatedAt: new Date('2026-08-01'),
    deletedAt: null,
    ...overrides,
  } as Transaction;
}

describe('computeTotals', () => {
  it('should calculate income, expense and balance for mixed transactions', () => {
    const transactions: Transaction[] = [
      createTransaction({ amount: 1000, type: 'income' }),
      createTransaction({ amount: 300, type: 'expense' }),
      createTransaction({ amount: 200, type: 'expense' }),
    ];

    const result = computeTotals(transactions);

    expect(result.income).toBe(1000);
    expect(result.expense).toBe(500);
    expect(result.balance).toBe(500);
  });

  it('should return zeros for an empty period', () => {
    const result = computeTotals([]);

    expect(result.income).toBe(0);
    expect(result.expense).toBe(0);
    expect(result.balance).toBe(0);
  });

  it('should handle only income transactions', () => {
    const transactions: Transaction[] = [
      createTransaction({ amount: 1000, type: 'income' }),
      createTransaction({ amount: 2500, type: 'income' }),
    ];

    const result = computeTotals(transactions);

    expect(result.income).toBe(3500);
    expect(result.expense).toBe(0);
    expect(result.balance).toBe(3500);
  });

  it('should handle only expense transactions', () => {
    const transactions: Transaction[] = [
      createTransaction({ amount: 100, type: 'expense' }),
      createTransaction({ amount: 200, type: 'expense' }),
    ];

    const result = computeTotals(transactions);

    expect(result.income).toBe(0);
    expect(result.expense).toBe(300);
    expect(result.balance).toBe(-300);
  });
});
