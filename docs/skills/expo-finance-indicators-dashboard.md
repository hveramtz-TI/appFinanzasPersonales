# Skill Propuesta: expo-finance-indicators-dashboard

## Descripción

Cards de indicadores financieros tematizadas (balance, ingresos, gastos, variación %), badges de variación porcentual con color semántico, gráficos de línea para evolución de ingresos, comparación de períodos mes a mes, y listado de mayores gastos, alimentados por un hook que calcula totales, variaciones y tendencias desde el repositorio de transacciones.

## Cuándo usar

- Módulo Finanzas del dashboard: resumen visual de la situación financiera
- Módulo Ingresos: evolución de ingresos a lo largo del tiempo
- Comparación período a período (mes actual vs mes anterior)
- Cuando se necesitan indicadores calculados (totales, variaciones %) consistentes con el tema de la app
- Dashboard analítico de finanzas personales en Expo Go

## Qué contendría

### Componentes principales

1. **SummaryCards**
   - Grid de cards de indicadores: balance, ingresos, gastos
   - Cada card muestra un monto formateado en CLP y un valor secundario
   - Colores semánticos según el signo del indicador

2. **VarianceBadge**
   - Badge de variación porcentual vs período anterior
   - Flecha hacia arriba/abajo y color verde (subió) o rojo (bajó)
   - Muestra "sin comparación" cuando el período anterior está vacío

3. **ThemedLineChart**
   - Evolución de ingresos/gastos a lo largo del tiempo
   - Serie con área sombreada y puntos de datos
   - Ejes y texto tematizados

4. **MonthlyTrendChart**
   - Barras comparando mes actual vs mes anterior
   - Reusa la paleta del sistema de temas

5. **TopExpensesList**
   - Mayores gastos del período con su categoría e ícono
   - Monto y porcentaje del total de gastos

### Código de ejemplo

```typescript
// modules/finance/hooks/useFinanceIndicators.ts
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ITransactionRepository,
  Transaction,
  DateRange,
} from '@/domain/repositories/ITransactionRepository';

export interface PeriodTotals {
  income: number;
  expense: number;
  balance: number;
}

export interface VarianceResult {
  income: number; // % de variación de ingresos
  expense: number; // % de variación de gastos
  balance: number; // % de variación del balance
  hasPreviousData: boolean;
}

export interface TopExpense {
  categoryId: string;
  categoryName: string;
  amount: number;
  percentage: number; // % del total de gastos
}

export interface FinanceIndicators {
  current: PeriodTotals;
  previous: PeriodTotals;
  variance: VarianceResult;
  topExpenses: TopExpense[];
  isLoading: boolean;
  error: Error | null;
}

function emptyTotals(): PeriodTotals {
  return { income: 0, expense: 0, balance: 0 };
}

function computeTotals(transactions: Transaction[]): PeriodTotals {
  let income = 0;
  let expense = 0;

  for (const transaction of transactions) {
    if (transaction.type === 'income') {
      income += transaction.amount;
    } else {
      expense += transaction.amount;
    }
  }

  return { income, expense, balance: income - expense };
}

function computeVariance(
  current: PeriodTotals,
  previous: PeriodTotals
): VarianceResult {
  // División por cero: si el período anterior es 0, no hay base de comparación
  const varianceOf = (curr: number, prev: number): number => {
    if (prev === 0) return 0;
    return ((curr - prev) / Math.abs(prev)) * 100;
  };

  const hasPreviousData =
    previous.income !== 0 || previous.expense !== 0 || previous.balance !== 0;

  return {
    income: varianceOf(current.income, previous.income),
    expense: varianceOf(current.expense, previous.expense),
    balance: varianceOf(current.balance, previous.balance),
    hasPreviousData,
  };
}

function computeTopExpenses(
  transactions: Transaction[],
  limit = 5
): TopExpense[] {
  const expenses = transactions.filter(t => t.type === 'expense');
  const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);

  const grouped = new Map<string, number>();
  for (const expense of expenses) {
    grouped.set(
      expense.categoryId,
      (grouped.get(expense.categoryId) || 0) + expense.amount
    );
  }

  return Array.from(grouped.entries())
    .map(([categoryId, amount]) => ({
      categoryId,
      categoryName: categoryId, // resuelto por el repositorio de categorías
      amount,
      percentage: totalExpense === 0 ? 0 : (amount / totalExpense) * 100,
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, limit);
}

// Ajusta el rango de fechas al límite del mes evitando problemas de timezone
function monthRange(year: number, month: number): DateRange {
  const startDate = new Date(Date.UTC(year, month, 1));
  const endDate = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));
  return { startDate, endDate };
}

export function useFinanceIndicators(
  transactionRepo: ITransactionRepository,
  referenceDate: Date = new Date()
): FinanceIndicators {
  const [current, setCurrent] = useState<PeriodTotals>(emptyTotals());
  const [previous, setPrevious] = useState<PeriodTotals>(emptyTotals());
  const [topExpenses, setTopExpenses] = useState<TopExpense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);

      try {
        const year = referenceDate.getFullYear();
        const month = referenceDate.getMonth();

        const currentRange = monthRange(year, month);
        const previousRange = monthRange(
          month === 0 ? year - 1 : year,
          month === 0 ? 11 : month - 1
        );

        const [currentTx, previousTx] = await Promise.all([
          transactionRepo.getByDateRange(currentRange),
          transactionRepo.getByDateRange(previousRange),
        ]);

        if (cancelled) return;

        const currentTotals = computeTotals(currentTx);
        const previousTotals = computeTotals(previousTx);

        setCurrent(currentTotals);
        setPrevious(previousTotals);
        setTopExpenses(computeTopExpenses(currentTx));
      } catch (e) {
        if (!cancelled) setError(e as Error);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [transactionRepo, referenceDate]);

  const variance = useMemo(
    () => computeVariance(current, previous),
    [current, previous]
  );

  return { current, previous, variance, topExpenses, isLoading, error };
}
```

```typescript
// modules/finance/components/VarianceBadge.tsx
import { View, Text } from 'react-native';
import { useTheme } from '@/shared/theme';

type Trend = 'up' | 'down' | 'flat';

interface VarianceBadgeProps {
  value: number; // % de variación
  hasPreviousData?: boolean;
  invertColors?: boolean; // true cuando subir es malo (gastos)
  label?: string; // ej. "vs mes anterior"
}

function getTrend(value: number): Trend {
  if (value > 0) return 'up';
  if (value < 0) return 'down';
  return 'flat';
}

export function VarianceBadge({
  value,
  hasPreviousData = true,
  invertColors = false,
  label,
}: VarianceBadgeProps) {
  const { theme } = useTheme();

  if (!hasPreviousData) {
    return (
      <View
        style={{
          backgroundColor: theme.surface,
          borderRadius: 6,
          paddingHorizontal: 8,
          paddingVertical: 2,
        }}
      >
        <Text style={{ color: theme.textDisabled, fontSize: 12 }}>
          Sin comparación
        </Text>
      </View>
    );
  }

  const trend = getTrend(value);
  const isGood = invertColors ? trend === 'down' : trend === 'up';
  const color = trend === 'flat' ? theme.textSecondary : isGood ? theme.success : theme.error;
  const arrow = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→';

  return (
    <View
      style={{
        backgroundColor: `${color}1A`, // ~10% opacidad sobre el color base
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 2,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
      }}
    >
      <Text style={{ color, fontSize: 12, fontWeight: '600' }}>
        {arrow} {Math.abs(value).toFixed(1)}%
      </Text>
      {label && (
        <Text style={{ color: theme.textSecondary, fontSize: 11 }}>{label}</Text>
      )}
    </View>
  );
}
```

```typescript
// modules/finance/components/SummaryCards.tsx
import { View, Text } from 'react-native';
import { useTheme } from '@/shared/theme';
import { VarianceBadge } from './VarianceBadge';
import {
  FinanceIndicators,
} from '@/modules/finance/hooks/useFinanceIndicators';

const formatCLP = (amount: number): string =>
  new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(amount);

interface SummaryCardsProps {
  indicators: FinanceIndicators;
}

export function SummaryCards({ indicators }: SummaryCardsProps) {
  const { theme } = useTheme();
  const { current, variance } = indicators;

  const balanceColor =
    current.balance >= 0 ? theme.success : theme.error;

  return (
    <View style={{ flexDirection: 'row', gap: 12 }}>
      <View
        style={{
          flex: 1,
          backgroundColor: theme.card,
          borderRadius: 12,
          padding: 16,
          borderWidth: 1,
          borderColor: theme.border,
        }}
      >
        <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
          Balance
        </Text>
        <Text
          style={{
            color: balanceColor,
            fontSize: 20,
            fontWeight: '700',
            marginTop: 4,
          }}
        >
          {formatCLP(current.balance)}
        </Text>
        <View style={{ marginTop: 8 }}>
          <VarianceBadge value={variance.balance} hasPreviousData={variance.hasPreviousData} />
        </View>
      </View>

      <View
        style={{
          flex: 1,
          backgroundColor: theme.card,
          borderRadius: 12,
          padding: 16,
          borderWidth: 1,
          borderColor: theme.border,
        }}
      >
        <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
          Ingresos
        </Text>
        <Text
          style={{
            color: theme.success,
            fontSize: 20,
            fontWeight: '700',
            marginTop: 4,
          }}
        >
          {formatCLP(current.income)}
        </Text>
        <View style={{ marginTop: 8 }}>
          <VarianceBadge value={variance.income} hasPreviousData={variance.hasPreviousData} />
        </View>
      </View>

      <View
        style={{
          flex: 1,
          backgroundColor: theme.card,
          borderRadius: 12,
          padding: 16,
          borderWidth: 1,
          borderColor: theme.border,
        }}
      >
        <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
          Gastos
        </Text>
        <Text
          style={{
            color: theme.error,
            fontSize: 20,
            fontWeight: '700',
            marginTop: 4,
          }}
        >
          {formatCLP(current.expense)}
        </Text>
        <View style={{ marginTop: 8 }}>
          <VarianceBadge
            value={variance.expense}
            hasPreviousData={variance.hasPreviousData}
            invertColors
            label="vs mes anterior"
          />
        </View>
      </View>
    </View>
  );
}
```

### Uso en el Dashboard

```typescript
// modules/finance/screens/FinanceScreen.tsx
import { ScrollView, Text } from 'react-native';
import { useTheme } from '@/shared/theme';
import { useFinanceIndicators } from '@/modules/finance/hooks/useFinanceIndicators';
import { SummaryCards } from '@/modules/finance/components/SummaryCards';
import { TopExpensesList } from '@/modules/finance/components/TopExpensesList';
import { ThemedLineChart } from '@/presentation/components/charts/ThemedLineChart';
import { MonthlyTrendChart } from '@/modules/finance/components/MonthlyTrendChart';

export function FinanceScreen({ transactionRepo }: { transactionRepo: ITransactionRepository }) {
  const { theme } = useTheme();
  const indicators = useFinanceIndicators(transactionRepo);

  if (indicators.isLoading) {
    return <Text style={{ color: theme.text }}>Cargando indicadores...</Text>;
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
      <SummaryCards indicators={indicators} />

      <ThemedLineChart
        title="Evolución de ingresos"
        data={/* data de ingresos por mes desde getMonthlyTotals */}
      />

      <MonthlyTrendChart current={indicators.current} previous={indicators.previous} />

      <TopExpensesList expenses={indicators.topExpenses} totalExpense={indicators.current.expense} />
    </ScrollView>
  );
}
```

## Dependencias

- `react-native-gifted-charts` (gráficos de línea y barras)
- `react-native-svg` (requerido por gifted-charts)
- `zod` (para schemas de periodos de comparación si se exponen como DTOs)
- `@/shared/theme` (sistema de temas existente, con `useTheme()`)

## Notas de implementación

- **Moneda CLP**: Todos los montos se formatean con `Intl.NumberFormat('es-CL')`, sin decimales
- **Comparación período a período**: Calcular siempre el período anterior con el mismo criterio (mes calendario), no "últimos 30 días"
- **Períodos vacíos**: Si el período anterior no tiene transacciones, la variación es 0% y el badge muestra "Sin comparación"
- **División por cero**: Usar `Math.abs(prev)` como denominador y retornar 0 cuando prev es 0
- **Sin módulos nativos**: Solo SVG puro, compatible con Expo Go
- **Timezones**: Calcular límites de mes con `Date.UTC` para evitar saltos de día por zona horaria
- **Un hook, un repositorio**: `useFinanceIndicators` depende de `ITransactionRepository` vía inyección, no importa la implementación concreta

## Edge cases a manejar

1. **Período anterior vacío**: Sin transacciones previas → variación indefinida, mostrar "Sin comparación" en vez de dividir por cero
2. **Cero gastos**: `topExpenses` vacío y porcentajes en 0 sin dividir por cero
3. **Fechas límite de mes**: Transacciones a las 23:59 del último día deben entrar en el período (usar `endDate` inclusivo)
4. **Timezone**: `new Date(year, month, 1)` puede desplazarse un día en zonas horarias con offset grande → usar `Date.UTC`
5. **Ingresos irregulares**: Si el usuario recibe ingresos bimensuales, la variación mes a mes puede ser engañosa → considerar ventana de 2-3 meses
6. **Montos muy grandes**: Números mayores a 1e9 pueden perder precisión en float → evaluar manejo de decimales o BigInt
7. **Transacciones soft-deleted**: Excluir siempre las que tengan `deletedAt` no nulo de los totales

## Ventajas de este enfoque

- **Un solo fuente de verdad**: Todos los indicadores se derivan de `ITransactionRepository`, sin duplicar lógica de agregación
- **Testable**: `computeTotals`, `computeVariance` y `computeTopExpenses` son funciones puras y unit-testables
- **Tematizado por diseño**: Cards y badges usan `theme.success`/`theme.error` para el color semántico
- **Consistente**: Los mismos cálculos alimentan el dashboard, el módulo Finanzas y el módulo Ingresos

## Estado

**Propuesta** - Pendiente de implementación en la Fase 2 de appFinanzasPersonales
