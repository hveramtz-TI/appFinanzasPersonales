import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme, StatusBar } from 'react-native';
import { useThemeStore } from './store';
import { lightPalette, darkPalette } from './palettes';
import { ThemePalette, ResolvedTheme, ThemeMode } from './types';

interface ThemeContextValue {
  theme: ThemePalette;
  resolvedTheme: ResolvedTheme;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const { mode, setMode } = useThemeStore();

  const resolvedTheme: ResolvedTheme = useMemo(() => {
    if (mode === 'system') {
      return systemColorScheme === 'dark' ? 'dark' : 'light';
    }
    return mode;
  }, [mode, systemColorScheme]);

  const theme = resolvedTheme === 'dark' ? darkPalette : lightPalette;

  const contextValue = useMemo(
    () => ({
      theme,
      resolvedTheme,
      mode,
      setMode,
    }),
    [theme, resolvedTheme, mode, setMode]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      <StatusBar
        barStyle={resolvedTheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={theme.background}
      />
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
