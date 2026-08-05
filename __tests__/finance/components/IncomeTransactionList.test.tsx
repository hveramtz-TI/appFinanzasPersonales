import React from 'react';
import { IncomeTransactionList } from '../../../src/modules/finance/components/IncomeTransactionList';
import { renderWithTheme } from '../../helpers/renderWithTheme';
import { Transaction } from '../../../src/domain/entities/Transaction';

function createTransaction(overrides: Partial<Transaction> = {}): Transaction {
  return {
    id: '00000000-0000-0000-0000-000000000001',
    amount: 1000,
    type: 'income',
    categoryId: '00000000-0000-0000-0000-000000000002',
    date: new Date('2024-03-15'),
    tags: [],
    createdAt: new Date('2024-03-15'),
    updatedAt: new Date('2024-03-15'),
    deletedAt: null,
    ...overrides,
  };
}

describe('IncomeTransactionList', () => {
  it('renders empty message when there are no transactions', async () => {
    const { getByText } = await renderWithTheme(
      <IncomeTransactionList transactions={[]} />
    );

    expect(getByText('No hay ingresos en este rango')).toBeTruthy();
  });

  it('renders transactions with amount and date', async () => {
    const transactions = [
      createTransaction({
        id: '1',
        amount: 1500,
        description: 'Sueldo',
        date: new Date('2024-04-10'),
      }),
      createTransaction({
        id: '2',
        amount: 500,
        description: 'Venta',
        date: new Date('2024-04-15'),
      }),
    ];

    const { getByText, getAllByLabelText } = await renderWithTheme(
      <IncomeTransactionList transactions={transactions} />
    );

    expect(getByText('Sueldo')).toBeTruthy();
    expect(getByText('Venta')).toBeTruthy();
    expect(getAllByLabelText('Ingreso')).toHaveLength(2);
  });
});
