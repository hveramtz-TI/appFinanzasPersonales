import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { FinanceScreen } from '../../../src/modules/finance/screens/FinanceScreen';
import { renderWithTheme } from '../../helpers/renderWithTheme';

jest.mock('../../../src/modules/finance/hooks/useFinanceScreen', () => ({
  useFinanceScreen: jest.fn(),
}));

const { useFinanceScreen } = jest.requireMock(
  '../../../src/modules/finance/hooks/useFinanceScreen'
);

const readyIndicators = {
  current: { income: 1000, expense: 500, balance: 500 },
  previous: { income: 800, expense: 400, balance: 400 },
  variance: {
    income: 25,
    expense: 25,
    balance: 25,
    hasPreviousData: true,
  },
  topExpenses: [
    {
      categoryId: 'cat-1',
      categoryName: 'Comida',
      amount: 300,
      percentage: 60,
    },
  ],
  monthlyEvolution: [],
  isLoading: false,
  error: null,
  isInitializing: false,
  initError: null,
};

function renderWithNavigation(component: React.ReactElement) {
  return renderWithTheme(<NavigationContainer>{component}</NavigationContainer>);
}

describe('FinanceScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading indicator', async () => {
    useFinanceScreen.mockReturnValue({
      ...readyIndicators,
      isLoading: true,
      isInitializing: false,
    });

    const { getByTestId } = await renderWithNavigation(<FinanceScreen />);
    expect(getByTestId('activity-indicator')).toBeTruthy();
  });

  it('renders error state', async () => {
    useFinanceScreen.mockReturnValue({
      ...readyIndicators,
      isLoading: false,
      error: new Error('Load failed'),
    });

    const { getByText } = await renderWithNavigation(<FinanceScreen />);
    expect(getByText('Load failed')).toBeTruthy();
  });

  it('renders summary cards and top expenses when ready', async () => {
    useFinanceScreen.mockReturnValue(readyIndicators);

    const { getByText } = await renderWithNavigation(<FinanceScreen />);
    expect(getByText('Finanzas')).toBeTruthy();
    expect(getByText('Balance')).toBeTruthy();
    expect(getByText('Top gastos')).toBeTruthy();
    expect(getByText('Ver evolución de ingresos')).toBeTruthy();
  });
});
