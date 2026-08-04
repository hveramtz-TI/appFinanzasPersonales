import { TransactionSchema, TransactionType } from '@domain/entities/Transaction';

describe('Transaction Entity', () => {
  it('should create a valid transaction', () => {
    const transaction = TransactionSchema.parse({
      id: '123e4567-e89b-12d3-a456-426614174000',
      amount: 100,
      type: 'expense',
      categoryId: '123e4567-e89b-12d3-a456-426614174001',
      date: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    });

    expect(transaction.amount).toBe(100);
    expect(transaction.type).toBe('expense');
  });

  it('should reject negative amount', () => {
    expect(() => {
      TransactionSchema.parse({
        id: '123e4567-e89b-12d3-a456-426614174000',
        amount: -100,
        type: 'expense',
        categoryId: '123e4567-e89b-12d3-a456-426614174001',
        date: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });
    }).toThrow();
  });

  it('should validate transaction type', () => {
    const validTypes: TransactionType[] = ['income', 'expense'];
    
    validTypes.forEach(type => {
      const transaction = TransactionSchema.parse({
        id: '123e4567-e89b-12d3-a456-426614174000',
        amount: 100,
        type,
        categoryId: '123e4567-e89b-12d3-a456-426614174001',
        date: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });
      expect(transaction.type).toBe(type);
    });
  });
});
