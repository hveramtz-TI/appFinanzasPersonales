import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../../shared/theme';
import { Text, Card } from '../../../shared/components';
import { formatCurrency } from '../../../shared/utils/formatters';

interface SummaryCardsProps {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export function SummaryCards({ totalIncome, totalExpense, balance }: SummaryCardsProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <Card style={[styles.card, { borderLeftColor: theme.success }]}>
        <Text variant="caption" color="secondary">
          Ingresos
        </Text>
        <Text variant="h3" style={{ color: theme.success }}>
          {formatCurrency(totalIncome)}
        </Text>
      </Card>

      <Card style={[styles.card, { borderLeftColor: theme.error }]}>
        <Text variant="caption" color="secondary">
          Gastos
        </Text>
        <Text variant="h3" style={{ color: theme.error }}>
          {formatCurrency(totalExpense)}
        </Text>
      </Card>

      <Card style={[styles.card, { borderLeftColor: theme.primary }]}>
        <Text variant="caption" color="secondary">
          Balance
        </Text>
        <Text
          variant="h3"
          style={{ color: balance >= 0 ? theme.success : theme.error }}
        >
          {formatCurrency(balance)}
        </Text>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  card: {
    flex: 1,
    borderLeftWidth: 4,
  },
});
