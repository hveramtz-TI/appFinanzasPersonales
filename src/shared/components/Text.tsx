import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';
import { useTheme } from '../theme';

interface TextProps extends RNTextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption';
  color?: 'primary' | 'secondary' | 'disabled' | 'error';
}

export function Text({
  variant = 'body',
  color = 'primary',
  style,
  children,
  ...props
}: TextProps) {
  const { theme } = useTheme();

  const getColorStyle = () => {
    switch (color) {
      case 'primary':
        return { color: theme.text };
      case 'secondary':
        return { color: theme.textSecondary };
      case 'disabled':
        return { color: theme.textDisabled };
      case 'error':
        return { color: theme.error };
      default:
        return { color: theme.text };
    }
  };

  const getVariantStyle = () => {
    switch (variant) {
      case 'h1':
        return styles.h1;
      case 'h2':
        return styles.h2;
      case 'h3':
        return styles.h3;
      case 'body':
        return styles.body;
      case 'caption':
        return styles.caption;
      default:
        return styles.body;
    }
  };

  return (
    <RNText style={[getVariantStyle(), getColorStyle(), style]} {...props}>
      {children}
    </RNText>
  );
}

const styles = StyleSheet.create({
  h1: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 40,
  },
  h2: {
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 32,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  },
});
