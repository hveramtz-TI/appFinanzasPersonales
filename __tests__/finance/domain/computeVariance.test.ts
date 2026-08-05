import { computeVariance } from '@modules/finance/domain';
import { PeriodTotals } from '@modules/finance/types';

describe('computeVariance', () => {
  it('should calculate percentage variance with sign when previous data exists', () => {
    const current: PeriodTotals = { income: 1100, expense: 500, balance: 600 };
    const previous: PeriodTotals = { income: 1000, expense: 400, balance: 400 };

    const result = computeVariance(current, previous);

    expect(result.income).toBe(10);
    expect(result.expense).toBe(25);
    expect(result.balance).toBe(50);
    expect(result.hasPreviousData).toBe(true);
  });

  it('should return zero variance and hasPreviousData=false when previous is zero', () => {
    const current: PeriodTotals = { income: 1000, expense: 500, balance: 500 };
    const previous: PeriodTotals = { income: 0, expense: 0, balance: 0 };

    const result = computeVariance(current, previous);

    expect(result.income).toBe(0);
    expect(result.expense).toBe(0);
    expect(result.balance).toBe(0);
    expect(result.hasPreviousData).toBe(false);
  });

  it('should return zero variance and hasPreviousData=false when both are zero', () => {
    const current: PeriodTotals = { income: 0, expense: 0, balance: 0 };
    const previous: PeriodTotals = { income: 0, expense: 0, balance: 0 };

    const result = computeVariance(current, previous);

    expect(result.income).toBe(0);
    expect(result.expense).toBe(0);
    expect(result.balance).toBe(0);
    expect(result.hasPreviousData).toBe(false);
  });

  it('should handle negative balances', () => {
    const current: PeriodTotals = { income: 1000, expense: 1200, balance: -200 };
    const previous: PeriodTotals = { income: 1000, expense: 1000, balance: 0 };

    const result = computeVariance(current, previous);

    expect(result.income).toBe(0);
    expect(result.expense).toBe(20);
    expect(result.balance).toBe(0);
    expect(result.hasPreviousData).toBe(true);
  });

  it('should handle individual zero previous metrics without throwing', () => {
    const current: PeriodTotals = { income: 1000, expense: 500, balance: 500 };
    const previous: PeriodTotals = { income: 0, expense: 400, balance: 300 };

    const result = computeVariance(current, previous);

    expect(result.income).toBe(0);
    expect(result.expense).toBe(25);
    expect(result.balance).toBeCloseTo(66.67, 2);
    expect(result.hasPreviousData).toBe(true);
  });
});
