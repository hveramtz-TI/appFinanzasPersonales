import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { useTheme } from '../../../shared/theme';
import { Text, Card } from '../../../shared/components';

interface ChartDataPoint {
  value: number;
  label?: string;
}

interface ThemedLineChartProps {
  title: string;
  data: ChartDataPoint[];
  color: string;
  emptyLabel?: string;
}

export function ThemedLineChart({
  title,
  data,
  color,
  emptyLabel = 'No hay datos para mostrar',
}: ThemedLineChartProps) {
  const { theme, resolvedTheme } = useTheme();

  const chartData = data.map((point) => ({ ...point }));

  if (chartData.length === 0) {
    return (
      <Card>
        <Text variant="h3" style={styles.title}>
          {title}
        </Text>
        <Text variant="body" color="secondary" style={styles.empty}>
          {emptyLabel}
        </Text>
      </Card>
    );
  }

  return (
    <Card>
      <Text variant="h3" style={styles.title}>
        {title}
      </Text>
      <View key={resolvedTheme} style={styles.chartContainer}>
        <LineChart
          data={chartData}
          color={color}
          width={280}
          height={160}
          areaChart
          startFillColor={color}
          endFillColor={color}
          startOpacity={0.3}
          endOpacity={0.05}
          rulesColor={theme.border}
          yAxisTextStyle={{ color: theme.textSecondary }}
          xAxisLabelTextStyle={{ color: theme.textSecondary }}
          dataPointsColor={color}
          dataPointsRadius={4}
          textColor={theme.textSecondary}
          noOfSections={4}
          yAxisColor={theme.border}
          xAxisColor={theme.border}
          showVerticalLines
          verticalLinesColor={theme.border}
          adjustToWidth
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
  empty: {
    textAlign: 'center',
    paddingVertical: 32,
  },
});
