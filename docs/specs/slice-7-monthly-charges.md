# Spec: Slice 7 — MonthlyChargesView

**Fase**: 3 — Inversiones y Mensualidades
**Slice**: 7 de 8
**Estimación**: ~240 LOC
**Estado**: Pendiente

## Propósito

Vista de mensualidades dentro del módulo Finanzas que muestra los gastos recurrentes (reminders) agrupados por período, con total pendiente y filtro de vencidos. Reusa `ReminderList` del módulo de reminders.

## Requisitos

### R1 — Navegación

El usuario debe poder acceder a la vista de mensualidades desde el stack de Finanzas.

**Scenario: Acceso desde FinanceStack**
- **Given** el usuario está en `FinanceHome`
- **When** navega a `MonthlyCharges`
- **Then** ve la pantalla de mensualidades con header "Mensualidades"

### R2 — Filtro por período

Tres filtros mutuamente excluyentes: mes actual, semana actual, y vencidos.

**Scenario: Filtro mes actual por defecto**
- **Given** el usuario abre `MonthlyCharges`
- **Then** el filtro "Mes actual" está seleccionado
- **And** se muestran solo los reminders con `nextDate` dentro del mes calendario actual

**Scenario: Cambiar a filtro semana**
- **Given** el usuario está en "Mes actual"
- **When** presiona "Semana"
- **Then** se muestran solo los reminders con `nextDate` dentro de lunes→domingo de la semana actual

**Scenario: Filtrar vencidos**
- **Given** el usuario está en "Mes actual"
- **When** presiona "Vencidos"
- **Then** se muestran solo los reminders activos con `nextDate < today`
- **And** el pill "Vencidos" muestra badge rojo con el conteo

### R3 — Total pendiente

Card resumen que muestra el total acumulado y conteo de vencidos.

**Scenario: Total pendiente con vencidos**
- **Given** hay 3 reminders filtrados: $100.000 (vencido), $50.000 (próximo), $25.000 (próximo)
- **When** se renderiza la vista
- **Then** la card muestra "Total pendiente: $175.000"
- **And** muestra "1 vencido" en color de error

**Scenario: Sin vencidos**
- **Given** ningún reminder está vencido
- **Then** la card no muestra el texto de vencidos
- **And** solo muestra el total pendiente

### R4 — Reuso de ReminderList

La lista de mensualidades reusa el componente `ReminderList` de `modules/reminders`.

**Scenario: Marcar como pagado**
- **Given** se muestra la lista filtrada
- **When** el usuario presiona "✓ Pagado" en un reminder
- **Then** se crea la transacción correspondiente y se avanza `nextDate`
- **And** la lista se actualiza

**Scenario: Eliminar**
- **Given** se muestra la lista filtrada
- **When** el usuario presiona "Eliminar"
- **Then** el reminder se borra y desaparece de la lista

### R5 — Estados vacíos

**Scenario: Sin reminders en el período**
- **Given** no hay reminders en el mes actual
- **Then** se muestra "No hay mensualidades en este período"

**Scenario: Sin reminders vencidos**
- **Given** se selecciona "Vencidos" y no hay ninguno
- **Then** se muestra "No hay mensualidades vencidas"

## Especificación técnica

### Componentes nuevos

#### `MonthlyChargesScreen`

```
modules/finance/screens/MonthlyChargesScreen.tsx
```

Pantalla con SafeAreaView + header "Mensualidades". Renderiza `MonthlyChargesView`. Sin lógica de negocio.

**Props**: ninguna (usa hooks internos).

#### `MonthlyChargesView`

```
modules/finance/components/MonthlyChargesView.tsx
```

Contenedor principal. Layout vertical:
1. Filter pills (3 botones horizontales)
2. Total pending card
3. ReminderList (reusado)

**Estados internos**:
- `filter: 'month' | 'week' | 'overdue'` (vía `useMonthlyCharges`)
- `reminders`, `loading`, `error` (vía `useReminders()`)

**Filter pills**:
- 3 `TouchableOpacity` en fila con `flexDirection: 'row'`, `gap`
- Seleccionado: `backgroundColor: theme.primary`, texto blanco
- No seleccionado: `backgroundColor: theme.surface`, texto `theme.text`
- Pill "Vencidos" muestra badge condicional: círculo rojo con número si `overdueCount > 0`

**Total pending card**:
- Card con `backgroundColor: theme.card`
- Título "Total pendiente" en `textSecondary`, tamaño caption
- Monto en `formatCurrency()`, tamaño h3, color `theme.text`
- Si `overdueCount > 0`: "N vencido(s)" en `theme.error`, tamaño caption

#### `useMonthlyCharges`

```
modules/finance/hooks/useMonthlyCharges.ts
```

Hook que extiende `useReminders()` con lógica de filtrado.

**Return**:
```ts
{
  filter: FilterPeriod
  setFilter: (f: FilterPeriod) => void
  filteredReminders: Reminder[]
  totalPending: number
  overdueCount: number
  // re-exportado de useReminders:
  reminders, loading, error, addReminder, deleteReminder, markAsPaid, refresh
}
```

**Lógica de filtrado** (funciones puras exportadas para testeabilidad):

- `filterByMonth(reminders, date)` — `nextDate` dentro del mismo mes/año que `date`
- `filterByWeek(reminders, date)` — `nextDate` entre lunes 00:00 y domingo 23:59 de la semana de `date`
- `filterByOverdue(reminders, date)` — `nextDate < date && isActive === true`

**Total pending**: `sum(filteredReminders.map(r => r.amount))`

**Overdue count**: `filterByOverdue(allReminders, new Date()).length` (calculado siempre, sin importar el filtro activo)

### Dependencias entre módulos

```
modules/finance/components/MonthlyChargesView
  └── modules/reminders/components/ReminderList   ← reuso directo
  └── modules/reminders/hooks/useReminders        ← reuso directo
  └── modules/finance/hooks/useMonthlyCharges     ← hook propio
```

### Navegación

Agregar a `FinanceStackParamList`:
```ts
MonthlyCharges: undefined;
```

Agregar screen al `Stack.Navigator`:
```tsx
<Stack.Screen
  name="MonthlyCharges"
  component={MonthlyChargesScreen}
  options={{ title: 'Mensualidades', headerShown: true }}
/>
```

Nota: Slice 8 refactorizará esto con SubTabBar. Por ahora va como screen del stack.

### Barrel exports

Agregar a `modules/finance/index.ts`:
```ts
export * from './components/MonthlyChargesView';
export * from './hooks/useMonthlyCharges';
export * from './screens/MonthlyChargesScreen';
```

## No-goals

- No se modifica `ReminderList` ni `useReminders` (son reusados tal cual)
- No se agregan notificaciones
- No se crea SubTabBar (eso es Slice 8)
- No se modifica `FinanceScreen` (eso es Slice 8)
