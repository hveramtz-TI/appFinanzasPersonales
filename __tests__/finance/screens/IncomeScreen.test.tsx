import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { fireEvent } from '@testing-library/react-native';
import { IncomeScreen } from '../../../src/modules/finance/screens/IncomeScreen';
import { renderWithTheme } from '../../helpers/renderWithTheme';

jest.mock('../../../src/modules/finance/hooks/useIncomeScreen', () => ({
  useIncomeScreen: jest.fn(),
}));

jest.mock('../../../src/modules/finance/hooks/useIncomeEvolution', () => ({
  useIncomeEvolution: jest.fn(),
}));

const { useIncomeScreen } = jest.requireMock(
  '../../../src/modules/finance/hooks/useIncomeScreen'
);
const { useIncomeEvolution } = jest.requireMock(
  '../../../src/modules/finance/hooks/useIncomeEvolution'
);

const defaultState = {
  transactionRepo: {},
  isInitializing: false,
  initError: null,
};

const defaultEvolution = {
  incomes: [
    {
      id: '1',
      amount: 2000,
      type: 'income',
      categoryId: '00000000-0000-0000-0000-000000000002',
      date: new Date('2024-03-15'),
      description: 'Sueldo',
      createdAt: new Date('2024-03-15'),
      updatedAt: new Date('2024-03-15'),
      deletedAt: null,
    },
  ],
  monthlyData: [
    {
      month: 2,
      year: 2024,
      income: 2000,
      expense: 0,
      balance: 2000,
    },
  ],
  totals: { income: 2000, expense: 0, balance: 2000 },
  isLoading: false,
  error: null,
  refetch: jest.fn(),
};

function renderWithNavigation(component: React.ReactElement) {
  return renderWithTheme(<NavigationContainer>{component}</NavigationContainer>);
}

describe('IncomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useIncomeScreen.mockReturnValue(defaultState);
    useIncomeEvolution.mockReturnValue(defaultEvolution);
  });

  it('renders loading state', async () => {
    useIncomeEvolution.mockReturnValue({ ...defaultEvolution, isLoading: true });

    const { getAllByTestId } = await renderWithNavigation(<IncomeScreen />);
    expect(getAllByTestId('activity-indicator').length).toBeGreaterThan(0);
  });

  it('renders error state', async () => {
    useIncomeEvolution.mockReturnValue({
      ...defaultEvolution,
      error: new Error('Load failed'),
    });

    const { getByText } = await renderWithNavigation(<IncomeScreen />);
    expect(getByText('Load failed')).toBeTruthy();
  });

  it('renders income screen with summary and list', async () => {
    const { getByText, getAllByLabelText } = await renderWithNavigation(
      <IncomeScreen />
    );

    expect(getByText('Evolución de ingresos')).toBeTruthy();
    expect(getByText('Total')).toBeTruthy();
    expect(getByText('Transacciones')).toBeTruthy();
    expect(getByText('Promedio')).toBeTruthy();
    expect(getByText('Sueldo')).toBeTruthy();
    expect(getAllByLabelText('Ingreso')).toHaveLength(1);
  });

  it('renders date range selector', async () => {
    const { getByLabelText } = await renderWithNavigation(<IncomeScreen />);

    expect(getByLabelText('Seleccionar rango de fechas')).toBeTruthy();
  });
});
