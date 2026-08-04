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

## References

- `references/example.md` — complete code example.
