# Skill Propuesta: expo-gifted-charts-dashboard

## Descripción

Componentes de gráficos tematizados (Pie/Bar/Line) con responsive sizing, integración con sistema de temas, navegación desde taps en gráficos, y generadores de paletas de colores para datos categóricos.

## Cuándo usar

- Dashboards analíticos en apps Expo/React Native
- Visualización de datos financieros, estadísticas, o métricas
- Cuando se necesitan gráficos interactivos que funcionen en Expo Go
- Proyectos que requieren gráficos consistentes con el tema de la app

## Qué contendría

### Componentes principales

1. **ThemedPieChart**
   - Gráfico de torta/dona con colores de la paleta
   - Labels y leyendas tematizadas
   - onPress para navegación a detalle
   - Responsive sizing

2. **ThemedBarChart**
   - Barras verticales/horizontales
   - Animaciones de entrada
   - Tooltips al presionar
   - Ejes tematizados

3. **ThemedLineChart**
   - Líneas con gradientes
   - Puntos de datos interactivos
   - Área sombreada opcional
   - Múltiples series

4. **ChartCard**
   - Wrapper con título, subtítulo
   - Bordes y sombras tematizadas
   - Header con acciones (ej. filtro de período)

5. **Color Palette Generator**
   - Genera paletas de N colores distinguibles
   - Consistente entre light/dark mode
   - Accesible (contraste adecuado)

### Código de ejemplo

```typescript
// presentation/components/charts/ThemedPieChart.tsx
import { PieChart } from 'react-native-gifted-charts';
import { useTheme } from '@/shared/theme';

interface PieChartData {
  value: number;
  label: string;
  color?: string;
  onPress?: () => void;
}

interface ThemedPieChartProps {
  data: PieChartData[];
  title?: string;
  donut?: boolean;
  showLegend?: boolean;
  onValuePress?: (item: PieChartData) => void;
}

export function ThemedPieChart({
  data,
  title,
  donut = false,
  showLegend = true,
  onValuePress,
}: ThemedPieChartProps) {
  const { theme } = useTheme();
  const palette = useChartPalette(data.length);

  const chartData = data.map((item, index) => ({
    value: item.value,
    label: item.label,
    color: item.color || palette[index],
    onPress: item.onPress || (() => onValuePress?.(item)),
  }));

  return (
    <ChartCard title={title}>
      <PieChart
        data={chartData}
        donut={donut}
        showText={false}
        innerRadius={donut ? 60 : 0}
        sectionAutoFocus
        radius={120}
        textSize={12}
        textColor={theme.text}
        backgroundColor="transparent"
        onPress={({ index }) => {
          chartData[index].onPress?.();
        }}
      />
      
      {showLegend && (
        <View style={{ marginTop: 16, gap: 8 }}>
          {chartData.map((item, index) => (
            <View
              key={index}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <View
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: item.color,
                }}
              />
              <Text style={{ color: theme.text, flex: 1 }}>
                {item.label}
              </Text>
              <Text style={{ color: theme.textSecondary }}>
                {item.value}%
              </Text>
            </View>
          ))}
        </View>
      )}
    </ChartCard>
  );
}

// presentation/components/charts/useChartPalette.ts
import { useTheme } from '@/shared/theme';

export function useChartPalette(count: number): string[] {
  const { isDark } = useTheme();

  // Paletas predefinidas para light/dark mode
  const lightPalette = [
    '#2196F3', // blue
    '#4CAF50', // green
    '#FF9800', // orange
    '#F44336', // red
    '#9C27B0', // purple
    '#00BCD4', // cyan
    '#FFEB3B', // yellow
    '#795548', // brown
    '#607D8B', // blue-grey
    '#E91E63', // pink
  ];

  const darkPalette = [
    '#64B5F6', // blue light
    '#81C784', // green light
    '#FFB74D', // orange light
    '#E57373', // red light
    '#BA68C8', // purple light
    '#4DD0E1', // cyan light
    '#FFF176', // yellow light
    '#A1887F', // brown light
    '#90A4AE', // blue-grey light
    '#F06292', // pink light
  ];

  const basePalette = isDark ? darkPalette : lightPalette;

  // Si necesitamos más colores que los disponibles, repetir
  const palette: string[] = [];
  for (let i = 0; i < count; i++) {
    palette.push(basePalette[i % basePalette.length]);
  }

  return palette;
}

// presentation/components/charts/ThemedBarChart.tsx
import { BarChart } from 'react-native-gifted-charts';
import { useTheme } from '@/shared/theme';

interface BarChartData {
  value: number;
  label: string;
  onPress?: () => void;
}

interface ThemedBarChartProps {
  data: BarChartData[];
  title?: string;
  horizontal?: boolean;
  showValues?: boolean;
  onBarPress?: (item: BarChartData) => void;
}

export function ThemedBarChart({
  data,
  title,
  horizontal = false,
  showValues = true,
  onBarPress,
}: ThemedBarChartProps) {
  const { theme } = useTheme();
  const palette = useChartPalette(data.length);

  const chartData = data.map((item, index) => ({
    value: item.value,
    label: item.label,
    frontColor: palette[index],
    onPress: item.onPress || (() => onBarPress?.(item)),
  }));

  return (
    <ChartCard title={title}>
      <BarChart
        data={chartData}
        horizontal={horizontal}
        showValues={showValues}
        barWidth={32}
        spacing={16}
        yAxisColor={theme.border}
        xAxisColor={theme.border}
        yAxisTextStyle={{ color: theme.textSecondary }}
        xAxisTextStyle={{ color: theme.textSecondary }}
        backgroundColor="transparent"
        onPress={({ index }) => {
          chartData[index].onPress?.();
        }}
      />
    </ChartCard>
  );
}

// presentation/components/charts/ChartCard.tsx
import { useTheme } from '@/shared/theme';

interface ChartCardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}

export function ChartCard({ title, subtitle, children, action }: ChartCardProps) {
  const { theme } = useTheme();

  return (
    <View
      style={{
        backgroundColor: theme.card,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: theme.border,
        shadowColor: theme.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      {(title || action) && (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
          }}
        >
          <View>
            {title && (
              <Text
                style={{
                  color: theme.text,
                  fontSize: 16,
                  fontWeight: '600',
                }}
              >
                {title}
              </Text>
            )}
            {subtitle && (
              <Text
                style={{
                  color: theme.textSecondary,
                  fontSize: 12,
                  marginTop: 2,
                }}
              >
                {subtitle}
              </Text>
            )}
          </View>
          {action}
        </View>
      )}
      {children}
    </View>
  );
}
```

### Uso en Dashboard

```typescript
// presentation/screens/DashboardScreen.tsx
import { ThemedPieChart, ThemedBarChart } from '@/presentation/components/charts';

export function DashboardScreen() {
  const navigation = useNavigation();
  const { expensesByCategory, monthlyTrend } = useDashboardData();

  const pieData = expensesByCategory.map(cat => ({
    value: cat.percentage,
    label: cat.name,
    onPress: () => navigation.navigate('CategoryDetail', { categoryId: cat.id }),
  }));

  const barData = monthlyTrend.map(month => ({
    value: month.amount,
    label: month.label,
    onPress: () => navigation.navigate('MonthDetail', { month: month.date }),
  }));

  return (
    <ScrollView>
      <ThemedPieChart
        data={pieData}
        title="Gastos por categoría"
        donut
        showLegend
      />
      
      <ThemedBarChart
        data={barData}
        title="Tendencia mensual"
        showValues
      />
    </ScrollView>
  );
}
```

## Dependencias

- `react-native-gifted-charts` (gráficos SVG puros)
- `react-native-svg` (requerido por gifted-charts)

## Notas de implementación

- **SVG puro**: No requiere módulos nativos, compatible con Expo Go
- **Tematización completa**: Todos los colores vienen del theme context
- **Responsive**: Usar `Dimensions` o `onLayout` para sizing adaptativo
- **Performance**: SVG puede ser lento con muchos datos → limitar a ~50 items
- **Accesibilidad**: Agregar `accessibilityLabel` a los gráficos

## Edge cases a manejar

1. **Muchos datos**: Limitar a 10-15 categorías, agrupar el resto en "Otros"
2. **Valores cero**: No mostrar en el gráfico pero mantener en leyenda
3. **Labels largos**: Truncar con ellipsis o usar tooltips
4. **Orientación**: Considerar layout diferente en landscape
5. **Animaciones**: Deshabilitar en dispositivos de baja gama si hay lag

## Limitaciones de react-native-gifted-charts

- ✅ Pie/Donut charts
- ✅ Bar charts (vertical/horizontal)
- ✅ Line charts con áreas
- ✅ Stacked charts
- ✅ Animaciones
- ❌ 3D charts
- ❌ Mapas de calor
- ❌ Gráficos muy complejos (considerar victory-native como backup)

## Estado

**Propuesta** - Pendiente de implementación después del MVP de appFinanzasPersonales
