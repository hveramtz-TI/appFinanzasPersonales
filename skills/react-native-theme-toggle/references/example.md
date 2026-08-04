# Example

```typescript
// shared/theme/types.ts
export type ThemeMode = 'system' | 'light' | 'dark';
export type ResolvedTheme = 'light' | 'dark';

export interface ThemePalette {
  background: string;
  surface: string;
  card: string;
  text: string;
  textSecondary: string;
  primary: string;
  border: string;
  // ... more tokens
}

// shared/theme/ThemeProvider.tsx
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

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, mode, setMode }}>
      <StatusBar
        barStyle={resolvedTheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={theme.background}
      />
      {children}
    </ThemeContext.Provider>
  );
}
```
