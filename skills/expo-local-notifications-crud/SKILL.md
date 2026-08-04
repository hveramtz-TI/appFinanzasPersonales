---
name: expo-local-notifications-crud
description: "Trigger: local notifications, reminders, scheduled notifications, recordatorios, notificaciones locales. Create CRUD system for local scheduled notifications with daily/weekly/monthly triggers, permission handling, and notification channels."
license: Apache-2.0
metadata:
  author: "gentle-ai"
  version: "1.0"
---

# Expo Local Notifications CRUD

## Activation Contract

Create local notification system when:
- Need scheduled reminders (daily, weekly, monthly)
- App must work in Expo Go (no dev build required)
- Require CRUD operations for notification management
- Want persistent notification storage in SQLite

## Hard Rules

- Use expo-notifications with scheduleNotificationAsync
- Request permissions before scheduling
- Store notifications in SQLite for persistence
- Implement frequency types: daily, weekly, monthly, yearly, once
- Handle notification cancellation properly
- Use DAILY/WEEKLY/MONTHLY triggers (not TIME_INTERVAL)
- Calculate next date when marking as paid

## Decision Gates

| Need | Approach |
|------|----------|
| Simple reminders | Use DAILY trigger with fixed time |
| Recurring payments | Use MONTHLY trigger with date calculation |
| One-time alerts | Use DATE trigger with specific datetime |
| Complex schedules | Use custom trigger with date math |

## Execution Steps

1. Create Reminder entity with Zod validation
2. Create IReminderRepository interface
3. Implement ReminderRepository with SQLite
4. Create useReminders hook with CRUD operations
5. Add notification scheduling logic
6. Implement markAsPaid with next date calculation
7. Create UI components for reminder management

## Output Contract

- Reminder entity with frequency types
- SQLite repository with CRUD operations
- useReminders hook with notification scheduling
- markAsPaid with automatic next date calculation
- UI components for reminder list and form

## Example

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
