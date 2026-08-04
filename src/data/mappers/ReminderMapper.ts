import { Reminder, ReminderFrequency } from '../../domain/entities/Reminder';
import { EntityNotFoundError } from '../../domain/errors';

export interface ReminderRow {
  id: string;
  title: string;
  amount: number;
  frequency: string;
  nextDate: number;
  categoryId: string | null;
  payee: string | null;
  notes: string | null;
  notificationEnabled: number;
  notificationTime: string;
  isActive: number;
  createdAt: number;
  updatedAt: number;
}

export class ReminderMapper {
  static toDatabase(reminder: Reminder): ReminderRow {
    return {
      id: reminder.id,
      title: reminder.title,
      amount: reminder.amount,
      frequency: reminder.frequency,
      nextDate: reminder.nextDate.getTime(),
      categoryId: reminder.categoryId ?? null,
      payee: reminder.payee ?? null,
      notes: reminder.notes ?? null,
      notificationEnabled: reminder.notificationEnabled ? 1 : 0,
      notificationTime: reminder.notificationTime,
      isActive: reminder.isActive ? 1 : 0,
      createdAt: reminder.createdAt.getTime(),
      updatedAt: reminder.updatedAt.getTime(),
    };
  }

  static fromDatabase(row: ReminderRow): Reminder {
    return {
      id: row.id,
      title: row.title,
      amount: row.amount,
      frequency: ReminderFrequency.parse(row.frequency),
      nextDate: new Date(row.nextDate),
      categoryId: row.categoryId ?? undefined,
      payee: row.payee ?? undefined,
      notes: row.notes ?? undefined,
      notificationEnabled: row.notificationEnabled === 1,
      notificationTime: row.notificationTime,
      isActive: row.isActive === 1,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    };
  }
}

export { EntityNotFoundError };
