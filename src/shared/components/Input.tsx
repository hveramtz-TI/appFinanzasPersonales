import React from 'react';
import { TextInput, TextInputProps, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../theme';

interface InputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
  autoCapitalize?: TextInputProps['autoCapitalize'];
  autoComplete?: TextInputProps['autoComplete'];
  multiline?: boolean;
  numberOfLines?: number;
  style?: ViewStyle;
  textStyle?: TextStyle;
  editable?: boolean;
}

export function Input({
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize,
  autoComplete,
  multiline = false,
  numberOfLines = 1,
  style,
  textStyle,
  editable = true,
}: InputProps) {
  const { theme } = useTheme();

  return (
    <TextInput
      style={[
        styles.input,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
          color: theme.text,
        },
        multiline && styles.multiline,
        style,
      ]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={theme.textDisabled}
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      autoCapitalize={autoCapitalize}
      autoComplete={autoComplete}
      multiline={multiline}
      numberOfLines={numberOfLines}
      textAlignVertical={multiline ? 'top' : 'center'}
      editable={editable}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 48,
  },
  multiline: {
    minHeight: 100,
    paddingTop: 12,
  },
});
