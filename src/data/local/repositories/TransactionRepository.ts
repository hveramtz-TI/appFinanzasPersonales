import * as SQLite from 'expo-sqlite';
import { Transaction, CreateTransaction, UpdateTransaction, TransactionSchema } from '../../../domain/entities/Transaction';
import { ITransactionRepository, TransactionFilters, DateRange, MonthlyTotal, CategoryBreakdown } from '../../../domain/repositories/ITransactionRepository';
import { EntityNotFoundError } from '../../../domain/errors';
import { TransactionMapper, TransactionRow } from '../../mappers/TransactionMapper';

interface MonthlyTotalRow {
  month: string;
  type: string;
  total: number;
}

interface CategoryBreakdownRow {
  categoryId: string;
  categoryName: string | null;
  amount: number;
  transactionCount: number;
}

export class TransactionRepository implements ITransactionRepository {
  constructor(private db: SQLite.SQLiteDatabase) {}

  async getAll(filters?: TransactionFilters): Promise<Transaction[]> {
    const { query, params } = this.buildFilteredQuery(filters);
    const rows = await this.db.getAllAsync(query, ...params) as TransactionRow[];
    return rows.map(row => TransactionMapper.fromDatabase(row));
  }

  async getById(id: string): Promise<Transaction | null> {
    const row = await this.db.getFirstAsync(
      'SELECT * FROM transactions WHERE id = ? AND deletedAt IS NULL',
      id
    ) as TransactionRow | null;
    return row ? TransactionMapper.fromDatabase(row) : null;
  }

  async create(transaction: CreateTransaction): Promise<Transaction> {
    const id = crypto.randomUUID();
    const now = new Date();
    const fullTransaction = TransactionSchema.parse({
      ...transaction,
      id,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    });

    const dbData = TransactionMapper.toDatabase(fullTransaction);

    await this.db.runAsync(
      `INSERT INTO transactions (id, amount, type, categoryId, accountId, date, description, tags, notes, createdAt, updatedAt, deletedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        dbData.id,
        dbData.amount,
        dbData.type,
        dbData.categoryId,
        dbData.accountId,
        dbData.date,
        dbData.description,
        dbData.tags,
        dbData.notes,
        dbData.createdAt,
        dbData.updatedAt,
        dbData.deletedAt,
      ]
    );

    return fullTransaction;
  }

  async update(id: string, transaction: UpdateTransaction): Promise<Transaction> {
    const existing = await this.getById(id);
    if (!existing) {
      throw new EntityNotFoundError('Transaction', id);
    }

    const updated = {
      ...existing,
      ...transaction,
      updatedAt: new Date(),
    };

    const dbData = TransactionMapper.toDatabase(updated);

    await this.db.runAsync(
      `UPDATE transactions SET
        amount = ?, type = ?, categoryId = ?, accountId = ?, date = ?,
        description = ?, tags = ?, notes = ?, updatedAt = ?
       WHERE id = ?`,
      [
        dbData.amount,
        dbData.type,
        dbData.categoryId,
        dbData.accountId,
        dbData.date,
        dbData.description,
        dbData.tags,
        dbData.notes,
        dbData.updatedAt,
        id,
      ]
    );

    return updated;
  }

  async delete(id: string): Promise<void> {
    await this.db.runAsync(
      'UPDATE transactions SET deletedAt = ? WHERE id = ?',
      [new Date().getTime(), id]
    );
  }

  async getByCategory(categoryId: string, dateRange?: DateRange): Promise<Transaction[]> {
    return this.getAll({ categoryId, dateRange });
  }

  async getByDateRange(dateRange: DateRange): Promise<Transaction[]> {
    return this.getAll({ dateRange });
  }

  async getMonthlyTotals(year: number): Promise<MonthlyTotal[]> {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59);

    const rows = await this.db.getAllAsync(
      `SELECT
        strftime('%m', datetime(date / 1000, 'unixepoch')) as month,
        type,
        SUM(amount) as total
       FROM transactions
       WHERE date >= ? AND date <= ? AND deletedAt IS NULL
       GROUP BY month, type
       ORDER BY month`,
      [startDate.getTime(), endDate.getTime()]
    ) as MonthlyTotalRow[];

    return this.buildMonthlyTotals(rows, year);
  }

  async getCategoryBreakdown(dateRange: DateRange): Promise<CategoryBreakdown[]> {
    const rows = await this.getCategoryBreakdownRows(dateRange);
    const totalExpense = rows.reduce((sum, row) => sum + row.amount, 0);

    return rows.map(row => ({
      categoryId: row.categoryId,
      categoryName: row.categoryName || 'Sin categoría',
      amount: row.amount,
      percentage: totalExpense > 0 ? (row.amount / totalExpense) * 100 : 0,
      transactionCount: row.transactionCount,
    }));
  }

  private buildFilteredQuery(filters?: TransactionFilters): { query: string; params: (string | number)[] } {
    let query = 'SELECT * FROM transactions WHERE deletedAt IS NULL';
    const params: (string | number)[] = [];

    if (filters?.type) {
      query += ' AND type = ?';
      params.push(filters.type);
    }

    if (filters?.categoryId) {
      query += ' AND categoryId = ?';
      params.push(filters.categoryId);
    }

    if (filters?.dateRange) {
      query += ' AND date >= ? AND date <= ?';
      params.push(filters.dateRange.startDate.getTime());
      params.push(filters.dateRange.endDate.getTime());
    }

    if (filters?.search) {
      query += ' AND description LIKE ?';
      params.push(`%${filters.search}%`);
    }

    query += ' ORDER BY date DESC';

    return { query, params };
  }

  private buildMonthlyTotals(rows: MonthlyTotalRow[], year: number): MonthlyTotal[] {
    const totals = new Map<number, MonthlyTotal>();

    for (let i = 1; i <= 12; i++) {
      totals.set(i, { month: i, year, income: 0, expense: 0, balance: 0 });
    }

    for (const row of rows) {
      const month = parseInt(row.month);
      const type = row.type as 'income' | 'expense';
      const total = row.total;

      const monthTotal = totals.get(month)!;
      if (type === 'income') {
        monthTotal.income = total;
      } else {
        monthTotal.expense = total;
      }
      monthTotal.balance = monthTotal.income - monthTotal.expense;
    }

    return Array.from(totals.values());
  }

  private async getCategoryBreakdownRows(dateRange: DateRange): Promise<CategoryBreakdownRow[]> {
    return (await this.db.getAllAsync(
      `SELECT
        t.categoryId,
        c.name as categoryName,
        SUM(t.amount) as amount,
        COUNT(*) as transactionCount
       FROM transactions t
       LEFT JOIN categories c ON t.categoryId = c.id
       WHERE t.type = 'expense'
         AND t.date >= ? AND t.date <= ?
         AND t.deletedAt IS NULL
       GROUP BY t.categoryId
       ORDER BY amount DESC`,
      [dateRange.startDate.getTime(), dateRange.endDate.getTime()]
    )) as CategoryBreakdownRow[];
  }
}
