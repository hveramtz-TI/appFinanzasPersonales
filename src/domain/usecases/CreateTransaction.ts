import { Transaction, CreateTransaction } from '../entities/Transaction';
import { ITransactionRepository } from '../repositories/ITransactionRepository';
import { InvalidAmountError, AmountExceededError } from '../errors';
import { MAX_TRANSACTION_AMOUNT } from '../../shared/constants/business';

export class CreateTransactionUseCase {
  constructor(private transactionRepository: ITransactionRepository) {}

  async execute(data: CreateTransaction): Promise<Transaction> {
    if (data.amount <= 0) {
      throw new InvalidAmountError();
    }

    if (data.amount > MAX_TRANSACTION_AMOUNT) {
      throw new AmountExceededError(MAX_TRANSACTION_AMOUNT);
    }

    const sanitizedData = {
      ...data,
      description: data.description?.trim().slice(0, 500),
      tags: data.tags || [],
    };

    return this.transactionRepository.create(sanitizedData);
  }
}
