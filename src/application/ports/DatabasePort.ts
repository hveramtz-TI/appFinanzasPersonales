export interface DatabasePort {
  execAsync(sql: string): Promise<void>;
  getAllAsync<T = unknown>(sql: string, ...args: unknown[]): Promise<T[]>;
  getFirstAsync<T = unknown>(sql: string, ...args: unknown[]): Promise<T | null>;
  runAsync(sql: string, ...args: unknown[]): Promise<void>;
}

export interface DatabaseConnectionFactory {
  getDatabase(): Promise<DatabasePort>;
}
