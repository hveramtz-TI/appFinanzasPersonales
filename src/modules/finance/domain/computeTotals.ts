import { Transaction } from '@domain/entities/Transaction';
import { PeriodTotals } from '../types';

export function computeTotals(transactions: Transaction[]): PeriodTotals {
  return transactions.reduce<PeriodTotals>(
    (totals, transaction) => {
      if (transaction.type === 'income') {
        totals.income += transaction.amount;
      } else {
        totals.expense += transaction.amount;
      }
      totals.balance = totals.income - totals.expense;
      return totals;
    },
    { income: 0, expense: 0, balance: 0 }
  );
}
