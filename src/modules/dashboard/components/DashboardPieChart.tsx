import React from 'react';
import { View, StyleSheet } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import { useTheme } from '../../../shared/theme';
import { Text, Card } from '../../../shared/components';
import { CategoryBreakdown } from '../../../domain/usecases/GetDashboardData';
import { formatPercentage } from '../../../shared/utils/formatters';
import { CHART_COLORS } from '../../../shared/constants/business';

interface DashboardPieChartProps {
  data: CategoryBreakdown[];
}

export function DashboardPieChart({ data }: DashboardPieChartProps) {
  const { theme } = useTheme();

  if (data.length === 0) {
    return (
      <Card>
        <Text variant="body" color="secondary" style={styles.empty}>
          No hay datos para mostrar
        </Text>
      </Card>
    );
  }

  const chartData = data.map((item, index) => ({
    value: item.percentage,
    color: CHART_COLORS[index % CHART_COLORS.length],
    label: item.categoryName,
  }));

  return (
    <Card>
      <Text variant="h3" style={styles.title}>
        Gastos por categoría
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
      <View style={styles.legend} accessibilityLabel="Leyenda de categorías">
        {chartData.map((item, index) => (
          <View key={data[index].categoryId} style={styles.legendItem}>
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
              {formatPercentage(item.value)}
            </Text>
          </View>
        ))}
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
