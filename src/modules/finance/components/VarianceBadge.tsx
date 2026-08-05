import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../shared/theme';
import { Text } from '../../../shared/components';

interface VarianceBadgeProps {
  value: number;
  invertColors?: boolean;
  hasPreviousData?: boolean;
}

export function VarianceBadge({
  value,
  invertColors = false,
  hasPreviousData = true,
}: VarianceBadgeProps) {
  const { theme } = useTheme();

  if (!hasPreviousData) {
    return (
      <View style={styles.container}>
        <Text variant="caption" color="disabled">
          Sin comparación
        </Text>
      </View>
    );
  }

  const isPositive = value >= 0;
  const iconName = isPositive ? 'arrow-up' : 'arrow-down';
  const color = isPositive
    ? invertColors
      ? theme.error
      : theme.success
    : invertColors
      ? theme.success
      : theme.error;

  return (
    <View style={styles.container}>
      <Ionicons name={iconName} size={12} color={color} />
      <Text variant="caption" style={{ color }}>
        {`${Math.abs(value).toFixed(1)}%`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
});
