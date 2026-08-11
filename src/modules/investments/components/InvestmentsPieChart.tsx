import React from 'react';
import { View, StyleSheet } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import { useTheme } from '../../../shared/theme';
import { Text, Card } from '../../../shared/components';
import { Investment, InvestmentType } from '../../../domain/entities/Investment';
import { formatCurrency, formatPercentage } from '../../../shared/utils/formatters';
import { CHART_COLORS } from '../../../shared/constants/business';

interface InvestmentsPieChartProps {
  investments: Investment[];
}

const TYPE_LABELS: Record<InvestmentType, string> = {
  DP: 'Plazo Fijo',
  FM: 'Fondo Mutuo',
};

export function InvestmentsPieChart({ investments }: InvestmentsPieChartProps) {
  const { theme } = useTheme();

  const activeInvestments = investments.filter(i => i.isActive);

  if (activeInvestments.length === 0) {
    return (
      <Card>
        <Text variant="body" color="secondary" style={styles.empty}>
          No hay inversiones activas
        </Text>
      </Card>
    );
  }

  const grouped = new Map<InvestmentType, number>();
  for (const inv of activeInvestments) {
    grouped.set(inv.type, (grouped.get(inv.type) ?? 0) + inv.currentValue);
  }

  const total = Array.from(grouped.values()).reduce((sum, v) => sum + v, 0);

  const chartData = Array.from(grouped.entries()).map(([type, value], index) => ({
    value,
    color: CHART_COLORS[index % CHART_COLORS.length],
    label: TYPE_LABELS[type],
  }));

  return (
    <Card>
      <Text variant="h3" style={styles.title}>
        Distribución del portafolio
      </Text>
      <View style={styles.chartContainer}>
        <PieChart
          data={chartData}
          donut
          showText={false}
          innerRadius={60}
          radius={80}
        />
      </View>
      <View style={styles.legend} accessibilityLabel="Leyenda de tipos de inversión">
        {chartData.map((item, index) => {
          const percentage = total > 0 ? (item.value / total) * 100 : 0;
          return (
            <View key={index} style={styles.legendItem}>
              <View
                style={[
                  styles.legendColor,
                  { backgroundColor: item.color },
                ]}
              />
              <Text variant="caption" style={styles.legendLabel}>
                {item.label}
              </Text>
              <Text variant="caption" color="secondary">
                {formatCurrency(item.value)} ({formatPercentage(percentage)})
              </Text>
            </View>
          );
        })}
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
    marginBottom: 16,
  },
  legend: {
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendLabel: {
    flex: 1,
  },
  empty: {
    textAlign: 'center',
    padding: 32,
  },
});
