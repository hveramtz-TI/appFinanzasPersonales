import React from 'react';
import { MonthlyTrendChart } from '../../../src/modules/finance/components/MonthlyTrendChart';
import { renderWithTheme } from '../../helpers/renderWithTheme';

describe('MonthlyTrendChart', () => {
  it('renders title and chart', async () => {
    const { getByText } = await renderWithTheme(
      <MonthlyTrendChart
        current={{ income: 1000, expense: 500, balance: 500 }}
        previous={{ income: 800, expense: 400, balance: 400 }}
      />
    );

    expect(getByText('Comparación mensual')).toBeTruthy();
  });
});
