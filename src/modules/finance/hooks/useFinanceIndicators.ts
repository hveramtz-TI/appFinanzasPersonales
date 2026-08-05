import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ITransactionRepository,
  MonthlyTotal,
  CategoryBreakdown,
} from '@domain/repositories/ITransactionRepository';
import { computeTotals, computeVariance } from '../domain';
import {
  FinanceIndicators,
  TopExpense,
  MonthlyEvolutionPoint,
  DateRange,
} from '../types';

const DEFAULT_INDICATORS: FinanceIndicators = {
  current: { income: 0, expense: 0, balance: 0 },
  previous: { income: 0, expense: 0, balance: 0 },
  variance: { income: 0, expense: 0, balance: 0, hasPreviousData: false },
  topExpenses: [],
  monthlyEvolution: [],
  isLoading: true,
  error: null,
};

function getMonthRange(date: Date): DateRange {
  const year = date.getFullYear();
  const month = date.getMonth();
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);
  return { startDate, endDate };
}

function getPreviousMonthRange(date: Date): DateRange {
  const year = date.getFullYear();
  const month = date.getMonth();
  const previousMonth = month === 0 ? 11 : month - 1;
  const previousYear = month === 0 ? year - 1 : year;
  const startDate = new Date(previousYear, previousMonth, 1);
  const endDate = new Date(previousYear, previousMonth + 1, 0, 23, 59, 59, 999);
  return { startDate, endDate };
}

function mapCategoryBreakdownToTopExpenses(
  breakdown: CategoryBreakdown[]
): TopExpense[] {
  return breakdown.map((item) => ({
    categoryId: item.categoryId,
    categoryName: item.categoryName,
    amount: item.amount,
    percentage: item.percentage,
  }));
}

function mapMonthlyTotalsToEvolution(
  totals: MonthlyTotal[]
): MonthlyEvolutionPoint[] {
  return totals.map((total) => ({
    month: total.month,
    year: total.year,
    income: total.income,
    expense: total.expense,
    balance: total.balance,
  }));
}

export function useFinanceIndicators(
  transactionRepo: ITransactionRepository,
  referenceDate?: Date
): FinanceIndicators {
  const resolvedReferenceDate = useMemo(
    () => referenceDate ?? new Date(),
    [referenceDate]
  );
  const [indicators, setIndicators] = useState<FinanceIndicators>(
    DEFAULT_INDICATORS
  );

  const loadIndicators = useCallback(async () => {
    setIndicators((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const currentRange = getMonthRange(resolvedReferenceDate);
      const previousRange = getPreviousMonthRange(resolvedReferenceDate);

      const [
        currentTransactions,
        previousTransactions,
        categoryBreakdown,
        monthlyTotals,
      ] = await Promise.all([
        transactionRepo.getByDateRange(currentRange),
        transactionRepo.getByDateRange(previousRange),
        transactionRepo.getCategoryBreakdown(currentRange),
        transactionRepo.getMonthlyTotals(resolvedReferenceDate.getFullYear()),
      ]);

      const current = computeTotals(currentTransactions);
      const previous = computeTotals(previousTransactions);
      const variance = computeVariance(current, previous);
      const topExpenses = mapCategoryBreakdownToTopExpenses(
        categoryBreakdown.slice(0, 5)
      );
      const monthlyEvolution = mapMonthlyTotalsToEvolution(monthlyTotals);

      setIndicators({
        current,
        previous,
        variance,
        topExpenses,
        monthlyEvolution,
        isLoading: false,
        error: null,
      });
    } catch (err: unknown) {
      const error =
        err instanceof Error
          ? err
          : new Error('Error al cargar indicadores financieros');
      setIndicators((prev) => ({
        ...prev,
        isLoading: false,
        error,
      }));
    }
  }, [transactionRepo, resolvedReferenceDate]);

  useEffect(() => {
    loadIndicators();
  }, [loadIndicators]);

  return indicators;
}
