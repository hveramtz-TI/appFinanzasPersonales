import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { IncomeEvolutionCard } from '../../../src/modules/finance/components/IncomeEvolutionCard';
import { renderWithTheme } from '../../helpers/renderWithTheme';

describe('IncomeEvolutionCard', () => {
  it('renders title and description', async () => {
    const { getByText } = await renderWithTheme(
      <IncomeEvolutionCard onPress={jest.fn()} />
    );

    expect(getByText('Ver evolución de ingresos')).toBeTruthy();
    expect(getByText('Analiza tus ingresos a lo largo del tiempo')).toBeTruthy();
  });

  it('calls onPress when tapped', async () => {
    const onPress = jest.fn();
    const { getByText } = await renderWithTheme(
      <IncomeEvolutionCard onPress={onPress} />
    );

    fireEvent.press(getByText('Ver evolución de ingresos'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
