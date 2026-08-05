import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../../shared/theme';
import { Text, Card } from '../../../shared/components';
import { formatCurrency } from '../../../shared/utils/formatters';
import { PeriodTotals, VarianceResult } from '../types';
import { VarianceBadge } from './VarianceBadge';

interface FinanceSummaryCardsProps {
  current: PeriodTotals;
  variance: VarianceResult;
}

interface SummaryCardProps {
  label: string;
  amount: number;
  varianceValue: number;
  invertColors?: boolean;
  accentColor: string;
  amountColor?: string;
}

function SummaryCard({
  label,
  amount,
  varianceValue,
  invertColors = false,
  accentColor,
  amountColor,
}: SummaryCardProps) {
  return (
    <Card style={[styles.card, { borderLeftColor: accentColor }]}>
      <Text variant="caption" color="secondary">
        {label}
      </Text>
      <Text variant="h3" style={{ color: amountColor ?? accentColor }}>
        {formatCurrency(amount)}
      </Text>
      <VarianceBadge
        value={varianceValue}
        invertColors={invertColors}
        hasPreviousData={true}
      />
    </Card>
  );
}

export function FinanceSummaryCards({
  current,
  variance,
}: FinanceSummaryCardsProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <SummaryCard
        label="Balance"
        amount={current.balance}
        varianceValue={variance.balance}
        accentColor={theme.primary}
        amountColor={current.balance >= 0 ? theme.success : theme.error}
      />
      <SummaryCard
        label="Ingresos"
        amount={current.income}
        varianceValue={variance.income}
        accentColor={theme.success}
      />
      <SummaryCard
        label="Gastos"
        amount={current.expense}
        varianceValue={variance.expense}
        invertColors
        accentColor={theme.error}
      />
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
    padding: 12,
  },
});
