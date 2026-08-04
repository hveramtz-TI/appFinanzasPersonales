import { Reminder } from '../entities/Reminder';
import { IReminderRepository } from '../repositories/IReminderRepository';
import { EntityNotFoundError, InactiveEntityError } from '../errors';

export class MarkReminderAsPaidUseCase {
  constructor(private reminderRepository: IReminderRepository) {}

  async execute(id: string): Promise<Reminder> {
    const reminder = await this.reminderRepository.getById(id);
    
    if (!reminder) {
      throw new EntityNotFoundError('Reminder', id);
    }

    if (!reminder.isActive) {
      throw new InactiveEntityError('reminder');
    }

    return this.reminderRepository.markAsPaid(id);
  }
}
