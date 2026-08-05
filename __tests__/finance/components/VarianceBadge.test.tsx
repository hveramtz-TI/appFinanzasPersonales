import React from 'react';
import { VarianceBadge } from '../../../src/modules/finance/components/VarianceBadge';
import { renderWithTheme } from '../../helpers/renderWithTheme';

describe('VarianceBadge', () => {
  it('renders positive variance with success color', async () => {
    const { getByText } = await renderWithTheme(<VarianceBadge value={12.5} />);
    expect(getByText('12.5%')).toBeTruthy();
  });

  it('renders negative variance with error color', async () => {
    const { getByText } = await renderWithTheme(<VarianceBadge value={-5.3} />);
    expect(getByText('5.3%')).toBeTruthy();
  });

  it('renders inverted colors for expenses', async () => {
    const { getByText } = await renderWithTheme(
      <VarianceBadge value={12.5} invertColors />
    );
    expect(getByText('12.5%')).toBeTruthy();
  });

  it('renders "Sin comparación" when hasPreviousData is false', async () => {
    const { getByText } = await renderWithTheme(
      <VarianceBadge value={0} hasPreviousData={false} />
    );
    expect(getByText('Sin comparación')).toBeTruthy();
  });
});
