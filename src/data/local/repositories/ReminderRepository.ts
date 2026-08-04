import * as SQLite from 'expo-sqlite';
import { Reminder, CreateReminder, UpdateReminder, ReminderSchema } from '../../domain/entities/Reminder';
import { IReminderRepository } from '../../domain/repositories/IReminderRepository';
import { EntityNotFoundError } from '../../domain/errors';
import { ReminderMapper, ReminderRow } from '../mappers/ReminderMapper';

export class ReminderRepository implements IReminderRepository {
  constructor(private db: SQLite.SQLiteDatabase) {}

  async getAll(includeInactive = false): Promise<Reminder[]> {
    const query = includeInactive
      ? 'SELECT * FROM reminders ORDER BY nextDate ASC'
      : 'SELECT * FROM reminders WHERE isActive = 1 ORDER BY nextDate ASC';

    const rows = await this.db.getAllAsync(query) as ReminderRow[];
    return rows.map(row => ReminderMapper.fromDatabase(row));
  }

  async getById(id: string): Promise<Reminder | null> {
    const row = await this.db.getFirstAsync(
      'SELECT * FROM reminders WHERE id = ?',
      id
    ) as ReminderRow | null;
    return row ? ReminderMapper.fromDatabase(row) : null;
  }

  async getUpcoming(days: number): Promise<Reminder[]> {
    const now = new Date();
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    const rows = await this.db.getAllAsync(
      `SELECT * FROM reminders
       WHERE isActive = 1
         AND nextDate >= ? AND nextDate <= ?
       ORDER BY nextDate ASC`,
      [now.getTime(), futureDate.getTime()]
    ) as ReminderRow[];

    return rows.map(row => ReminderMapper.fromDatabase(row));
  }

  async create(reminder: CreateReminder): Promise<Reminder> {
    const id = crypto.randomUUID();
    const now = new Date();
    const fullReminder = ReminderSchema.parse({
      ...reminder,
      id,
      createdAt: now,
      updatedAt: now,
    });

    const dbData = ReminderMapper.toDatabase(fullReminder);

    await this.db.runAsync(
      `INSERT INTO reminders (id, title, amount, frequency, nextDate, categoryId, payee, notes, notificationEnabled, notificationTime, isActive, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        dbData.id,
        dbData.title,
        dbData.amount,
        dbData.frequency,
        dbData.nextDate,
        dbData.categoryId,
        dbData.payee,
        dbData.notes,
        dbData.notificationEnabled,
        dbData.notificationTime,
        dbData.isActive,
        dbData.createdAt,
        dbData.updatedAt,
      ]
    );

    return fullReminder;
  }

  async update(id: string, reminder: UpdateReminder): Promise<Reminder> {
    const existing = await this.getById(id);
    if (!existing) {
      throw new EntityNotFoundError('Reminder', id);
    }

    const updated = {
      ...existing,
      ...reminder,
      updatedAt: new Date(),
    };

    const dbData = ReminderMapper.toDatabase(updated);

    await this.db.runAsync(
      `UPDATE reminders SET
        title = ?, amount = ?, frequency = ?, nextDate = ?, categoryId = ?,
        payee = ?, notes = ?, notificationEnabled = ?, notificationTime = ?,
        isActive = ?, updatedAt = ?
       WHERE id = ?`,
      [
        dbData.title,
        dbData.amount,
        dbData.frequency,
        dbData.nextDate,
        dbData.categoryId,
        dbData.payee,
        dbData.notes,
        dbData.notificationEnabled,
        dbData.notificationTime,
        dbData.isActive,
        dbData.updatedAt,
        id,
      ]
    );

    return updated;
  }

  async delete(id: string): Promise<void> {
    await this.db.runAsync('DELETE FROM reminders WHERE id = ?', id);
  }

  async markAsPaid(id: string): Promise<Reminder> {
    const reminder = await this.getById(id);
    if (!reminder) {
      throw new EntityNotFoundError('Reminder', id);
    }

    const nextDate = this.calculateNextDate(reminder.nextDate, reminder.frequency);

    return this.update(id, { nextDate });
  }

  private calculateNextDate(currentDate: Date, frequency: string): Date {
    const next = new Date(currentDate);

    switch (frequency) {
      case 'daily':
        next.setDate(next.getDate() + 1);
        break;
      case 'weekly':
        next.setDate(next.getDate() + 7);
        break;
      case 'monthly':
        next.setMonth(next.getMonth() + 1);
        break;
      case 'yearly':
        next.setFullYear(next.getFullYear() + 1);
        break;
      case 'once':
        break;
    }

    return next;
  }
}
