import { renderHook, waitFor } from '@testing-library/react-native';
import { useIncomeEvolution } from '../../../src/modules/finance/hooks/useIncomeEvolution';
import { ITransactionRepository } from '../../../src/domain/repositories/ITransactionRepository';
import { Transaction } from '../../../src/domain/entities/Transaction';

function createTransaction(
  overrides: Partial<Transaction> = {}
): Transaction {
  return {
    id: '00000000-0000-0000-0000-000000000001',
    amount: 100,
    type: 'income',
    categoryId: '00000000-0000-0000-0000-000000000002',
    date: new Date('2024-03-15'),
    tags: [],
    createdAt: new Date('2024-03-15'),
    updatedAt: new Date('2024-03-15'),
    deletedAt: null,
    ...overrides,
  };
}

const dateRange = {
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-12-31'),
};

describe('useIncomeEvolution', () => {
  it('returns loading state initially', async () => {
    const repo = {
      getByDateRange: jest.fn().mockReturnValue(new Promise(() => {})),
    } as unknown as ITransactionRepository;

    const { result } = await renderHook(() =>
      useIncomeEvolution(repo, dateRange)
    );

    expect(result.current.isLoading).toBe(true);
  });

  it('filters income transactions and groups by month', async () => {
    const repo = {
      getByDateRange: jest.fn().mockResolvedValue([
        createTransaction({
          id: '1',
          amount: 1000,
          type: 'income',
          date: new Date('2024-03-10'),
        }),
        createTransaction({
          id: '2',
          amount: 500,
          type: 'expense',
          date: new Date('2024-03-12'),
        }),
        createTransaction({
          id: '3',
          amount: 2000,
          type: 'income',
          date: new Date('2024-05-20'),
        }),
      ]),
    } as unknown as ITransactionRepository;

    const { result } = await renderHook(() =>
      useIncomeEvolution(repo, dateRange)
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.incomes).toHaveLength(2);
    expect(result.current.totals.income).toBe(3000);
    expect(result.current.monthlyData).toHaveLength(2);
    expect(result.current.monthlyData[0]).toMatchObject({
      month: 2,
      year: 2024,
      income: 1000,
      expense: 0,
      balance: 1000,
    });
    expect(result.current.monthlyData[1]).toMatchObject({
      month: 4,
      year: 2024,
      income: 2000,
      expense: 0,
      balance: 2000,
    });
  });

  it('returns empty state when there are no transactions', async () => {
    const repo = {
      getByDateRange: jest.fn().mockResolvedValue([]),
    } as unknown as ITransactionRepository;

    const { result } = await renderHook(() =>
      useIncomeEvolution(repo, dateRange)
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.incomes).toHaveLength(0);
    expect(result.current.monthlyData).toHaveLength(0);
    expect(result.current.totals.income).toBe(0);
  });

  it('handles repository errors', async () => {
    const repo = {
      getByDateRange: jest.fn().mockRejectedValue(new Error('Repo failed')),
    } as unknown as ITransactionRepository;

    const { result } = await renderHook(() =>
      useIncomeEvolution(repo, dateRange)
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).not.toBeNull();
    expect(result.current.error?.message).toBe('Repo failed');
  });

  it('refetch reloads data', async () => {
    const repo = {
      getByDateRange: jest
        .fn()
        .mockResolvedValueOnce([
          createTransaction({
            id: '1',
            amount: 100,
            type: 'income',
            date: new Date('2024-06-01'),
          }),
        ])
        .mockResolvedValueOnce([]),
    } as unknown as ITransactionRepository;

    const { result } = await renderHook(() =>
      useIncomeEvolution(repo, dateRange)
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.incomes).toHaveLength(1);

    result.current.refetch();

    await waitFor(() => expect(result.current.incomes).toHaveLength(0));
  });
});
