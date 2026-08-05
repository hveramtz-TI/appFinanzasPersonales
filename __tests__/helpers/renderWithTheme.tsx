import React from 'react';
import { render } from '@testing-library/react-native';
import { ThemePalette, ResolvedTheme, ThemeMode } from '../../src/shared/theme/types';
import { lightPalette } from '../../src/shared/theme/palettes';
import { ThemeContext } from '../../src/shared/theme/ThemeProvider';

interface ThemeContextValue {
  theme: ThemePalette;
  resolvedTheme: ResolvedTheme;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

const TEST_THEME: ThemeContextValue = {
  theme: lightPalette,
  resolvedTheme: 'light',
  mode: 'light',
  setMode: jest.fn(),
};

export function renderWithTheme(
  ui: React.ReactElement
): ReturnType<typeof render> {
  return render(
    <ThemeContext.Provider value={TEST_THEME}>{ui}</ThemeContext.Provider>
  );
}

export { TEST_THEME };
