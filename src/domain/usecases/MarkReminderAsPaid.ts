import { Reminder } from '../entities/Reminder';
import { CreateTransaction } from '../entities/Transaction';
import { IReminderRepository } from '../repositories/IReminderRepository';
import { ITransactionRepository } from '../repositories/ITransactionRepository';
import { EntityNotFoundError, InactiveEntityError, DuplicateReminderPaymentError } from '../errors';

interface PeriodResult {
  periodStart: Date;
  periodEnd: Date;
  periodLabel: string;
}

export class MarkReminderAsPaidUseCase {
  constructor(
    private reminderRepository: IReminderRepository,
    private transactionRepository: ITransactionRepository,
  ) {}

  async execute(id: string): Promise<Reminder> {
    const reminder = await this.reminderRepository.getById(id);

    if (!reminder) {
      throw new EntityNotFoundError('Reminder', id);
    }

    if (!reminder.isActive) {
      throw new InactiveEntityError('reminder');
    }

    const { periodStart, periodEnd, periodLabel } = this.getPeriod(reminder.nextDate, reminder.frequency);

    const existing = await this.transactionRepository.getByReminderIdAndPeriod(id, periodStart, periodEnd);
    if (existing.length > 0) {
      throw new DuplicateReminderPaymentError(id, periodLabel);
    }

    const transaction: CreateTransaction = {
      amount: reminder.amount,
      type: 'expense',
      categoryId: reminder.categoryId ?? 'default',
      date: reminder.nextDate,
      reminderId: id,
      description: reminder.title,
      tags: [],
    };

    await this.transactionRepository.create(transaction);

    return this.reminderRepository.markAsPaid(id);
  }

  private getPeriod(date: Date, frequency: string): PeriodResult {
    const start = new Date(date);
    const end = new Date(date);

    switch (frequency) {
      case 'daily':
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        return { periodStart: start, periodEnd: end, periodLabel: date.toISOString().split('T')[0] };
      case 'weekly': {
        const day = start.getDay();
        start.setDate(start.getDate() - day);
        start.setHours(0, 0, 0, 0);
        end.setDate(end.getDate() + (6 - day));
        end.setHours(23, 59, 59, 999);
        return { periodStart: start, periodEnd: end, periodLabel: `week of ${start.toISOString().split('T')[0]}` };
      }
      case 'monthly':
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        end.setMonth(end.getMonth() + 1);
        end.setDate(0);
        end.setHours(23, 59, 59, 999);
        return { periodStart: start, periodEnd: end, periodLabel: `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}` };
      case 'yearly':
        start.setMonth(0, 1);
        start.setHours(0, 0, 0, 0);
        end.setMonth(11, 31);
        end.setHours(23, 59, 59, 999);
        return { periodStart: start, periodEnd: end, periodLabel: String(start.getFullYear()) };
      case 'once':
      default:
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        return { periodStart: start, periodEnd: end, periodLabel: date.toISOString().split('T')[0] };
    }
  }
}
