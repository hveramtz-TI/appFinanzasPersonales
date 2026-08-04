# Skill Propuesta: expo-recurring-expenses

## Descripción

Módulo de mensualidades (gastos fijos mensuales) que reutiliza la entidad `Reminder` existente con `frequency: 'monthly'`, calcula la próxima fecha de pago manejando meses con menos días (ej. día 31 en febrero), agenda notificaciones locales para el día del pago, y muestra listado, formulario y total mensual de gastos fijos tematizados.

## Cuándo usar

- Módulo Mensualidades: gestión de gastos fijos mensuales (arriendo, créditos, suscripciones, cuentas)
- Cuando un gasto se repite cada mes el mismo día
- Para recordar el pago con notificaciones locales en Expo Go
- Cuando se necesita el total mensual de gastos fijos para el presupuesto

## Qué contendría

### Decisión de diseño: reusar Reminder en vez de una entidad nueva

Las mensualidades NO necesitan una entidad propia: la entidad `Reminder` ya existe en el dominio con `frequency: 'monthly'`, `nextDate`, `amount`, `categoryId`, `payee`, `notificationEnabled` y `notificationTime`. Una mensualidad es exactamente un `Reminder` con:

- `frequency: 'monthly'`
- `notificationEnabled: true`
- `notificationTime` en HH:mm (ej. '09:00')
- `isActive: true`

Esto evita duplicar el CRUD y el sistema de notificaciones (DRY). El módulo de mensualidades aporta solo la capa de presentación y la lógica de cálculo de fechas. Si en el futuro se necesitan campos específicos (ej. día fijo del mes), se puede ampliar el schema de Reminder sin crear otra entidad.

### Componentes principales

1. **RecurringExpenseList**
   - Lista de mensualidades activas con próximo pago y monto
   - Marca las próximas (7 días) para que el usuario sepa qué viene

2. **RecurringExpenseForm**
   - Formulario de alta/edición: título, monto, día del mes, categoría, beneficiario, hora
   - Validación con Zod y preview de la próxima fecha

3. **MonthlyTotalCard**
   - Total mensual de gastos fijos activos
   - Conteo de mensualidades activas

### Lógica de dominio

1. **calculateNextDueDate(dayOfMonth, referenceDate)**
   - Calcula la próxima fecha con día fijo del mes
   - Si el día no existe en el mes (ej. 31 en febrero), usa el último día disponible
   - Devuelve la próxima fecha futura (o de este mes si aún no pasó)

2. **CreateRecurringExpense** (use case)
   - Crea el `Reminder` con `frequency: 'monthly'`
   - Agenda la notificación local para `nextDate` + `notificationTime`

3. **UpdateRecurringExpense / CancelRecurringExpense**
   - Al editar día/hora: recalcula `nextDate` y reprograma la notificación
   - Al cancelar: `isActive = false` y cancela la notificación pendiente

### Código de ejemplo

```typescript
// modules/recurring/domain/usecases/calculateNextDueDate.ts
/**
 * Calcula la próxima fecha de pago con día fijo del mes.
 * Si el mes no tiene ese día (ej. día 31 en febrero), usa el último día disponible.
 */
export function calculateNextDueDate(
  dayOfMonth: number,
  referenceDate: Date = new Date()
): Date {
  const safeDay = Math.min(
    Math.max(dayOfMonth, 1),
    31
  );

  const currentYear = referenceDate.getFullYear();
  const currentMonth = referenceDate.getMonth();

  // Intenta este mes; si el día ya pasó o no existe, prueba el siguiente
  const candidates = [
    new Date(currentYear, currentMonth, safeDay),
    new Date(currentYear, currentMonth + 1, safeDay),
  ];

  for (const candidate of candidates) {
    // Si el mes no tiene ese día, Date lo desplaza al mes siguiente;
    // detectarlo y usar el último día del mes correcto
    if (candidate.getDate() !== safeDay) {
      return new Date(candidate.getFullYear(), candidate.getMonth(), 0);
    }

    // Normalizar a medianoche para comparar solo la fecha
    candidate.setHours(0, 0, 0, 0);
    referenceDate.setHours(0, 0, 0, 0);

    if (candidate.getTime() >= referenceDate.getTime()) {
      return candidate;
    }
  }

  // Fallback: nunca debería llegar aquí
  return candidates[1];
}
```

```typescript
// modules/recurring/domain/usecases/CreateRecurringExpense.ts
import { z } from 'zod';
import * as Notifications from 'expo-notifications';
import { IReminderRepository } from '@/domain/repositories/IReminderRepository';
import {
  Reminder,
  ReminderFrequency,
} from '@/domain/entities/Reminder';
import { calculateNextDueDate } from './calculateNextDueDate';

const CreateRecurringExpenseSchema = z.object({
  title: z.string().min(1).max(100),
  amount: z.number().positive(),
  dayOfMonth: z.number().int().min(1).max(31),
  categoryId: z.string().uuid().optional(),
  payee: z.string().max(100).optional(),
  notificationTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .default('09:00'),
});

export type CreateRecurringExpenseInput = z.infer<
  typeof CreateRecurringExpenseSchema
>;

export interface CreateRecurringExpenseResult {
  reminder: Reminder;
  notificationId: string;
}

const parseTime = (time: string): { hour: number; minute: number } => {
  const [hour, minute] = time.split(':').map(Number);
  return { hour, minute };
};

export class CreateRecurringExpense {
  constructor(private reminderRepo: IReminderRepository) {}

  async execute(input: CreateRecurringExpenseInput): Promise<CreateRecurringExpenseResult> {
    const data = CreateRecurringExpenseSchema.parse(input);
    const nextDate = calculateNextDueDate(data.dayOfMonth);

    const { hour, minute } = parseTime(data.notificationTime);
    nextDate.setHours(hour, minute, 0, 0);

    const reminder = await this.reminderRepo.create({
      title: data.title,
      amount: data.amount,
      frequency: 'monthly' as ReminderFrequency,
      nextDate,
      categoryId: data.categoryId,
      payee: data.payee,
      notificationEnabled: true,
      notificationTime: data.notificationTime,
      isActive: true,
    });

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: `Mensualidad: ${data.title}`,
        body: `Vence hoy por ${data.amount.toLocaleString('es-CL', {
          style: 'currency',
          currency: 'CLP',
          maximumFractionDigits: 0,
        })}`,
        sound: 'default',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: nextDate,
      },
    });

    return { reminder, notificationId };
  }
}
```

```typescript
// modules/recurring/hooks/useRecurringExpenses.ts
import { useCallback, useEffect, useState } from 'react';
import * as Notifications from 'expo-notifications';
import { IReminderRepository } from '@/domain/repositories/IReminderRepository';
import { Reminder } from '@/domain/entities/Reminder';
import { calculateNextDueDate } from '@/modules/recurring/domain/usecases/calculateNextDueDate';

export interface RecurringExpense extends Reminder {
  dayOfMonth: number;
}

export function useRecurringExpenses(repo: IReminderRepository) {
  const [expenses, setExpenses] = useState<RecurringExpense[]>([]);
  const [totalMonthly, setTotalMonthly] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const toExpense = useCallback((reminder: Reminder): RecurringExpense => ({
    ...reminder,
    dayOfMonth: reminder.nextDate.getDate(),
  }), []);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const reminders = await repo.getAll(false);
      const monthly = reminders
        .filter(r => r.frequency === 'monthly' && r.isActive)
        .map(toExpense);

      setExpenses(monthly);
      setTotalMonthly(monthly.reduce((sum, r) => sum + r.amount, 0));
    } catch (e) {
      setError(e as Error);
    } finally {
      setIsLoading(false);
    }
  }, [repo, toExpense]);

  useEffect(() => {
    load();
  }, [load]);

  const cancel = useCallback(
    async (id: string, notificationId?: string) => {
      await repo.update(id, { isActive: false });
      if (notificationId) {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
      }
      await load();
    },
    [repo, load]
  );

  return { expenses, totalMonthly, isLoading, error, reload: load, cancel };
}
```

```typescript
// modules/recurring/components/MonthlyTotalCard.tsx
import { View, Text } from 'react-native';
import { useTheme } from '@/shared/theme';

interface MonthlyTotalCardProps {
  totalMonthly: number;
  activeCount: number;
  upcomingCount: number; // mensualidades que vencen en los próximos 7 días
}

export function MonthlyTotalCard({
  totalMonthly,
  activeCount,
  upcomingCount,
}: MonthlyTotalCardProps) {
  const { theme } = useTheme();

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
      <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
        Total mensual de gastos fijos
      </Text>
      <Text
        style={{
          color: theme.error,
          fontSize: 24,
          fontWeight: '700',
          marginTop: 4,
        }}
      >
        {totalMonthly.toLocaleString('es-CL', {
          style: 'currency',
          currency: 'CLP',
          maximumFractionDigits: 0,
        })}
      </Text>

      <View
        style={{
          flexDirection: 'row',
          gap: 12,
          marginTop: 12,
        }}
      >
        <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
          {activeCount} activas
        </Text>
        <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
          {upcomingCount} vencen en 7 días
        </Text>
      </View>
    </View>
  );
}
```

### Uso en la pantalla

```typescript
// modules/recurring/screens/RecurringExpensesScreen.tsx
import { FlatList, Text } from 'react-native';
import { useTheme } from '@/shared/theme';
import { useRecurringExpenses } from '@/modules/recurring/hooks/useRecurringExpenses';
import { MonthlyTotalCard } from '@/modules/recurring/components/MonthlyTotalCard';
import { RecurringExpenseItem } from '@/modules/recurring/components/RecurringExpenseItem';

export function RecurringExpensesScreen({ reminderRepo }: { reminderRepo: IReminderRepository }) {
  const { theme } = useTheme();
  const { expenses, totalMonthly, isLoading, error } = useRecurringExpenses(reminderRepo);

  if (isLoading) {
    return <Text style={{ color: theme.text }}>Cargando mensualidades...</Text>;
  }

  if (error) {
    return <Text style={{ color: theme.error }}>Error al cargar mensualidades</Text>;
  }

  return (
    <FlatList
      data={expenses}
      keyExtractor={item => item.id}
      ListHeaderComponent={
        <MonthlyTotalCard
          totalMonthly={totalMonthly}
          activeCount={expenses.length}
          upcomingCount={/* mensualidades con nextDate <= hoy + 7 días */}
        />
      }
      renderItem={({ item }) => <RecurringExpenseItem expense={item} />}
    />
  );
}
```

## Dependencias

- `expo-notifications` (notificaciones locales, ya en el proyecto)
- `zod` (validación de formulario y schemas de Reminder)
- `@/shared/theme` (sistema de temas con `useTheme()`)
- `expo-local-notifications-crud` (skill del CRUD base de notificaciones y permisos)

## Notas de implementación

- **Reusar Reminder**: No crear una entidad `RecurringExpense`; es un `Reminder` con `frequency: 'monthly'` (DRY, sin duplicar CRUD ni notificaciones)
- **Día fijo del mes**: Se deriva de `nextDate`, pero el formulario guarda el día como dato de entrada para recalcular
- **Meses cortos**: Días 29/30/31 caen en el último día disponible del mes (31 en febrero → 28 o 29)
- **Notificación**: Se agenda con trigger `DATE` para `nextDate` a la hora configurada; se reprograma al editar
- **Cancelación**: Soft delete con `isActive = false` y cancelación de la notificación pendiente (evita notificaciones fantasma)
- **Expo Go compatible**: `expo-notifications` con triggers locales funciona en Expo Go, sin dev build
- **Permisos**: Pedir permiso de notificaciones antes de crear la primera mensualidad (reuso de `NotificationService.requestPermissions`)

## Edge cases a manejar

1. **Día 29/30/31 en meses cortos**: El día 31 en febrero debe caer en el último día del mes (28/29), no desbordar a marzo
2. **Feriados o fines de semana**: Definir política: notificar igual el día calendario o desplazar a día hábil (requiere calendario de feriados, evaluar si vale la pena en MVP)
3. **Cancelación de recordatorio**: Al desactivar la mensualidad se cancela la notificación pendiente; si no, quedan notificaciones fantasma
4. **Cambio de día de pago**: Al editar el día u hora se debe recalcular `nextDate` y reprogramar la notificación (el trigger de expo-notifications es inmutable; hay que cancelar y recrear)
5. **Duplicados**: Evitar crear dos mensualidades idénticas (mismo título + monto + día) sin confirmación explícita
6. **Remolino de notificaciones al editar**: Si se edita y se cancela + recrea la notificación en cada keystroke, pueden quedar varias agendadas; reprogramar solo al guardar
7. **Frecuencia other**: El hook filtra solo `frequency === 'monthly'`; los demás recordatorios viven en su propio módulo
8. **Fecha en el pasado**: Si `nextDate` queda en el pasado (ej. usuario edita después de la medianoche), recalcular siempre con `calculateNextDueDate`

## Ventajas de este enfoque

- **Sin duplicación**: Mensualidad = Reminder mensual; el CRUD y el sistema de notificaciones ya existen (DRY)
- **Cálculo aislado**: `calculateNextDueDate` es una función pura, fácil de testear con todos los casos de mes corto
- **Consistente**: Misma entidad y mismos patrones de presentación que el resto de la app
- **Testable**: Use case con inyección de `IReminderRepository`, sin dependencias de UI

## Estado

**Propuesta** - Pendiente de implementación en la Fase 3 de appFinanzasPersonales
