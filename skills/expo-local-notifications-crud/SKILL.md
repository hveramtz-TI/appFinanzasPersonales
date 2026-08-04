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

## References

- `references/example.md` — complete code example.
