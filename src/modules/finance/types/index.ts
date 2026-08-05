export interface PeriodTotals {
  income: number;
  expense: number;
  balance: number;
}

export interface VarianceResult {
  income: number;
  expense: number;
  balance: number;
  hasPreviousData: boolean;
}

export interface TopExpense {
  categoryId: string;
  categoryName: string;
  amount: number;
  percentage: number;
}

export interface MonthlyEvolutionPoint {
  month: number;
  year: number;
  income: number;
  expense: number;
  balance: number;
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface FinanceIndicators {
  current: PeriodTotals;
  previous: PeriodTotals;
  variance: VarianceResult;
  topExpenses: TopExpense[];
  monthlyEvolution: MonthlyEvolutionPoint[];
  isLoading: boolean;
  error: Error | null;
}
