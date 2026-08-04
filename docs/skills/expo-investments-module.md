# Skill Propuesta: expo-investments-module

## Descripción

Módulo de inversiones para apps de finanzas personales en Expo: CRUD de inversiones (DP, Fondo Mutuo, acciones, crypto, bonos), cálculo de rendimiento absoluto y porcentual, desglose por tipo de inversión para gráficos, cards tematizadas de inversión y resumen de portafolio, con la entidad `Investment` ya definida en el dominio del proyecto.

## Cuándo usar

- Módulo Inversiones del proyecto (DP, FM, acciones, etc.)
- Registro y seguimiento de inversiones con su valor actual
- Visualización del rendimiento total del portafolio y por tipo
- Cálculo de ganancias/pérdidas absolutas y porcentuales
- Cuando se necesita un resumen del portafolio consistente con el tema de la app

## Qué contendría

### Entidad principal

La entidad `Investment` ya existe en `expo-finance-domain-entities` (type `[deposito_plazo, fondo_mutuo, acciones, crypto, bonos, otro]`, campos `amount`, `currentValue`, `purchaseDate`, `maturityDate`, `interestRate`, `isActive`). Esta skill la reutiliza sin modificarla, agregando los use cases y componentes del módulo.

### Use cases principales

1. **CreateInvestment**
   - Valida los datos con el schema Zod de Investment
   - Persiste la inversión inicial

2. **CalculateReturns**
   - Rendimiento absoluto: `currentValue - amount`
   - Rendimiento porcentual: `((currentValue - amount) / amount) * 100`
   - Manejo de rendimiento negativo (pérdida)

3. **GetInvestmentPortfolio**
   - Totales del portafolio: monto invertido, valor actual, rendimiento total
   - Solo inversiones activas

4. **GetInvestmentBreakdown**
   - Agrupación por tipo de inversión (DP, FM, acciones...)
   - Para alimentar gráficos (pie chart) del dashboard

### Componentes principales

1. **InvestmentCard**
   - Nombre, tipo, monto invertido, valor actual
   - Badge de rendimiento con color verde/rojo

2. **PortfolioSummaryCard**
   - Resumen: total invertido, valor actual, rendimiento
   - Variación porcentual del portafolio

3. **InvestmentForm**
   - Formulario de alta/edición con los campos del schema
   - Validación con Zod

### Código de ejemplo

```typescript
// modules/investments/domain/usecases/CalculateReturns.ts
import {
  Investment,
  InvestmentType,
} from '@/domain/entities/Investment';

export interface InvestmentReturn {
  absolute: number; // currentValue - amount
  percentage: number; // ((currentValue - amount) / amount) * 100
  isPositive: boolean;
  isActive: boolean;
  isMatured: boolean; // maturityDate ya pasó
}

// Clasificación para el breakdown por tipo
export const INVESTMENT_TYPE_LABELS: Record<InvestmentType, string> = {
  deposito_plazo: 'Depósito a Plazo',
  fondo_mutuo: 'Fondo Mutuo',
  acciones: 'Acciones',
  crypto: 'Crypto',
  bonos: 'Bonos',
  otro: 'Otro',
};

export class CalculateReturns {
  execute(investment: Investment): InvestmentReturn {
    const absolute = investment.currentValue - investment.amount;
    // División por cero: amount es positivo por el schema Zod
    const percentage = (absolute / investment.amount) * 100;

    return {
      absolute,
      percentage,
      isPositive: absolute >= 0,
      isActive: investment.isActive,
      isMatured:
        investment.maturityDate !== null &&
        investment.maturityDate.getTime() <= Date.now(),
    };
  }

  // Rendimiento del portafolio completo (solo inversiones activas)
  executePortfolio(investments: Investment[]): InvestmentReturn {
    const active = investments.filter(i => i.isActive);
    const totalInvested = active.reduce((sum, i) => sum + i.amount, 0);
    const totalCurrent = active.reduce((sum, i) => sum + i.currentValue, 0);

    const absolute = totalCurrent - totalInvested;
    const percentage = totalInvested === 0 ? 0 : (absolute / totalInvested) * 100;

    return {
      absolute,
      percentage,
      isPositive: absolute >= 0,
      isActive: true,
      isMatured: false,
    };
  }
}
```

```typescript
// modules/investments/domain/usecases/GetInvestmentBreakdown.ts
import { Investment, InvestmentType } from '@/domain/entities/Investment';
import { INVESTMENT_TYPE_LABELS } from './CalculateReturns';

export interface TypeBreakdown {
  type: InvestmentType;
  typeLabel: string;
  totalInvested: number;
  currentValue: number;
  returnAmount: number;
  returnPercentage: number;
  count: number;
  share: number; // % del valor total del portafolio
}

export class GetInvestmentBreakdown {
  execute(investments: Investment[]): TypeBreakdown[] {
    const active = investments.filter(i => i.isActive);
    const grouped = new Map<InvestmentType, Investment[]>();

    for (const investment of active) {
      const list = grouped.get(investment.type) || [];
      list.push(investment);
      grouped.set(investment.type, list);
    }

    const totalCurrent = active.reduce((sum, i) => sum + i.currentValue, 0);

    const breakdown = Array.from(grouped.entries()).map(
      ([type, items]): TypeBreakdown => {
        const totalInvested = items.reduce((sum, i) => sum + i.amount, 0);
        const currentValue = items.reduce((sum, i) => sum + i.currentValue, 0);
        const returnAmount = currentValue - totalInvested;

        return {
          type,
          typeLabel: INVESTMENT_TYPE_LABELS[type],
          totalInvested,
          currentValue,
          returnAmount,
          returnPercentage: totalInvested === 0 ? 0 : (returnAmount / totalInvested) * 100,
          count: items.length,
          share: totalCurrent === 0 ? 0 : (currentValue / totalCurrent) * 100,
        };
      }
    );

    return breakdown.sort((a, b) => b.currentValue - a.currentValue);
  }
}
```

```typescript
// modules/investments/hooks/useInvestments.ts
import { useCallback, useEffect, useState } from 'react';
import { IInvestmentRepository } from '@/domain/repositories/IInvestmentRepository';
import { Investment } from '@/domain/entities/Investment';
import { GetInvestmentPortfolio } from '@/modules/investments/domain/usecases/GetInvestmentPortfolio';
import { CalculateReturns } from '@/modules/investments/domain/usecases/CalculateReturns';

export interface PortfolioTotals {
  totalInvested: number;
  currentValue: number;
  returnAmount: number;
  returnPercentage: number;
}

export function useInvestments(repo: IInvestmentRepository) {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioTotals | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const calculateReturns = useCallback(new CalculateReturns(), []);
  const getPortfolio = useCallback(new GetInvestmentPortfolio(), []);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const items = await repo.getAll(false);
      setInvestments(items);
      setPortfolio(getPortfolio.execute(items));
    } catch (e) {
      setError(e as Error);
    } finally {
      setIsLoading(false);
    }
  }, [repo, getPortfolio]);

  useEffect(() => {
    load();
  }, [load]);

  const create = useCallback(
    async (data: Omit<Investment, 'id' | 'createdAt' | 'updatedAt'>) => {
      const created = await repo.create(data);
      await load();
      return created;
    },
    [repo, load]
  );

  const updateValue = useCallback(
    async (id: string, currentValue: number) => {
      const updated = await repo.update(id, { currentValue });
      await load();
      return updated;
    },
    [repo, load]
  );

  return {
    investments,
    portfolio,
    getReturn: calculateReturns.execute.bind(calculateReturns),
    isLoading,
    error,
    create,
    updateValue,
    reload: load,
  };
}
```

```typescript
// modules/investments/components/InvestmentCard.tsx
import { View, Text } from 'react-native';
import { useTheme } from '@/shared/theme';
import { Investment } from '@/domain/entities/Investment';
import { InvestmentReturn } from '@/modules/investments/domain/usecases/CalculateReturns';

const formatCLP = (amount: number): string =>
  new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(amount);

interface InvestmentCardProps {
  investment: Investment;
  returns: InvestmentReturn;
  onPress?: () => void;
}

export function InvestmentCard({ investment, returns, onPress }: InvestmentCardProps) {
  const { theme } = useTheme();

  const returnColor = returns.isPositive ? theme.success : theme.error;
  const sign = returns.isPositive ? '+' : '';
  const label = investment.type.replace('_', ' ').toUpperCase();

  return (
    <View
      style={{
        backgroundColor: theme.card,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: theme.border,
      }}
      onTouchEnd={onPress}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Text style={{ color: theme.text, fontSize: 16, fontWeight: '600', flex: 1 }}>
          {investment.name}
        </Text>
        <View
          style={{
            backgroundColor: theme.surface,
            borderRadius: 6,
            paddingHorizontal: 8,
            paddingVertical: 2,
          }}
        >
          <Text style={{ color: theme.textSecondary, fontSize: 11 }}>{label}</Text>
        </View>
      </View>

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginTop: 12,
        }}
      >
        <View>
          <Text style={{ color: theme.textSecondary, fontSize: 12 }}>Invertido</Text>
          <Text style={{ color: theme.text, fontSize: 15, marginTop: 2 }}>
            {formatCLP(investment.amount)}
          </Text>
        </View>

        <View>
          <Text style={{ color: theme.textSecondary, fontSize: 12 }}>Valor actual</Text>
          <Text style={{ color: theme.text, fontSize: 15, marginTop: 2 }}>
            {formatCLP(investment.currentValue)}
          </Text>
        </View>
      </View>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 12,
        }}
      >
        <Text style={{ color: returnColor, fontSize: 14, fontWeight: '600' }}>
          {sign}
          {formatCLP(returns.absolute)} ({sign}
          {returns.percentage.toFixed(2)}%)
        </Text>

        {investment.maturityDate && (
          <Text style={{ color: theme.textSecondary, fontSize: 11 }}>
            Vence {investment.maturityDate.toLocaleDateString('es-CL')}
          </Text>
        )}
      </View>
    </View>
  );
}
```

```typescript
// modules/investments/components/PortfolioSummaryCard.tsx
import { View, Text } from 'react-native';
import { useTheme } from '@/shared/theme';
import { PortfolioTotals } from '@/modules/investments/hooks/useInvestments';

const formatCLP = (amount: number): string =>
  new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(amount);

interface PortfolioSummaryCardProps {
  portfolio: PortfolioTotals;
}

export function PortfolioSummaryCard({ portfolio }: PortfolioSummaryCardProps) {
  const { theme } = useTheme();

  const returnColor = portfolio.returnAmount >= 0 ? theme.success : theme.error;
  const sign = portfolio.returnAmount >= 0 ? '+' : '';

  return (
    <View
      style={{
        backgroundColor: theme.card,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: theme.border,
      }}
    >
      <Text style={{ color: theme.textSecondary, fontSize: 12 }}>Portafolio total</Text>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
        <View>
          <Text style={{ color: theme.textSecondary, fontSize: 12 }}>Invertido</Text>
          <Text style={{ color: theme.text, fontSize: 16, fontWeight: '600', marginTop: 2 }}>
            {formatCLP(portfolio.totalInvested)}
          </Text>
        </View>
        <View>
          <Text style={{ color: theme.textSecondary, fontSize: 12 }}>Valor actual</Text>
          <Text style={{ color: theme.text, fontSize: 16, fontWeight: '600', marginTop: 2 }}>
            {formatCLP(portfolio.currentValue)}
          </Text>
        </View>
      </View>

      <View
        style={{
          marginTop: 12,
          backgroundColor: `${returnColor}1A`,
          borderRadius: 8,
          paddingVertical: 6,
          paddingHorizontal: 10,
          alignSelf: 'flex-start',
        }}
      >
        <Text style={{ color: returnColor, fontWeight: '700' }}>
          {sign}
          {formatCLP(portfolio.returnAmount)} ({sign}
          {portfolio.returnPercentage.toFixed(2)}%)
        </Text>
      </View>
    </View>
  );
}
```

## Dependencias

- `zod` (validación del schema de Investment, ya en el dominio)
- `@/shared/theme` (sistema de temas con `useTheme()`)
- `react-native-gifted-charts` (pie chart del breakdown por tipo, opcional)

## Notas de implementación

- **Reuso de la entidad**: `Investment` y su schema Zod ya viven en `domain/entities/Investment.ts`; esta skill no los redefine
- **Rendimiento**: Absoluto (`currentValue - amount`) y porcentual (`((currentValue - amount) / amount) * 100`), ambos con signo
- **Colores semánticos**: `theme.success` para ganancia y `theme.error` para pérdida, tanto en cards como en badges
- **Solo activos**: El portafolio y el breakdown consideran únicamente inversiones con `isActive = true`
- **Expo Go compatible**: Sin módulos nativos; el breakdown se puede graficar con SVG puro
- **División por cero**: `amount` es positivo por validación Zod, pero `totalInvested` del portafolio puede ser 0 si no hay inversiones activas
- **Actualización de valor**: `currentValue` se actualiza de forma manual (el usuario lo edita) o con un proceso de revalorización, documentado en edge cases

## Edge cases a manejar

1. **Rendimiento negativo**: `currentValue < amount` → pérdida; el signo y el color deben reflejarlo correctamente en el badge
2. **Inversión vencida**: Si `maturityDate` ya pasó, la inversión está madura; decidir si se marca como no activa o se muestra un badge "Vencida"
3. **Tasa de interés anual vs ganancia simple**: `interestRate` es anual (%), no es lo mismo que la ganancia real obtenida; no mezclar ambos conceptos en la UI
4. **Inversiones en otra moneda**: Si la inversión es en USD, el valor actual debe convertirse a CLP para sumar al portafolio (tipo de cambio a definir)
5. **Actualización manual vs automática**: La revalorización automática (ej. por tasa diaria) puede divergir del valor real reportado por el banco; documentar cuál es la fuente de verdad
6. **Eliminar inversión con rendimiento**: El delete es soft (existe `isActive`); no borrar físicamente si el usuario quiere conservar histórico
7. **Varios items por tipo**: El breakdown agrupa, no asume una sola inversión por tipo

## Ventajas de este enfoque

- **Cálculos puros y testables**: `CalculateReturns` y `GetInvestmentBreakdown` son clases puras sin dependencias de UI
- **Feature-first**: Use cases, hook y componentes viven juntos en `modules/investments/`
- **Reuso de dominio**: Aprovecha la entidad ya validada con Zod, sin duplicación (DRY)
- **Consistente**: Mismos patrones de cards, badges y formato CLP que el módulo Finanzas

## Estado

**Propuesta** - Pendiente de implementación en la Fase 3 de appFinanzasPersonales
