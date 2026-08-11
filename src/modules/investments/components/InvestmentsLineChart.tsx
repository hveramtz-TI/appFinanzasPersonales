import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { useTheme } from '../../../shared/theme';
import { Text, Card } from '../../../shared/components';
import { Investment } from '../../../domain/entities/Investment';
import { formatCurrency } from '../../../shared/utils/formatters';

interface InvestmentsLineChartProps {
  investments: Investment[];
}

export function InvestmentsLineChart({ investments }: InvestmentsLineChartProps) {
  const { theme } = useTheme();

  const activeInvestments = investments.filter(i => i.isActive);

  const { startDate, startValue, endValue } = useMemo(() => {
    if (activeInvestments.length === 0) {
      return { startDate: null, startValue: 0, endValue: 0 };
    }

    let earliest = activeInvestments[0].purchaseDate;
    let totalInitial = 0;
    let totalCurrent = 0;

    for (const inv of activeInvestments) {
      if (inv.purchaseDate < earliest) {
        earliest = inv.purchaseDate;
      }
      totalInitial += inv.initialAmount;
      totalCurrent += inv.currentValue;
    }

    return { startDate: earliest, startValue: totalInitial, endValue: totalCurrent };
  }, [activeInvestments]);

  if (!startDate) {
    return (
      <Card>
        <Text variant="body" color="secondary" style={styles.empty}>
          No hay inversiones activas
        </Text>
      </Card>
    );
  }

  const startLabel = startDate.toLocaleDateString('es-CL', {
    month: 'short',
    year: 'numeric',
  });
  const endLabel = 'Hoy';

  const chartData = [
    {
      value: startValue,
      label: startLabel,
      dataPointText: formatCurrency(startValue),
    },
    {
      value: endValue,
      label: endLabel,
      dataPointText: formatCurrency(endValue),
    },
  ];

  const isGrowth = endValue >= startValue;
  const lineColor = isGrowth ? theme.success : theme.error;
  const gradientColor = isGrowth ? `${theme.success}33` : `${theme.error}33`;

  return (
    <Card>
      <Text variant="h3" style={styles.title}>
        Evolución del valor
      </Text>
      <Text variant="caption" color="secondary" style={styles.subtitle}>
        Proyección desde {startLabel} hasta hoy
      </Text>
      <View style={styles.chartContainer}>
        <LineChart
          data={chartData}
          color={lineColor}
          thickness={3}
          startFillColor={gradientColor}
          endFillColor={`${lineColor}00`}
          startOpacity={0.8}
          endOpacity={0.1}
          spacing={200}
          hideDataPoints={false}
          dataPointsColor={lineColor}
          dataPointsRadius={5}
          textColor={theme.text}
          textFontSize={11}
          yAxisColor={theme.border}
          xAxisColor={theme.border}
          yAxisTextStyle={{ color: theme.textSecondary, fontSize: 10 }}
          backgroundColor="transparent"
          noOfSections={4}
          formatYLabel={(value: string) => formatCurrency(Number(value))}
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  title: {
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 16,
  },
  chartContainer: {
    alignItems: 'center',
  },
  empty: {
    textAlign: 'center',
    padding: 32,
  },
});
