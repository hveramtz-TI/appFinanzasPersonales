import { Investment } from '../entities/Investment';
import { CreateTransaction } from '../entities/Transaction';
import { IInvestmentRepository } from '../repositories/IInvestmentRepository';
import { ITransactionRepository } from '../repositories/ITransactionRepository';
import { EntityNotFoundError, InactiveEntityError } from '../errors';

export class WithdrawInvestmentUseCase {
  constructor(
    private investmentRepository: IInvestmentRepository,
    private transactionRepository: ITransactionRepository,
  ) {}

  async execute(id: string, amount: number, isFull: boolean): Promise<Investment> {
    const investment = await this.investmentRepository.getById(id);

    if (!investment) {
      throw new EntityNotFoundError('Investment', id);
    }

    if (!investment.isActive) {
      throw new InactiveEntityError('investment');
    }

    if (amount <= 0) {
      throw new Error('El monto a retirar debe ser mayor a 0');
    }

    if (amount > investment.currentValue) {
      throw new Error('El monto a retirar no puede ser mayor al valor actual');
    }

    const transaction: CreateTransaction = {
      amount,
      type: 'income',
      categoryId: investment.categoryId ?? 'default',
      date: new Date(),
      description: `Retiro: ${investment.name}`,
      tags: [],
    };

    await this.transactionRepository.create(transaction);

    if (isFull) {
      return this.investmentRepository.update(id, { isActive: false, currentValue: 0 });
    }

    return this.investmentRepository.update(id, {
      currentValue: investment.currentValue - amount,
    });
  }
}
