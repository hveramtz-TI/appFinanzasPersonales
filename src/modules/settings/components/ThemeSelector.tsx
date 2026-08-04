import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme, useThemeMode, ThemeMode } from '../../../shared/theme';
import { Text, Card, Button } from '../../../shared/components';

export function ThemeSelector() {
  const { theme } = useTheme();
  const { mode, setMode } = useThemeMode();

  const modes: { value: ThemeMode; label: string; icon: string }[] = [
    { value: 'system', label: 'Sistema', icon: '📱' },
    { value: 'light', label: 'Claro', icon: '☀️' },
    { value: 'dark', label: 'Oscuro', icon: '🌙' },
  ];

  return (
    <Card>
      <Text variant="h3" style={styles.title}>
        Tema
      </Text>
      <View style={styles.buttons} accessibilityLabel="Selector de tema">
        {modes.map(m => (
          <Button
            key={m.value}
            title={`${m.icon} ${m.label}`}
            onPress={() => setMode(m.value)}
            variant={mode === m.value ? 'primary' : 'outline'}
            style={styles.button}
            accessibilityLabel={`Cambiar a tema ${m.label.toLowerCase()}`}
            accessibilityHint={mode === m.value ? 'Tema actualmente seleccionado' : 'Selecciona este tema'}
          />
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  title: {
    marginBottom: 16,
  },
  buttons: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
  },
});
