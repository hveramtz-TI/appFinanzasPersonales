import { z } from 'zod';

export const ReminderFrequency = z.enum(['daily', 'weekly', 'monthly', 'yearly', 'once']);
export type ReminderFrequency = z.infer<typeof ReminderFrequency>;

export const ReminderSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(100),
  amount: z.number().positive(),
  frequency: ReminderFrequency,
  nextDate: z.coerce.date(),
  categoryId: z.string().uuid().optional(),
  payee: z.string().max(100).optional(),
  notes: z.string().optional(),
  notificationEnabled: z.boolean().default(true),
  notificationTime: z.string().regex(/^\d{2}:\d{2}$/).default('09:00'),
  isActive: z.boolean().default(true),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type Reminder = z.infer<typeof ReminderSchema>;

export type CreateReminder = Omit<Reminder, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateReminder = Partial<CreateReminder>;
