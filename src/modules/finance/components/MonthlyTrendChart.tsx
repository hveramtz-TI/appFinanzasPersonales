import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { useTheme } from '../../../shared/theme';
import { Text, Card } from '../../../shared/components';
import { PeriodTotals } from '../types';

interface MonthlyTrendChartProps {
  current: PeriodTotals;
  previous: PeriodTotals;
}

interface BarDataPoint {
  value: number;
  label: string;
  frontColor: string;
}

export function MonthlyTrendChart({
  current,
  previous,
}: MonthlyTrendChartProps) {
  const { theme, resolvedTheme } = useTheme();

  const data: BarDataPoint[] = [
    { value: current.income, label: 'Ingresos', frontColor: theme.success },
    { value: previous.income, label: 'Ingr. ant.', frontColor: theme.textSecondary },
    { value: current.expense, label: 'Gastos', frontColor: theme.error },
    { value: previous.expense, label: 'Gast. ant.', frontColor: theme.textSecondary },
    { value: current.balance, label: 'Balance', frontColor: theme.primary },
    { value: previous.balance, label: 'Bal. ant.', frontColor: theme.textSecondary },
  ];

  return (
    <Card>
      <Text variant="h3" style={styles.title}>
        Comparación mensual
      </Text>
      <View key={resolvedTheme} style={styles.chartContainer}>
        <BarChart
          data={data}
          width={280}
          height={160}
          barWidth={28}
          spacing={16}
          barBorderRadius={4}
          rulesColor={theme.border}
          yAxisTextStyle={{ color: theme.textSecondary }}
          xAxisLabelTextStyle={{ color: theme.textSecondary }}
          xAxisColor={theme.border}
          yAxisColor={theme.border}
          noOfSections={4}
          showVerticalLines
          verticalLinesColor={theme.border}
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  title: {
    marginBottom: 16,
    textAlign: 'center',
  },
  chartContainer: {
    alignItems: 'center',
  },
});
