# Fase 3 — Estado de implementación

**Última actualización**: 2026-08-10

## Resumen

Implementación de la Fase 3: Inversiones (DP/FM), Mensualidades (evolución de Reminders), y navegación con sub-tabs en Finanzas. Estrategia: **Feature Branch Chain** con PRs encadenados.

---

## Slices completados ✅

| # | Slice | Rama | Commits | Líneas | Estado |
|---|---|---|---|---|---|
| 1 | Flujo pago reminder | `feature/fase-3/slice-1-reminder-payment-flow` | 5 | 160 | ✅ |
| 2A | Investment entity + repo interface | `feature/fase-3/slice-2a-investment-entity` | 3 | 164 | ✅ |
| 2B | Investment mapper + schema + seed | `feature/fase-3/slice-2b-investment-schema` | 4 | 340 | ✅ |
| 3 | InvestmentRepository SQLite | `feature/fase-3/slice-3-investment-repo` | 1 | 152 | ✅ |
| 4 | Lista inversiones + hooks | `feature/fase-3/slice-4-investments-list` | 4 | 356 | ✅ |
| 5 | Formulario inversión (DP↔FM) | `feature/fase-3/slice-5-investment-form` | 3 | 488 ⚠️ | ✅ |
| 6 | Charts + vencimientos DP + retiros | `feature/fase-3/slice-6-charts-withdrawals` | 1 | 738 | ✅ |
| 7 | MonthlyChargesView | `feature/fase-3/slice-7-monthly-charges` | 1 | 477 | ✅ |
| **Total** | | | **22 commits** | **2.875** | |

### Cadena de branches

```
main → feature/fase-3-tracker
         └── slice-1 (160 LOC) ──► slice-2a (164) ──► slice-2b (340) ──► slice-3 (152) ──► slice-4 (356) ──► slice-5 (488) ──► slice-6 (738) ──► slice-7 (477)
```

### Qué contiene cada slice

#### Slice 1 — Flujo de pago de reminder
- `reminderId` opcional en `Transaction` entity y tabla `transactions`
- `DuplicateReminderPaymentError` en domain errors
- `TransactionMapper` y `TransactionRepository` actualizados
- `MarkReminderAsPaidUseCase` ampliado: recibe `ITransactionRepository`, crea `Transaction` gasto + avanza `nextDate` atómicamente
- `useReminders` hook actualizado

#### Slice 2A — Investment entity + repo interface
- `Investment.ts`: entity Zod con `DP | FM`, refinements por tipo, `CreateInvestment` y `UpdateInvestment`
- `IInvestmentRepository.ts`: interfaz completa (CRUD, getByType, getMatured, getTotalCurrentValue, etc.)
- Tests de validación de entity (DP válido, FM válido, DP sin maturityDate, FM sin installmentCount, cambio de tipo)

#### Slice 2B — Investment mapper + DB schema + seed
- `InvestmentMapper.ts`: `InvestmentRow` ↔ `Investment`, timestamps en UNIX millis
- `DatabaseSchema.ts`: tabla `investments` con índices (`type`, `maturityDate`, `deletedAt`)
- Categoría seed `📈 Inversiones` (`cat-inversiones`, icon `chart-line`, color `#4CAF50`)
- Tests de mapper round-trip y DatabaseSchema

#### Slice 3 — InvestmentRepository SQLite
- `InvestmentRepository.ts`: implementa `IInvestmentRepository`
- CRUD completo, soft delete, `getMatured()`, `getTotalCurrentValue()`
- Sigue el patrón de `TransactionRepository`/`ReminderRepository`

#### Slice 4 — Lista de inversiones + hook
- `useInvestments.ts`: hook con estado `investments[]`, `loading`, `error`, `addInvestment`, `deleteInvestment`, `refresh`
- `InvestmentsScreen.tsx`: SafeAreaView + header con título y botón agregar
- `InvestmentList.tsx`: FlatList con cards (nombre, badge tipo DP/FM, monto inicial, valor actual, rentabilidad %)
- `index.ts`: barrel del módulo
- Tests de screen (6 tests)

#### Slice 5 — Formulario de inversión
- `InvestmentForm.tsx`: formulario con toggle DP/FM, campos comunes, campos específicos por tipo, validación
- `InvestmentFormScreen.tsx`: pantalla con navegación `goBack`
- Al cambiar DP↔FM se limpian los campos específicos del tipo anterior
- Tests de form (DP fields, FM fields, switching, submit)

#### Slice 6 — Charts + vencimientos DP + retiros
- `InvestmentsPieChart.tsx`: donut chart distribución DP vs FM por `currentValue` con leyenda
- `InvestmentsLineChart.tsx`: proyección simple (compra → hoy, initialAmount → currentValue)
- `ProcessMaturedInvestments.ts`: use case — `fixed` crea `Transaction` ingreso, `renewable` crea `Reminder`
- `WithdrawInvestment.ts`: use case — retiro parcial (reduce `currentValue`) o total (`isActive = false`)
- `WithdrawModal.tsx`: modal con toggle retiro total/parcial, input de monto, validación
- `InvestmentsStack.tsx`: stack navigator (`InvestmentsHome` + `InvestmentForm`)
- `useInvestments` hook: agregado `updateInvestment(id, data)`
- `InvestmentList`: botón "Retirar", fix `borderTopColor` → `theme.border`
- `InvestmentsScreen`: fix `borderBottomColor` → `theme.border`, wiring navegación "+" y `WithdrawModal`
- `InvestmentFormScreen`: usa `updateInvestment` para edición (antes siempre llamaba `add`)
- `TabNavigator`: nueva tab "Inversiones" con icono `wallet`

#### Slice 7 — MonthlyChargesView
- `useMonthlyCharges.ts`: hook con filtro (`month`/`week`/`overdue`), `totalPending`, `overdueCount`
- `MonthlyChargesView.tsx`: filter pills + card total pendiente + reuso de `ReminderList`
- `MonthlyChargesScreen.tsx`: SafeAreaView wrapper
- `FinanceStack.tsx`: nueva ruta `MonthlyCharges`
- Spec: `docs/specs/slice-7-monthly-charges.md`

---

## Slices pendientes ⏳

| # | Slice | LOC est. | Descripción |
|---|---|---|---|
| 8 | Indicadores + SubTabBar + FinanceScreen | ~350 | `SubTabBar` custom (4 tabs), refactor `FinanceScreen`, indicador Patrimonio, wiring de navegación |

---

## Verificación

| Métrica | Rama actual | Slices |
|---|---|---|
| `npx tsc --noEmit` | ✅ | Todos los slices |
| `npm test` (main) | 51 tests, 17 suites | — |
| `npm test` (slice-7) | 71 tests, 22 suites | Slice 7 incluye tests de todos los anteriores |

---

## Decisiones de producto

| # | Decisión |
|---|---|
| 1 | Inversiones: solo DP y FM |
| 2 | Valor de inversiones: ingreso manual por el usuario |
| 3 | DP `renewalType`: `fixed` (transacción auto al vencer) o `renewable` (reminder → usuario decide) |
| 4 | Retiro de inversión: genera transacción de ingreso |
| 5 | Categoría `📈 Inversiones` en seed inicial |
| 6 | Sin `accountId` (solo una cuenta) |
| 7 | Tipo de inversión editable (DP ↔ FM permitido) |
| 8 | Mensualidades: evoluciona Reminders, reusa componentes |
| 9 | Patrimonio: acumulado histórico + inversiones |
| 10 | Sub-tabs en Finanzas: custom component, sin swipe (Expo Go) |

---

## Riesgos identificados

| Riesgo | Mitigación |
|---|---|
| Atomicidad `MarkReminderAsPaid` | `withTransactionAsync()`, tests implementados |
| Presupuesto excedido (Slice 5: 488 LOC) | ⚠️ Aceptar o dividir al continuar |
| Duplicación `reminderId` | Validación en use case antes de crear transacción |
| Sin swipe en sub-tabs | Aceptable para 4 tabs estáticas |

---

## Próximos pasos

1. **Slice 7** — MonthlyChargesView (~310 LOC)  
2. **Slice 8** — Indicadores + SubTabBar + FinanceScreen refactor (~350 LOC)
3. Mergear cadena de PRs al tracker `feature/fase-3-tracker`
4. `sdd-verify` de Fase 3 completa
5. `sdd-archive`
