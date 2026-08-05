import React from 'react';
import { TopExpensesList } from '../../../src/modules/finance/components/TopExpensesList';
import { renderWithTheme } from '../../helpers/renderWithTheme';

const expenses = [
  {
    categoryId: 'cat-1',
    categoryName: 'Comida',
    amount: 300,
    percentage: 60,
  },
  {
    categoryId: 'cat-2',
    categoryName: 'Transporte',
    amount: 200,
    percentage: 40,
  },
];

describe('TopExpensesList', () => {
  it('renders title and top expenses', async () => {
    const { getByText } = await renderWithTheme(
      <TopExpensesList expenses={expenses} />
    );

    expect(getByText('Top gastos')).toBeTruthy();
    expect(getByText('Comida')).toBeTruthy();
    expect(getByText('Transporte')).toBeTruthy();
    expect(getByText('60.0%')).toBeTruthy();
    expect(getByText('40.0%')).toBeTruthy();
  });

  it('renders empty state when no expenses', async () => {
    const { getByText } = await renderWithTheme(<TopExpensesList expenses={[]} />);
    expect(getByText('No hay gastos en este período')).toBeTruthy();
  });
});
