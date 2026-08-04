# Skill Propuesta: expo-local-notifications-crud

## Descripción

Sistema CRUD completo para notificaciones locales en Expo, con soporte para triggers diarios/semanales/mensuales, manejo de permisos, configuración de canales Android, y hooks de React para gestión de recordatorios.

## Cuándo usar

- Apps que necesitan recordatorios programados sin servidor backend
- Cuando se requiere notificaciones que funcionen en Expo Go (sin dev build)
- Para apps de productividad, finanzas, salud, o cualquier app con recordatorios
- Proyectos donde push notifications no son necesarias

## Qué contendría

### Arquitectura

```
┌─────────────────┐
│   React App     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  useReminders   │ ◄── Hook principal
│     (hook)      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ NotificationSvc │ ◄── Servicio de notificaciones
│    (service)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ expo-notifications │
└─────────────────┘
```

### Componentes principales

1. **Notification Service**
   - Inicialización y configuración
   - Solicitud de permisos
   - Configuración de canales Android
   - Programación/cancelación de notificaciones

2. **Reminder Entity**
   ```typescript
   interface Reminder {
     id: string;
     title: string;
     message: string;
     trigger: TriggerConfig;
     enabled: boolean;
     createdAt: Date;
   }

   type TriggerConfig = 
     | { type: 'daily'; hour: number; minute: number }
     | { type: 'weekly'; weekday: number; hour: number; minute: number }
     | { type: 'monthly'; day: number; hour: number; minute: number }
     | { type: 'interval'; seconds: number };
   ```

3. **useReminders Hook**
   - CRUD de recordatorios
   - Sincronización con sistema de notificaciones
   - Estado de permisos
   - Habilitar/deshabilitar recordatorios

### Código de ejemplo

```typescript
// shared/notifications/NotificationService.ts
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export class NotificationService {
  private static readonly CHANNEL_ID = 'default-channel';

  static async initialize(): Promise<void> {
    // Configurar handler de notificaciones
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    // Configurar canal Android (requerido para Android 8+)
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(
        this.CHANNEL_ID,
        {
          name: 'Recordatorios',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        }
      );
    }
  }

  static async requestPermissions(): Promise<boolean> {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  }

  static async scheduleReminder(reminder: Reminder): Promise<string> {
    const trigger = this.buildTrigger(reminder.trigger);
    
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: reminder.title,
        body: reminder.message,
        sound: 'default',
        data: { reminderId: reminder.id },
      },
      trigger,
    });

    return identifier;
  }

  static async cancelReminder(identifier: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  }

  private static buildTrigger(config: TriggerConfig): Notifications.NotificationTriggerInput {
    switch (config.type) {
      case 'daily':
        return {
          repeats: true,
          hour: config.hour,
          minute: config.minute,
        };
      case 'weekly':
        return {
          repeats: true,
          weekday: config.weekday,
          hour: config.hour,
          minute: config.minute,
        };
      case 'monthly':
        return {
          repeats: true,
          day: config.day,
          hour: config.hour,
          minute: config.minute,
        };
      case 'interval':
        return {
          seconds: config.seconds,
          repeats: true,
        };
    }
  }
}

// presentation/hooks/useReminders.ts
import { useState, useEffect } from 'react';
import { NotificationService } from '@/shared/notifications/NotificationService';

export function useReminders() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkPermissions();
    loadReminders();
  }, []);

  async function checkPermissions() {
    const granted = await NotificationService.requestPermissions();
    setHasPermission(granted);
  }

  async function loadReminders() {
    // Cargar desde SQLite
    const stored = await reminderRepository.getAll();
    setReminders(stored);
    setLoading(false);
  }

  async function addReminder(
    reminder: Omit<Reminder, 'id' | 'createdAt'>
  ): Promise<void> {
    if (!hasPermission) {
      throw new Error('Notification permissions not granted');
    }

    const id = crypto.randomUUID();
    const newReminder = { ...reminder, id, createdAt: new Date() };

    // Programar notificación
    await NotificationService.scheduleReminder(newReminder);

    // Guardar en DB
    await reminderRepository.create(newReminder);

    setReminders(prev => [...prev, newReminder]);
  }

  async function removeReminder(id: string): Promise<void> {
    const reminder = reminders.find(r => r.id === id);
    if (!reminder) return;

    // Cancelar notificación
    await NotificationService.cancelReminder(reminder.notificationIdentifier!);

    // Eliminar de DB
    await reminderRepository.delete(id);

    setReminders(prev => prev.filter(r => r.id !== id));
  }

  async function toggleReminder(id: string): Promise<void> {
    const reminder = reminders.find(r => r.id === id);
    if (!reminder) return;

    if (reminder.enabled) {
      await NotificationService.cancelReminder(reminder.notificationIdentifier!);
    } else {
      await NotificationService.scheduleReminder(reminder);
    }

    await reminderRepository.update(id, { enabled: !reminder.enabled });
    setReminders(prev =>
      prev.map(r => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
  }

  return {
    reminders,
    hasPermission,
    loading,
    addReminder,
    removeReminder,
    toggleReminder,
    refreshPermissions: checkPermissions,
  };
}
```

### Uso en componentes

```typescript
// presentation/screens/RemindersScreen.tsx
export function RemindersScreen() {
  const { reminders, addReminder, removeReminder, toggleReminder } = useReminders();

  return (
    <View>
      <FlatList
        data={reminders}
        renderItem={({ item }) => (
          <ReminderCard
            reminder={item}
            onToggle={() => toggleReminder(item.id)}
            onDelete={() => removeReminder(item.id)}
          />
        )}
      />
      <Button title="Agregar recordatorio" onPress={handleAdd} />
    </View>
  );
}
```

## Dependencias

- `expo-notifications` (API de notificaciones)
- `expo-sqlite` (storage de recordatorios)

## Notas de implementación

- **Permisos obligatorios**: Solicitar permisos antes de programar notificaciones
- **Canales Android**: Requeridos en Android 8+ (API 26+), sin ellos las notificaciones no se muestran
- **Límite de 64 notificaciones**: iOS y Android tienen límite de notificaciones programadas
- **DAILY triggers**: Pueden saltarse si el dispositivo estaba apagado a la hora programada
- **Expo Go compatible**: Todas las notificaciones locales funcionan en Expo Go (SDK 53+)
- **No requiere servidor**: Todo se maneja localmente en el dispositivo

## Edge cases a manejar

1. **Permisos denegados**: Mostrar mensaje explicativo y botón para abrir settings
2. **Dispositivo apagado**: Notificaciones DAILY pueden perderse → considerar INTERVAL como backup
3. **Cambio de zona horaria**: Los triggers con hora específica pueden desincronizarse
4. **Actualización de app**: Notificaciones programadas se mantienen, pero verificar al iniciar
5. **Background vs Foreground**: Configurar comportamiento diferente según estado de la app

## Limitaciones de Expo Go

- ✅ Notificaciones locales (scheduleNotificationAsync)
- ✅ Triggers diarios/semanales/mensuales
- ✅ Canales Android
- ❌ Push notifications remotas (requiere dev build desde SDK 53)
- ❌ Categorías de notificaciones con acciones (limitado)
- ❌ Notificaciones interactivas con botones (limitado)

## Estado

**Propuesta** - Pendiente de implementación después del MVP de appFinanzasPersonales
