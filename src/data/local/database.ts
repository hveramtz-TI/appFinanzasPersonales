import * as SQLite from 'expo-sqlite';
import { DatabaseSchema } from './DatabaseSchema';
import { DB_NAME } from '../../shared/constants/business';

let dbInstance: SQLite.SQLiteDatabase | null = null;

export class DatabaseConnection {
  static async getInstance(): Promise<SQLite.SQLiteDatabase> {
    if (!dbInstance) {
      dbInstance = await SQLite.openDatabaseAsync(DB_NAME);
      await DatabaseSchema.initialize(dbInstance);
    }
    return dbInstance;
  }
}

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  return DatabaseConnection.getInstance();
}
