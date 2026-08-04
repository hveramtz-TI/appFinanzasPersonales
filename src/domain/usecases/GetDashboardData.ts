import { Transaction } from '../entities/Transaction';
import { Category } from '../entities/Category';
import { ITransactionRepository, DateRange, CategoryBreakdown } from '../repositories/ITransactionRepository';
import { ICategoryRepository } from '../repositories/ICategoryRepository';
import { DEFAULT_CATEGORY_NAME } from '../../shared/constants/business';

export interface DashboardData {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  categoryBreakdown: CategoryBreakdown[];
  transactionCount: number;
}

export class GetDashboardDataUseCase {
  constructor(
    private transactionRepository: ITransactionRepository,
    private categoryRepository: ICategoryRepository
  ) {}

  async execute(dateRange: DateRange): Promise<DashboardData> {
    const [transactions, categories] = await Promise.all([
      this.transactionRepository.getByDateRange(dateRange),
      this.categoryRepository.getAll(),
    ]);

    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const categoryBreakdown = this.calculateCategoryBreakdown(
      transactions.filter(t => t.type === 'expense'),
      categories,
      totalExpense
    );

    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      categoryBreakdown,
      transactionCount: transactions.length,
    };
  }

  private calculateCategoryBreakdown(
    expenses: Transaction[],
    categories: Category[],
    totalExpense: number
  ): CategoryBreakdown[] {
    if (totalExpense === 0) {
      return [];
    }

    // Single-pass grouping with counts
    const grouped = new Map<string, { amount: number; count: number }>();

    for (const transaction of expenses) {
      const existing = grouped.get(transaction.categoryId);
      if (existing) {
        existing.amount += transaction.amount;
        existing.count += 1;
      } else {
        grouped.set(transaction.categoryId, {
          amount: transaction.amount,
          count: 1,
        });
      }
    }

    return Array.from(grouped.entries()).map(([categoryId, data]) => {
      const category = categories.find(c => c.id === categoryId);
      return {
        categoryId,
        categoryName: category?.name || DEFAULT_CATEGORY_NAME,
        amount: data.amount,
        percentage: (data.amount / totalExpense) * 100,
        transactionCount: data.count,
      };
    });
  }
}
