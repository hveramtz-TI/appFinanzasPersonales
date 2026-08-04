import * as SQLite from 'expo-sqlite';

export class DatabaseSchema {
  static async initialize(db: SQLite.SQLiteDatabase): Promise<void> {
    await this.createTables(db);
    await this.createIndexes(db);
  }

  private static async createTables(db: SQLite.SQLiteDatabase): Promise<void> {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        icon TEXT NOT NULL,
        color TEXT NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
        parentId TEXT,
        "order" INTEGER NOT NULL DEFAULT 0,
        isActive INTEGER NOT NULL DEFAULT 1,
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL,
        FOREIGN KEY (parentId) REFERENCES categories(id)
      );
    `);

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY NOT NULL,
        amount REAL NOT NULL CHECK (amount > 0),
        type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
        categoryId TEXT NOT NULL,
        accountId TEXT,
        date INTEGER NOT NULL,
        description TEXT,
        tags TEXT NOT NULL DEFAULT '[]',
        notes TEXT,
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL,
        deletedAt INTEGER,
        FOREIGN KEY (categoryId) REFERENCES categories(id)
      );
    `);

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS reminders (
        id TEXT PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        amount REAL NOT NULL CHECK (amount > 0),
        frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'yearly', 'once')),
        nextDate INTEGER NOT NULL,
        categoryId TEXT,
        payee TEXT,
        notes TEXT,
        notificationEnabled INTEGER NOT NULL DEFAULT 1,
        notificationTime TEXT NOT NULL DEFAULT '09:00',
        isActive INTEGER NOT NULL DEFAULT 1,
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL,
        FOREIGN KEY (categoryId) REFERENCES categories(id)
      );
    `);

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS sync_queue (
        id TEXT PRIMARY KEY NOT NULL,
        entityType TEXT NOT NULL,
        entityId TEXT NOT NULL,
        operation TEXT NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
        payload TEXT NOT NULL,
        retryCount INTEGER NOT NULL DEFAULT 0,
        createdAt INTEGER NOT NULL
      );
    `);
  }

  private static async createIndexes(db: SQLite.SQLiteDatabase): Promise<void> {
    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
      CREATE INDEX IF NOT EXISTS idx_transactions_categoryId ON transactions(categoryId);
      CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
      CREATE INDEX IF NOT EXISTS idx_transactions_deletedAt ON transactions(deletedAt);
      CREATE INDEX IF NOT EXISTS idx_reminders_nextDate ON reminders(nextDate);
      CREATE INDEX IF NOT EXISTS idx_reminders_isActive ON reminders(isActive);
      CREATE INDEX IF NOT EXISTS idx_categories_type ON categories(type);
      CREATE INDEX IF NOT EXISTS idx_sync_queue_createdAt ON sync_queue(createdAt);
    `);
  }
}
