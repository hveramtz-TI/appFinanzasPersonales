---
name: react-native-theme-toggle
description: "Trigger: dark mode, theme toggle, light dark system, tema claro oscuro, three-state theme. Implement three-state theme toggle (system/light/dark) with Zustand persistence, StatusBar integration, and complete color palette."
license: Apache-2.0
metadata:
  author: "gentle-ai"
  version: "1.0"
---

# React Native Theme Toggle

## Activation Contract

Implement theme system when:
- Need dark/light mode support
- Want three-state toggle (system/light/dark)
- Require persistent theme preference
- Need StatusBar integration

## Hard Rules

- Use Zustand with AsyncStorage for persistence
- Implement three states: system, light, dark
- Use useColorScheme() for system preference
- Update StatusBar dynamically
- Create complete color palette for both themes
- Use ThemeProvider context for distribution
- Memoize theme resolution to avoid re-renders

## Decision Gates

| Need | Approach |
|------|----------|
| Simple toggle | Two-state (light/dark) with AsyncStorage |
| System-aware | Three-state with useColorScheme |
| Multiple themes | Theme registry with dynamic loading |
| Component-level override | ThemeProvider nesting |

## Execution Steps

1. Define ThemePalette interface with all color tokens
2. Create light and dark palette objects
3. Create Zustand store with persist middleware
4. Create ThemeProvider with useColorScheme integration
5. Create useTheme hook for component access
6. Create useThemeMode hook for theme switching
7. Integrate StatusBar with theme resolution

## Output Contract

- Complete theme palette (background, text, primary, etc.)
- Zustand store with AsyncStorage persistence
- ThemeProvider with system/light/dark support
- useTheme and useThemeMode hooks
- StatusBar integration

## Example

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
