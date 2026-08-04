import type { SQLiteRunResult } from 'expo-sqlite';

export interface DatabasePort {
  execAsync(sql: string): Promise<void>;
  getAllAsync<T = unknown>(sql: string, ...args: unknown[]): Promise<T[]>;
  getFirstAsync<T = unknown>(sql: string, ...args: unknown[]): Promise<T | null>;
  runAsync(sql: string, ...args: unknown[]): Promise<SQLiteRunResult>;
}

export interface DatabaseConnectionFactory {
  getDatabase(): Promise<DatabasePort>;
}
