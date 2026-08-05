import React from 'react';
import { render } from '@testing-library/react-native';
import { ThemedLineChart } from '../../../src/modules/finance/components/ThemedLineChart';
import { renderWithTheme } from '../../helpers/renderWithTheme';

describe('ThemedLineChart', () => {
  it('renders title and empty label when no data', async () => {
    const { getByText } = await renderWithTheme(
      <ThemedLineChart title="Evolución" data={[]} color="#2196F3" />
    );

    expect(getByText('Evolución')).toBeTruthy();
    expect(getByText('No hay datos para mostrar')).toBeTruthy();
  });

  it('renders title and chart when data is provided', async () => {
    const { getByText } = await renderWithTheme(
      <ThemedLineChart
        title="Evolución"
        data={[{ value: 100, label: 'Ene' }]}
        color="#2196F3"
      />
    );

    expect(getByText('Evolución')).toBeTruthy();
  });
});
