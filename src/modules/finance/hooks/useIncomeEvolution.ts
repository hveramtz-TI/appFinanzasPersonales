import { useState, useEffect, useCallback, useRef } from 'react';
import { ITransactionRepository } from '../../../domain/repositories/ITransactionRepository';
import { Transaction } from '../../../domain/entities/Transaction';
import { computeTotals } from '../domain';
import { DateRange, MonthlyEvolutionPoint, PeriodTotals } from '../types';


interface UseIncomeEvolutionResult {
  incomes: Transaction[];
  monthlyData: MonthlyEvolutionPoint[];
  totals: PeriodTotals;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

function normalizeDate(date: Date): Date {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
}

function isWithinRange(date: Date, range: DateRange): boolean {
  const normalized = normalizeDate(date);
  const start = normalizeDate(range.startDate);
  const end = normalizeDate(range.endDate);
  return normalized >= start && normalized <= end;
}

function getMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function buildMonthlyData(transactions: Transaction[]): MonthlyEvolutionPoint[] {
  const grouped = new Map<string, MonthlyEvolutionPoint>();

  for (const transaction of transactions) {
    const key = getMonthKey(transaction.date);
    const existing = grouped.get(key);

    if (existing) {
      existing.income += transaction.amount;
      existing.balance = existing.income - existing.expense;
    } else {
      grouped.set(key, {
        month: transaction.date.getMonth(),
        year: transaction.date.getFullYear(),
        income: transaction.amount,
        expense: 0,
        balance: transaction.amount,
      });
    }
  }

  return Array.from(grouped.values()).sort(
    (a, b) => a.year - b.year || a.month - b.month
  );
}

export function useIncomeEvolution(
  transactionRepo: ITransactionRepository | null | undefined,
  dateRange: DateRange
): UseIncomeEvolutionResult {
  const [incomes, setIncomes] = useState<Transaction[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyEvolutionPoint[]>([]);
  const [totals, setTotals] = useState<PeriodTotals>({
    income: 0,
    expense: 0,
    balance: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const loadRef = useRef<(() => void) | null>(null);

  const load = useCallback(async () => {
    if (!transactionRepo) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const transactions = await transactionRepo.getByDateRange(dateRange);
      const filtered = transactions.filter(
        (transaction) => transaction.type === 'income'
      );

      setIncomes(filtered);
      setMonthlyData(buildMonthlyData(filtered));
      setTotals(computeTotals(filtered));
      setError(null);
    } catch (err: unknown) {
      const caughtError =
        err instanceof Error
          ? err
          : new Error('Error al cargar evolución de ingresos');
      setError(caughtError);
    } finally {
      setIsLoading(false);
    }
  }, [transactionRepo, dateRange]);

  const refetch = useCallback(() => {
    loadRef.current?.();
  }, []);

  useEffect(() => {
    loadRef.current = load;
  }, [load]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    incomes,
    monthlyData,
    totals,
    isLoading,
    error,
    refetch,
  };
}
