# Example

```typescript
// shared/constants/business.ts
export const CHART_COLORS = [
  '#2196F3', '#4CAF50', '#FF9800', '#F44336',
  '#9C27B0', '#00BCD4', '#FFEB3B', '#795548'
];

// modules/dashboard/components/DashboardPieChart.tsx
export function DashboardPieChart({ data }: DashboardPieChartProps) {
  const { theme } = useTheme();

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
      <PieChart
        data={chartData}
        donut
        showText={false}
        innerRadius={60}
        radius={80}
      />
      <View style={styles.legend}>
        {data.map((item, index) => (
          <View key={item.categoryId} style={styles.legendItem}>
            <View style={[
              styles.legendColor,
              { backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }
            ]} />
            <Text variant="caption">{item.categoryName}</Text>
            <Text variant="caption" color="secondary">
              {formatPercentage(item.percentage)}
            </Text>
          </View>
        ))}
      </View>
    </Card>
  );
}
```
