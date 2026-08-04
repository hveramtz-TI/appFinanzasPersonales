import { Reminder, CreateReminder } from '../entities/Reminder';
import { IReminderRepository } from '../repositories/IReminderRepository';
import { InvalidAmountError, EmptyFieldError, InvalidDateError } from '../errors';

export class CreateReminderUseCase {
  constructor(private reminderRepository: IReminderRepository) {}

  async execute(data: CreateReminder): Promise<Reminder> {
    if (data.amount <= 0) {
      throw new InvalidAmountError();
    }

    if (data.title.trim().length === 0) {
      throw new EmptyFieldError('Reminder title');
    }

    const now = new Date();
    if (data.nextDate < now) {
      throw new InvalidDateError();
    }

    const sanitizedData = {
      ...data,
      title: data.title.trim().slice(0, 100),
      payee: data.payee?.trim().slice(0, 100),
      notes: data.notes?.trim(),
    };

    return this.reminderRepository.create(sanitizedData);
  }
}
