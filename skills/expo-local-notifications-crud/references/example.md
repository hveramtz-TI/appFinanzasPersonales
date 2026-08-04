# Example

```typescript
// domain/entities/Reminder.ts
export const ReminderFrequency = z.enum(['daily', 'weekly', 'monthly', 'yearly', 'once']);

export const ReminderSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(100),
  amount: z.number().positive(),
  frequency: ReminderFrequency,
  nextDate: z.coerce.date(),
  notificationEnabled: z.boolean().default(true),
  notificationTime: z.string().regex(/^\d{2}:\d{2}$/).default('09:00'),
  isActive: z.boolean().default(true),
});

// data/local/repositories/ReminderRepository.ts
async markAsPaid(id: string): Promise<Reminder> {
  const reminder = await this.getById(id);
  if (!reminder) throw new EntityNotFoundError('Reminder', id);

  const nextDate = this.calculateNextDate(reminder.nextDate, reminder.frequency);
  return this.update(id, { nextDate });
}

private calculateNextDate(currentDate: Date, frequency: string): Date {
  const next = new Date(currentDate);
  switch (frequency) {
    case 'daily': next.setDate(next.getDate() + 1); break;
    case 'weekly': next.setDate(next.getDate() + 7); break;
    case 'monthly': next.setMonth(next.getMonth() + 1); break;
    case 'yearly': next.setFullYear(next.getFullYear() + 1); break;
  }
  return next;
}
```
