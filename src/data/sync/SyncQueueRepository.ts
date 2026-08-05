import * as SQLite from 'expo-sqlite';
import { SyncQueueItem } from './types';
import { generateUUID } from '../../shared/utils/uuid';

export class SyncQueueRepository {
  constructor(private db: SQLite.SQLiteDatabase) {}

  async add(
    entityType: string,
    entityId: string,
    operation: 'INSERT' | 'UPDATE' | 'DELETE',
    payload: any
  ): Promise<void> {
    const id = generateUUID();
    const now = new Date().getTime();

    await this.db.runAsync(
      `INSERT INTO sync_queue (id, entityType, entityId, operation, payload, retryCount, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, entityType, entityId, operation, JSON.stringify(payload), 0, now]
    );
  }

  async getPending(limit: number, maxRetries: number): Promise<SyncQueueItem[]> {
    const rows = await this.db.getAllAsync(
      `SELECT * FROM sync_queue
       WHERE retryCount < ?
       ORDER BY createdAt ASC
       LIMIT ?`,
      maxRetries,
      limit
    );
    return rows as SyncQueueItem[];
  }

  async remove(id: string): Promise<void> {
    await this.db.runAsync('DELETE FROM sync_queue WHERE id = ?', id);
  }

  async incrementRetryCount(id: string): Promise<void> {
    await this.db.runAsync(
      'UPDATE sync_queue SET retryCount = retryCount + 1 WHERE id = ?',
      id
    );
  }
}
