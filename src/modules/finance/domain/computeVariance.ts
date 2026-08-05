import { PeriodTotals, VarianceResult } from '../types';

function calculateVariance(current: number, previous: number): number {
  if (previous === 0) {
    return 0;
  }
  return ((current - previous) / previous) * 100;
}

export function computeVariance(
  current: PeriodTotals,
  previous: PeriodTotals
): VarianceResult {
  const hasPreviousData =
    previous.income !== 0 || previous.expense !== 0 || previous.balance !== 0;

  return {
    income: calculateVariance(current.income, previous.income),
    expense: calculateVariance(current.expense, previous.expense),
    balance: calculateVariance(current.balance, previous.balance),
    hasPreviousData,
  };
}
