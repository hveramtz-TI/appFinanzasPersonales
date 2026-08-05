import * as SQLite from 'expo-sqlite';
import { DatabaseSchema } from '@data/local/DatabaseSchema';

interface Mutation {
  sql: string;
  params: unknown[];
}

interface InMemoryDatabase {
  statements: string[];
  mutations: Mutation[];
}

class InMemoryDatabaseImpl implements InMemoryDatabase {
  statements: string[] = [];
  mutations: Mutation[] = [];
  private tables = new Map<string, Array<Record<string, unknown>>>();

  async execAsync(sql: string): Promise<void> {
    const parts = sql.split(';').map(part => part.trim()).filter(Boolean);
    for (const part of parts) {
      this.statements.push(part);
      const tableMatch = part.match(/CREATE TABLE IF NOT EXISTS\s+(\w+)\s*\(/i);
      if (tableMatch) {
        if (!this.tables.has(tableMatch[1])) {
          this.tables.set(tableMatch[1], []);
        }
      }
    }
  }

  async runAsync(sql: string, ...params: unknown[]): Promise<void> {
    const bindParams = params.length === 1 && Array.isArray(params[0])
      ? params[0]
      : params;
    this.mutations.push({ sql, params: bindParams });

    const insertMatch = sql.match(
      /INSERT(?:\s+OR\s+IGNORE)?\s+INTO\s+(\w+)\s*\(([\s\S]+?)\)\s*VALUES\s*\(([\s\S]+?)\)/i
    );
    if (insertMatch) {
      const tableName = insertMatch[1];
      const columns = insertMatch[2]
        .split(',')
        .map(col => col.trim().replace(/"/g, ''));
      const row: Record<string, unknown> = {};
      columns.forEach((col, index) => {
        row[col] = bindParams[index];
      });
      const table = this.tables.get(tableName) || [];
      table.push(row);
      this.tables.set(tableName, table);
    }
  }

  async getAllAsync(sql: string, ...params: unknown[]): Promise<Record<string, unknown>[]> {
    const match = sql.match(/SELECT\s+\*\s+FROM\s+(\w+)\s*(?:WHERE\s+(.+))?/i);
    if (!match) {
      return [];
    }
    const tableName = match[1];
    const whereClause = match[2];
    const table = this.tables.get(tableName) || [];

    if (!whereClause) {
      return table;
    }

    const whereMatch = whereClause.match(/(\w+)\s*=\s*\?/);
    if (!whereMatch) {
      return table;
    }

    const column = whereMatch[1];
    return table.filter(row => row[column] === params[0]);
  }

  async getFirstAsync(sql: string, ...params: unknown[]): Promise<Record<string, unknown> | null> {
    const rows = await this.getAllAsync(sql, ...params);
    return rows[0] ?? null;
  }
}

function createDatabase(): SQLite.SQLiteDatabase & InMemoryDatabase {
  return new InMemoryDatabaseImpl() as unknown as SQLite.SQLiteDatabase & InMemoryDatabase;
}

describe('DatabaseSchema', () => {
  it('should create the investments table and indexes', async () => {
    const db = createDatabase();
    await DatabaseSchema.initialize(db);

    const tableStatements = db.statements.filter((statement: string) =>
      statement.includes('CREATE TABLE IF NOT EXISTS investments')
    );
    expect(tableStatements.length).toBeGreaterThan(0);

    const expectedIndexes = [
      'idx_investments_type',
      'idx_investments_maturityDate',
      'idx_investments_deletedAt',
    ];
    for (const indexName of expectedIndexes) {
      expect(db.statements.some((statement: string) => statement.includes(indexName))).toBe(true);
    }
  });

  it('should seed the 📈 Inversiones category', async () => {
    const db = createDatabase();
    await DatabaseSchema.initialize(db);

    const rows = await db.getAllAsync(
      'SELECT * FROM categories WHERE id = ?',
      'cat-inversiones'
    );

    expect(rows.length).toBe(1);
    const row = rows[0] as Record<string, unknown>;
    expect(row.id).toBe('cat-inversiones');
    expect(row.name).toBe('📈 Inversiones');
    expect(row.icon).toBe('chart-line');
    expect(row.color).toBe('#4CAF50');
    expect(row.type).toBe('income');
    expect(row.isActive).toBe(1);
  });
});
