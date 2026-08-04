import { useTheme } from './ThemeProvider';
import { ThemeMode } from './types';

export function useThemeMode() {
  const { mode, setMode, resolvedTheme } = useTheme();

  return {
    mode,
    setMode,
    resolvedTheme,
    isDark: resolvedTheme === 'dark',
    toggleMode: () => {
      const modes: ThemeMode[] = ['system', 'light', 'dark'];
      const currentIndex = modes.indexOf(mode);
      const nextMode = modes[(currentIndex + 1) % modes.length];
      setMode(nextMode);
    },
  };
}
