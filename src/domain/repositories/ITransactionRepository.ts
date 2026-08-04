import { Transaction, CreateTransaction, UpdateTransaction } from '../entities/Transaction';

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface TransactionFilters {
  type?: 'income' | 'expense';
  categoryId?: string;
  accountId?: string;
  dateRange?: DateRange;
  tags?: string[];
  search?: string;
}

export interface MonthlyTotal {
  month: number;
  year: number;
  income: number;
  expense: number;
  balance: number;
}

export interface CategoryBreakdown {
  categoryId: string;
  categoryName: string;
  amount: number;
  percentage: number;
  transactionCount: number;
}

export interface ITransactionRepository {
  getAll(filters?: TransactionFilters): Promise<Transaction[]>;
  getById(id: string): Promise<Transaction | null>;
  create(transaction: CreateTransaction): Promise<Transaction>;
  update(id: string, transaction: UpdateTransaction): Promise<Transaction>;
  delete(id: string): Promise<void>;
  
  getByCategory(categoryId: string, dateRange?: DateRange): Promise<Transaction[]>;
  getByDateRange(dateRange: DateRange): Promise<Transaction[]>;
  getMonthlyTotals(year: number): Promise<MonthlyTotal[]>;
  getCategoryBreakdown(dateRange: DateRange): Promise<CategoryBreakdown[]>;
}
