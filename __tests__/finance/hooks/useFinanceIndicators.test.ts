import { renderHook, waitFor } from '@testing-library/react-native';
import { Transaction } from '@domain/entities/Transaction';
import {
  ITransactionRepository,
  DateRange,
  MonthlyTotal,
  CategoryBreakdown,
} from '@domain/repositories/ITransactionRepository';
import { useFinanceIndicators } from '@modules/finance/hooks/useFinanceIndicators';

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

function createMockRepository(
  overrides: Partial<ITransactionRepository> = {}
): ITransactionRepository {
  return {
    getAll: jest.fn().mockResolvedValue([]),
    getById: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockRejectedValue(new Error('Not implemented')),
    update: jest.fn().mockRejectedValue(new Error('Not implemented')),
    delete: jest.fn().mockRejectedValue(new Error('Not implemented')),
    getByCategory: jest.fn().mockResolvedValue([]),
    getByDateRange: jest.fn().mockResolvedValue([]),
    getByReminderIdAndPeriod: jest.fn().mockResolvedValue([]),
    getMonthlyTotals: jest.fn().mockResolvedValue([]),
    getCategoryBreakdown: jest.fn().mockResolvedValue([]),
    ...overrides,
  };
}

describe('useFinanceIndicators', () => {
  const referenceDate = new Date('2026-08-15');

  it('should return calculated indicators when repository resolves', async () => {
    const currentTransactions: Transaction[] = [
      createTransaction({ amount: 1000, type: 'income' }),
      createTransaction({
        amount: 300,
        type: 'expense',
        categoryId: 'cat-1',
      }),
      createTransaction({
        amount: 200,
        type: 'expense',
        categoryId: 'cat-2',
      }),
    ];

    const previousTransactions: Transaction[] = [
      createTransaction({ amount: 800, type: 'income' }),
      createTransaction({
        amount: 400,
        type: 'expense',
        categoryId: 'cat-1',
      }),
    ];

    const categoryBreakdown: CategoryBreakdown[] = [
      {
        categoryId: 'cat-1',
        categoryName: 'Food',
        amount: 300,
        percentage: 60,
        transactionCount: 1,
      },
      {
        categoryId: 'cat-2',
        categoryName: 'Transport',
        amount: 200,
        percentage: 40,
        transactionCount: 1,
      },
    ];

    const monthlyTotals: MonthlyTotal[] = [
      { month: 8, year: 2026, income: 1000, expense: 500, balance: 500 },
    ];

    const repo = createMockRepository({
      getByDateRange: jest.fn((range: DateRange) => {
        const rangeMonth = range.startDate.getMonth();
        return Promise.resolve(
          rangeMonth === referenceDate.getMonth()
            ? currentTransactions
            : previousTransactions
        );
      }),
      getCategoryBreakdown: jest.fn().mockResolvedValue(categoryBreakdown),
      getMonthlyTotals: jest.fn().mockResolvedValue(monthlyTotals),
    });

    const { result } = await renderHook(() =>
      useFinanceIndicators(repo, referenceDate)
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBeNull();
    expect(result.current.current).toEqual({
      income: 1000,
      expense: 500,
      balance: 500,
    });
    expect(result.current.previous).toEqual({
      income: 800,
      expense: 400,
      balance: 400,
    });
    expect(result.current.variance.hasPreviousData).toBe(true);
    expect(result.current.topExpenses).toHaveLength(2);
    expect(result.current.topExpenses[0]).toEqual({
      categoryId: 'cat-1',
      categoryName: 'Food',
      amount: 300,
      percentage: 60,
    });
    expect(result.current.monthlyEvolution).toEqual(monthlyTotals);
  });

  it('should expose error state when repository rejects', async () => {
    const repo = createMockRepository({
      getByDateRange: jest.fn().mockRejectedValue(new Error('Database failure')),
    });

    const { result } = await renderHook(() =>
      useFinanceIndicators(repo, referenceDate)
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('Database failure');
  });

  it('should request the correct year for monthly evolution', async () => {
    const getMonthlyTotals = jest.fn().mockResolvedValue([]);
    const repo = createMockRepository({ getMonthlyTotals });

    await renderHook(() => useFinanceIndicators(repo, referenceDate));

    await waitFor(() => expect(getMonthlyTotals).toHaveBeenCalledWith(2026));
  });
});
