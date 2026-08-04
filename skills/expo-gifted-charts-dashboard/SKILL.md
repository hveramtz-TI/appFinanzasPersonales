---
name: expo-gifted-charts-dashboard
description: "Trigger: charts, dashboard, pie chart, gráficos, panel de control, visualization. Create analytics dashboard with react-native-gifted-charts, pie/bar/line charts, themed components, and interactive data visualization."
license: Apache-2.0
metadata:
  author: "gentle-ai"
  version: "1.0"
---

# Expo Gifted Charts Dashboard

## Activation Contract

Create analytics dashboard when:
- Need data visualization with charts
- Using Expo Go (SVG-based charts required)
- Want themed chart components
- Require interactive charts with onPress

## Hard Rules

- Use react-native-gifted-charts (SVG pure, Expo Go compatible)
- Extract color palette to constants (not hardcoded in components)
- Theme all chart elements (text, borders, backgrounds)
- Implement responsive sizing with Dimensions API
- Add onPress handlers for navigation
- Create reusable chart wrapper components
- Memoize chart data to avoid re-renders

## Decision Gates

| Need | Chart Type |
|------|-----------|
| Category distribution | PieChart (donut mode) |
| Time series | LineChart with area |
| Comparison | BarChart (vertical/horizontal) |
| Multiple metrics | StackedBarChart |
| Progress tracking | ProgressChart |

## Execution Steps

1. Install react-native-gifted-charts
2. Create chart color palette constant
3. Create themed chart wrapper components
4. Implement PieChart with legend
5. Implement BarChart with labels
6. Implement LineChart with area fill
7. Add onPress handlers for drill-down
8. Create dashboard screen with multiple charts

## Output Contract

- Chart color palette extracted to constants
- Themed PieChart, BarChart, LineChart components
- Interactive charts with onPress navigation
- Responsive sizing
- Dashboard screen with multiple chart types

## Example

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
