import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { fireEvent, waitFor, render } from '@testing-library/react-native';
import { InvestmentFormScreen } from '../../../src/modules/investments/screens/InvestmentFormScreen';
import { renderWithTheme } from '../../helpers/renderWithTheme';

jest.mock('../../../src/modules/investments/hooks/useInvestments', () => ({
  useInvestments: jest.fn(),
}));

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigation: () => ({
      goBack: jest.fn(),
    }),
    useRoute: () => ({
      params: {},
    }),
  };
});

const { useInvestments } = jest.requireMock(
  '../../../src/modules/investments/hooks/useInvestments'
);

const defaultState = {
  investments: [],
  loading: false,
  error: null,
  addInvestment: jest.fn().mockResolvedValue({ id: 'inv-new' }),
  deleteInvestment: jest.fn(),
  refresh: jest.fn(),
};

async function renderWithNavigation(component: React.ReactElement): Promise<Awaited<ReturnType<typeof render>>> {
  return renderWithTheme(<NavigationContainer>{component}</NavigationContainer>);
}

async function fillInput(screen: Awaited<ReturnType<typeof render>>, placeholder: string, value: string) {
  const input = screen.getByPlaceholderText(placeholder);
  await fireEvent.changeText(input, value);
  return input;
}

describe('InvestmentFormScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useInvestments.mockReturnValue(defaultState);
  });

  it('renders DP form fields when DP type is selected', async () => {
    const screen = await renderWithNavigation(<InvestmentFormScreen />);

    expect(screen.getByPlaceholderText('Fecha de vencimiento (AAAA-MM-DD)')).toBeTruthy();
    expect(screen.getByPlaceholderText('Tasa de interés anual (%)')).toBeTruthy();
    expect(screen.getByText('Fijo')).toBeTruthy();
    expect(screen.getByText('Renovable')).toBeTruthy();

    expect(screen.queryByPlaceholderText('Cantidad de cuotas')).toBeNull();
  });

  it('renders FM form fields when FM type is selected', async () => {
    const screen = await renderWithNavigation(<InvestmentFormScreen />);

    await fireEvent.press(screen.getByText('Fondo Mutuo'));

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Cantidad de cuotas')).toBeTruthy();
    });

    expect(screen.queryByPlaceholderText('Fecha de vencimiento (AAAA-MM-DD)')).toBeNull();
    expect(screen.queryByPlaceholderText('Tasa de interés anual (%)')).toBeNull();
  });

  it('clears DP-specific fields when switching from DP to FM', async () => {
    const screen = await renderWithNavigation(<InvestmentFormScreen />);

    await fillInput(screen, 'Fecha de vencimiento (AAAA-MM-DD)', '2025-12-31');
    await fillInput(screen, 'Tasa de interés anual (%)', '5.5');

    await fireEvent.press(screen.getByText('Fondo Mutuo'));

    await waitFor(() => {
      expect(screen.queryByPlaceholderText('Fecha de vencimiento (AAAA-MM-DD)')).toBeNull();
      expect(screen.queryByPlaceholderText('Tasa de interés anual (%)')).toBeNull();
    });

    await fireEvent.press(screen.getByText('Plazo Fijo'));

    await waitFor(() => {
      const maturityInput = screen.getByPlaceholderText('Fecha de vencimiento (AAAA-MM-DD)');
      expect(maturityInput.props.value).toBe('');
      const interestInput = screen.getByPlaceholderText('Tasa de interés anual (%)');
      expect(interestInput.props.value).toBe('');
    });
  });

  it('calls addInvestment when form is submitted', async () => {
    const screen = await renderWithNavigation(<InvestmentFormScreen />);

    await fillInput(screen, 'Nombre de la inversión', 'Fondo de emergencia');
    await fillInput(screen, 'Monto inicial', '100000');
    await fillInput(screen, 'Valor actual', '105000');
    await fillInput(screen, 'Fecha de compra (AAAA-MM-DD)', '2024-01-15');

    await fireEvent.press(screen.getByText('Fondo Mutuo'));
    await fillInput(screen, 'Cantidad de cuotas', '12');

    await fireEvent.press(screen.getByText('Guardar'));

    await waitFor(() => {
      expect(defaultState.addInvestment).toHaveBeenCalledTimes(1);
    });

    const submitted = defaultState.addInvestment.mock.calls[0][0];
    expect(submitted.name).toBe('Fondo de emergencia');
    expect(submitted.type).toBe('FM');
    expect(submitted.initialAmount).toBe(100000);
    expect(submitted.currentValue).toBe(105000);
    expect(submitted.installmentCount).toBe(12);
    expect(submitted.purchaseDate).toBeInstanceOf(Date);
  });
});
