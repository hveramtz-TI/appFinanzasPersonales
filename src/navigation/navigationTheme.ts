import { Theme } from '@react-navigation/native';
import { ThemePalette } from '../shared/theme';

export function createNavigationTheme(theme: ThemePalette): Theme {
  return {
    dark: theme.background === '#121212',
    colors: {
      primary: theme.primary,
      background: theme.background,
      card: theme.card,
      text: theme.text,
      border: theme.border,
      notification: theme.error,
    },
    fonts: {
      regular: { fontFamily: 'System', fontWeight: '400' },
      medium: { fontFamily: 'System', fontWeight: '500' },
      bold: { fontFamily: 'System', fontWeight: '700' },
      heavy: { fontFamily: 'System', fontWeight: '900' },
    },
  };
}
