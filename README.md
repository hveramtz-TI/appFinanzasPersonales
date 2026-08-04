# appFinanzasPersonales

App móvil personal de finanzas construida con React Native + Expo.

## Características

- ✅ **Dashboard**: Visualización de gastos por categoría con gráfico de torta
- ✅ **Transacciones**: CRUD completo de ingresos y gastos con categorías
- ✅ **Recordatorios**: Gestión de pagos recurrentes con notificaciones
- ✅ **Tema**: Toggle entre modo claro, oscuro y sistema
- ✅ **Sync**: Sincronización offline-first con Supabase
- ✅ **Auth**: Autenticación con email/password

## Stack Técnico

- **Framework**: React Native + Expo SDK 52
- **Lenguaje**: TypeScript (strict mode)
- **Navegación**: React Navigation (bottom tabs)
- **Estado**: Zustand (persistencia con AsyncStorage)
- **Base de datos local**: expo-sqlite
- **Backend**: Supabase (PostgreSQL + Auth)
- **Gráficos**: react-native-gifted-charts
- **Testing**: Jest + React Native Testing Library

## Arquitectura

El proyecto sigue una arquitectura **feature-first** con Clean Architecture:

```
src/
├── domain/              # Lógica de negocio pura
│   ├── entities/        # Entidades (Transaction, Category, Reminder)
│   ├── repositories/    # Interfaces de repositorios
│   └── usecases/        # Casos de uso
├── data/                # Capa de datos
│   ├── local/           # SQLite repositories
│   ├── remote/          # Supabase client + auth
│   ├── sync/            # Sync service (offline-first)
│   └── mappers/         # DTOs ↔ Entities
├── shared/              # Código reutilizable
│   ├── components/      # UI components (Button, Card, Input, etc.)
│   ├── hooks/           # Shared hooks (useAuth, useSync, etc.)
│   ├── theme/           # Theme system (light/dark/system)
│   ├── utils/           # Formatters, validators
│   └── constants/       # Business constants
├── modules/             # Features específicas
│   ├── auth/            # Login/SignUp
│   ├── dashboard/       # Dashboard con gráficos
│   ├── transactions/    # Gestión de transacciones
│   ├── reminders/       # Recordatorios de pagos
│   └── settings/        # Configuración de la app
└── navigation/          # Navegación (TabNavigator, RootNavigator)
```

## Instalación

```bash
# Instalar dependencias
npm install

# Iniciar en desarrollo
npm start

# Ejecutar en Android
npm run android

# Ejecutar en iOS
npm run ios
```

## Testing

```bash
# Ejecutar tests
npm test

# Ejecutar tests en watch mode
npm run test:watch

# Generar coverage
npm run test:coverage
```

## Variables de Entorno

Crear archivo `.env` en la raíz:

```env
EXPO_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

## Estructura de Base de Datos

### Tablas SQLite

- **categories**: Categorías de gastos/ingresos
- **transactions**: Transacciones financieras
- **reminders**: Recordatorios de pagos recurrentes
- **sync_queue**: Cola de sincronización con Supabase

### Sync Strategy

- **Offline-first**: Todas las operaciones se guardan localmente primero
- **Background sync**: Sincronización automática cuando hay conexión
- **Conflict resolution**: Last-write-wins con timestamps
- **Retry logic**: 3 reintentos con exponential backoff

## Categorías por Defecto

### Gastos
- 🍔 Comida
- 🚗 Transporte
- 🎬 Entretenimiento
- 💊 Salud
- 📚 Educación
- 👕 Ropa
- 🏠 Hogar
- 💡 Servicios
- 📦 Otros

### Ingresos
- 💰 Salario
- 💻 Freelance
- 📈 Inversiones
- 💵 Otros ingresos

## Roadmap

### Fase 2 (Próxima)
- [ ] Módulo de Finanzas con gráficos avanzados
- [ ] Módulo de Ingresos con detalle y evolución
- [ ] Exportación a Excel con filtros

### Fase 3
- [ ] Módulo de Inversiones (DP, FM, etc.)
- [ ] Módulo de Mensualidades (gastos fijos)
- [ ] Importación de cartolas bancarias

## Licencia

Privado - Uso personal
