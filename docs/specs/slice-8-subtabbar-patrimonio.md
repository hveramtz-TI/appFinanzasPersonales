# Spec: Slice 8 — Indicadores + SubTabBar + FinanceScreen refactor

**Fase**: 3 — Inversiones y Mensualidades  
**Slice**: 8 de 8  
**Estimación**: ~380 LOC  
**Estado**: Pendiente

## Propósito

Refactorizar FinanceScreen para integrar 4 sub-tabs con navegación por botones (sin swipe, Expo Go compatible): Resumen, Ingresos, Mensualidades y Patrimonio. Compartir una única conexión DB entre sub-vistas. Agregar indicador de patrimonio neto (balance acumulado + inversiones).

## Requisitos

### R1 — SubTabBar

Barra de navegación horizontal con 4 tabs que cambian el contenido mostrado en FinanceScreen.

**Scenario: Navegación entre tabs**
- **Given** el usuario está en FinanceScreen
- **When** presiona "Ingresos"
- **Then** el tab "Ingresos" se marca como activo (color primary, borde inferior)
- **And** se muestra el contenido de evolución de ingresos
- **And** los otros tabs quedan sin seleccionar

**Scenario: Tab por defecto**
- **Given** el usuario abre FinanceScreen
- **Then** el tab "Resumen" está seleccionado

### R2 — Inline de Ingresos

El contenido de IncomeScreen se muestra inline dentro de FinanceScreen.

**Scenario: IncomeView inline**
- **Given** el tab "Ingresos" está activo
- **Then** se muestra el selector de rango de fechas, totales, gráfico de línea y lista de transacciones
- **And** usa el mismo `transactionRepo` que el resto de FinanceScreen

### R3 — Inline de Mensualidades

**Scenario: MonthlyChargesView inline**
- **Given** el tab "Mensualidades" está activo
- **Then** se muestra el MonthlyChargesView con filtros y ReminderList

### R4 — Patrimonio

Nuevo indicador que muestra patrimonio neto = balance acumulado + inversiones.

**Scenario: Patrimonio con inversiones**
- **Given** el balance acumulado es $500.000 y hay $300.000 en inversiones
- **When** el tab "Patrimonio" está activo
- **Then** se muestra "Patrimonio neto: $800.000"
- **And** breakdown: "Balance acumulado: $500.000", "Inversiones: $300.000"

**Scenario: Patrimonio sin inversiones**
- **Given** no hay inversiones registradas
- **Then** "Inversiones: $0" sin errores

### R5 — Simplificación del stack

Income y MonthlyCharges dejan de ser screens navegables del FinanceStack.

**Scenario: Stack reducido**
- **Given** el FinanceStack está definido
- **Then** solo existe la ruta `FinanceHome`
- **And** `IncomeScreen` y `MonthlyChargesScreen` siguen exportadas pero no en el stack

## Especificación técnica

### Componentes nuevos

#### `SubTabBar`

```
modules/finance/components/SubTabBar.tsx
```

```ts
interface TabItem {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

interface SubTabBarProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (key: string) => void;
}
```

4 tabs fijos: Resumen (analytics), Ingresos (trending-up), Mensualidades (calendar), Patrimonio (wallet).

Implementación: `flexDirection: 'row'`, cada tab `flex: 1`, `TouchableOpacity` con icono Ionicons arriba y label abajo. Selected: `borderBottomWidth: 2`, `borderBottomColor: theme.primary`.

#### `IncomeView`

```
modules/finance/components/IncomeView.tsx
```

Contenido de IncomeScreen extraído como componente standalone. Recibe `transactionRepo` por prop. Sin SafeAreaView ni header propio (los provee FinanceScreen).

```ts
interface IncomeViewProps {
  transactionRepo: ITransactionRepository;
}
```

Contenido: DateRange picker card, summary cards (total, count, average), ThemedLineChart, IncomeTransactionList, DateRangeModal.

#### `NetWorthView`

```
modules/finance/components/NetWorthView.tsx
```

```ts
interface NetWorthViewProps {
  transactionRepo: ITransactionRepository;
  investmentRepo: IInvestmentRepository | null;
}
```

Internamente:
- `useEffect` → `transactionRepo.getMonthlyTotals(year)` → suma balances → `balanceAcumulado`
- `useEffect` → `investmentRepo?.getTotalCurrentValue()` → `totalInversiones`
- `patrimonioNeto` = `balanceAcumulado + totalInversiones`

Layout:
- Card "Patrimonio neto" con monto grande
- Sub-cards: "Balance acumulado", "Inversiones" con montos y porcentajes
- LineChart con evolución mensual (usa los monthlyTotals)

### Archivos modificados

#### `useFinanceScreen.ts`

Nuevo return shape:
```ts
{
  transactionRepo: ITransactionRepository | null;
  investmentRepo: IInvestmentRepository | null;
  // ... campos existentes
}
```

Crea `InvestmentRepository` junto con `TransactionRepository`.

#### `FinanceScreen.tsx`

- Agrega `SubTabBar` debajo del header
- `useState<TabKey>('summary')` para tab activo
- Switch de contenido según tab activo
- Pasa `transactionRepo` a `IncomeView` y `NetWorthView`
- Elimina `IncomeEvolutionCard` (redundante con tab Ingresos)

#### `FinanceStack.tsx`

```ts
export type FinanceStackParamList = {
  FinanceHome: undefined;
};
```

Elimina rutas `Income` y `MonthlyCharges`.

#### `IncomeScreen.tsx`

Refactoriza para usar `IncomeView` internamente con su propia DB (backward compat).
```tsx
export function IncomeScreen() {
  const { transactionRepo, isInitializing, initError } = useIncomeScreen();
  if (!transactionRepo) return <Loading />;
  return <IncomeView transactionRepo={transactionRepo} />;
}
```

#### Barrel exports

Agregar `SubTabBar`, `IncomeView`, `NetWorthView` a `modules/finance/index.ts`.

### No-goals

- No se eliminan `IncomeScreen` ni `MonthlyChargesScreen` (backward compat, tests)
- No se usa swipe/gestures (Expo Go constraint)
- No se modifican `useIncomeScreen` ni `useIncomeEvolution`
- No se agregan nuevos queries al repositorio
