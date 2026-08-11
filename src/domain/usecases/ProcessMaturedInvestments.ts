import { Investment } from '../entities/Investment';
import { CreateTransaction } from '../entities/Transaction';
import { CreateReminder } from '../entities/Reminder';
import { IInvestmentRepository } from '../repositories/IInvestmentRepository';
import { ITransactionRepository } from '../repositories/ITransactionRepository';
import { IReminderRepository } from '../repositories/IReminderRepository';

export interface ProcessedInvestment {
  investmentId: string;
  investmentName: string;
  type: 'fixed' | 'renewable';
  action: string;
}

export class ProcessMaturedInvestmentsUseCase {
  constructor(
    private investmentRepository: IInvestmentRepository,
    private transactionRepository: ITransactionRepository,
    private reminderRepository: IReminderRepository,
  ) {}

  async execute(): Promise<ProcessedInvestment[]> {
    const matured = await this.investmentRepository.getMatured();
    const results: ProcessedInvestment[] = [];

    for (const investment of matured) {
      if (investment.type !== 'DP' || !investment.isActive) continue;

      if (investment.renewalType === 'fixed') {
        const transaction: CreateTransaction = {
          amount: investment.currentValue,
          type: 'income',
          categoryId: investment.categoryId ?? 'default',
          date: new Date(),
          description: `Vencimiento: ${investment.name}`,
          tags: [],
        };

        await this.transactionRepository.create(transaction);
        await this.investmentRepository.update(investment.id, { isActive: false });

        results.push({
          investmentId: investment.id,
          investmentName: investment.name,
          type: 'fixed',
          action: 'created_transaction',
        });
      } else if (investment.renewalType === 'renewable') {
        const reminder: CreateReminder = {
          title: `Decidir renovación: ${investment.name}`,
          amount: investment.currentValue,
          frequency: 'once',
          nextDate: new Date(),
          categoryId: investment.categoryId ?? 'default',
          notificationEnabled: true,
          notificationTime: '09:00',
          isActive: true,
        };

        await this.reminderRepository.create(reminder);
        await this.investmentRepository.update(investment.id, { isActive: false });

        results.push({
          investmentId: investment.id,
          investmentName: investment.name,
          type: 'renewable',
          action: 'created_reminder',
        });
      }
    }

    return results;
  }
}
