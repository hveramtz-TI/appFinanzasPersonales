import React from 'react';
import { FinanceSummaryCards } from '../../../src/modules/finance/components/FinanceSummaryCards';
import { renderWithTheme } from '../../helpers/renderWithTheme';

const current = {
  income: 1000,
  expense: 300,
  balance: 700,
};

const variance = {
  income: 25,
  expense: -10,
  balance: 15,
  hasPreviousData: true,
};

describe('FinanceSummaryCards', () => {
  it('renders balance, income and expense cards', async () => {
    const { getByText } = await renderWithTheme(
      <FinanceSummaryCards current={current} variance={variance} />
    );

    expect(getByText('Balance')).toBeTruthy();
    expect(getByText('Ingresos')).toBeTruthy();
    expect(getByText('Gastos')).toBeTruthy();
  });

  it('renders formatted amounts', async () => {
    const { getByText } = await renderWithTheme(
      <FinanceSummaryCards current={current} variance={variance} />
    );

    expect(getByText(/\$1\.000/)).toBeTruthy();
    expect(getByText(/\$300/)).toBeTruthy();
    expect(getByText(/\$700/)).toBeTruthy();
  });

  it('renders variance badges', async () => {
    const { getByText } = await renderWithTheme(
      <FinanceSummaryCards current={current} variance={variance} />
    );

    expect(getByText('25.0%')).toBeTruthy();
    expect(getByText('10.0%')).toBeTruthy();
    expect(getByText('15.0%')).toBeTruthy();
  });
});
