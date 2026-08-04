import { Reminder, CreateReminder, UpdateReminder } from '../entities/Reminder';

export interface IReminderRepository {
  getAll(includeInactive?: boolean): Promise<Reminder[]>;
  getById(id: string): Promise<Reminder | null>;
  getUpcoming(days: number): Promise<Reminder[]>;
  create(reminder: CreateReminder): Promise<Reminder>;
  update(id: string, reminder: UpdateReminder): Promise<Reminder>;
  delete(id: string): Promise<void>;
  markAsPaid(id: string): Promise<Reminder>;
}
