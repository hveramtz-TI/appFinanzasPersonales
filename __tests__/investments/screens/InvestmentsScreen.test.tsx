import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { fireEvent } from '@testing-library/react-native';
import { InvestmentsScreen } from '../../../src/modules/investments/screens/InvestmentsScreen';
import { renderWithTheme } from '../../helpers/renderWithTheme';

jest.mock('../../../src/modules/investments/hooks/useInvestments', () => ({
  useInvestments: jest.fn(),
}));

const { useInvestments } = jest.requireMock(
  '../../../src/modules/investments/hooks/useInvestments'
);

const createInvestment = (overrides = {}) => ({
  id: 'inv-1',
  name: 'Fondo de emergencia',
  type: 'FM' as const,
  initialAmount: 100000,
  currentValue: 105000,
  purchaseDate: new Date('2024-01-15'),
  installmentCount: 12,
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-01-15'),
  isActive: true,
  deletedAt: null,
  ...overrides,
});

const defaultState = {
  investments: [createInvestment()],
  loading: false,
  error: null,
  addInvestment: jest.fn(),
  deleteInvestment: jest.fn(),
  refresh: jest.fn(),
};

function renderWithNavigation(component: React.ReactElement) {
  return renderWithTheme(<NavigationContainer>{component}</NavigationContainer>);
}

describe('InvestmentsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useInvestments.mockReturnValue(defaultState);
  });

  it('renders header title', async () => {
    const { getByText } = await renderWithNavigation(<InvestmentsScreen />);
    expect(getByText('Inversiones')).toBeTruthy();
  });

  it('renders investment list with name and current value', async () => {
    const { getByText } = await renderWithNavigation(<InvestmentsScreen />);
    expect(getByText('Fondo de emergencia')).toBeTruthy();
    expect(getByText('$105.000')).toBeTruthy();
    expect(getByText('Invertido: $100.000')).toBeTruthy();
  });

  it('renders type badge and return percentage', async () => {
    const { getAllByText, getByText } = await renderWithNavigation(<InvestmentsScreen />);
    expect(getAllByText('Fondo Mutuo').length).toBeGreaterThanOrEqual(1);
    expect(getByText('Rentabilidad: +5.0%')).toBeTruthy();
  });

  it('renders empty state when there are no investments', async () => {
    useInvestments.mockReturnValue({ ...defaultState, investments: [] });
    const { getByText } = await renderWithNavigation(<InvestmentsScreen />);
    expect(getByText('No hay inversiones aún')).toBeTruthy();
  });

  it('renders loading state', async () => {
    useInvestments.mockReturnValue({ ...defaultState, loading: true });
    const { getByText } = await renderWithNavigation(<InvestmentsScreen />);
    expect(getByText('Cargando inversiones...')).toBeTruthy();
  });

  it('calls deleteInvestment when delete is pressed', async () => {
    const { getByText } = await renderWithNavigation(<InvestmentsScreen />);
    fireEvent.press(getByText('Eliminar'));
    expect(defaultState.deleteInvestment).toHaveBeenCalledWith('inv-1');
  });
});
