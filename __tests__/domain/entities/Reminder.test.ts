import { ReminderSchema } from '@domain/entities/Reminder';

describe('Reminder Entity', () => {
  it('should create a valid reminder', () => {
    const reminder = ReminderSchema.parse({
      id: '123e4567-e89b-12d3-a456-426614174000',
      title: 'Pago de crédito',
      amount: 50000,
      frequency: 'monthly',
      nextDate: new Date(),
      notificationEnabled: true,
      notificationTime: '09:00',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    expect(reminder.title).toBe('Pago de crédito');
    expect(reminder.frequency).toBe('monthly');
  });

  it('should reject invalid notification time format', () => {
    expect(() => {
      ReminderSchema.parse({
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Pago de crédito',
        amount: 50000,
        frequency: 'monthly',
        nextDate: new Date(),
        notificationEnabled: true,
        notificationTime: '9:00', // Should be 09:00
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }).toThrow();
  });
});
