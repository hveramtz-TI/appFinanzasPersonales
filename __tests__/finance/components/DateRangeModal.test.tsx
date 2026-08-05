import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { DateRangeModal } from '../../../src/modules/finance/components/DateRangeModal';
import { renderWithTheme } from '../../helpers/renderWithTheme';

describe('DateRangeModal', () => {
  const initialRange = {
    startDate: new Date('2024-03-01'),
    endDate: new Date('2024-03-31'),
  };

  it('renders modal and default range display', async () => {
    const onClose = jest.fn();
    const onConfirm = jest.fn();

    const { getByText, getByTestId } = await renderWithTheme(
      <DateRangeModal
        visible
        onClose={onClose}
        onConfirm={onConfirm}
        initialRange={initialRange}
      />
    );

    expect(getByTestId('date-range-modal')).toBeTruthy();
    expect(getByText('Seleccionar rango')).toBeTruthy();
    expect(getByText('29-02-2024 → 30-03-2024')).toBeTruthy();
  });

  it('calls onConfirm with the initial range when confirm is pressed', async () => {
    const onClose = jest.fn();
    const onConfirm = jest.fn();

    const { getByText } = await renderWithTheme(
      <DateRangeModal
        visible
        onClose={onClose}
        onConfirm={onConfirm}
        initialRange={initialRange}
      />
    );

    fireEvent.press(getByText('Confirmar'));

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onConfirm).toHaveBeenCalledWith(
      expect.objectContaining({
        startDate: expect.any(Date),
        endDate: expect.any(Date),
      })
    );
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when cancel is pressed', async () => {
    const onClose = jest.fn();
    const onConfirm = jest.fn();

    const { getByText, getAllByText } = await renderWithTheme(
      <DateRangeModal
        visible
        onClose={onClose}
        onConfirm={onConfirm}
        initialRange={initialRange}
      />
    );

    const cancelButtons = getAllByText('Cancelar');
    fireEvent.press(cancelButtons[cancelButtons.length - 1]);

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('uses current month as default range when no initial range is provided', async () => {
    const onClose = jest.fn();
    const onConfirm = jest.fn();
    const today = new Date();
    const expectedStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const { getByText } = await renderWithTheme(
      <DateRangeModal visible onClose={onClose} onConfirm={onConfirm} />
    );

    const startText = expectedStart
      .toLocaleDateString('es-CL', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
      .replace(/\//g, '-');

    expect(getByText(new RegExp(startText))).toBeTruthy();
  });
});
