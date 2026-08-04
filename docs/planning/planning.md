# Planning — appFinanzasPersonales

## Visión

App móvil personal de finanzas, React Native + Expo (**Expo Go**, sin dev build), para uso propio: registrar gastos/ingresos, ver la situación financiera con gráficos, gestionar inversiones y mensualidades fijas, y recibir recordatorios.

## Decisiones de arquitectura

| Área | Decisión |
|---|---|
| Runtime | Expo managed workflow, compatible 100% con Expo Go |
| Carga de datos | Manual (formulario) + import de cartola (Excel/CSV genérico, mapeo de columnas) |
| Storage | SQLite local (`expo-sqlite`) + respaldo/sync en Supabase (Postgres) |
| Auth | Email/password simple vía Supabase — solo para proteger el backup, sin fricción de uso diario |
| Notificaciones | Locales (`expo-notifications`, `scheduleNotificationAsync`) — funcionan en Expo Go, no se requiere remote push |
| Gráficos | `react-native-gifted-charts` (SVG puro, sin módulos nativos → no rompe Expo Go) |
| Excel export/import | `xlsx` (SheetJS) + `expo-file-system` + `expo-sharing` |
| Arquitectura de código | Feature-first: `domain/` (lógica transversal) → `data/` (storage/sync transversal) → `modules/{feature}/` (components + hooks + screens por módulo) → `shared/` (reutilizable en múltiples módulos) |
| Tema | Toggle claro/oscuro, diseño moderno (paleta/tipografía a definir en `sdd-design`) |

## Alcance por fases (SDD incremental)

### Fase 1 — MVP

- Setup del proyecto (Expo + estructura Clean Architecture)
- **Testing**: Jest + React Native Testing Library (solo tests unitarios de lógica de negocio)
- Auth simple + SQLite local + sync básico a Supabase
- Toggle claro/oscuro
- Registro manual de gastos e ingresos (con etiquetas/categorías)
- Dashboard: gráfico de torta (distribución de gastos por etiqueta vs ingresos)
- Notificaciones: recordatorio diario + CRUD de recordatorios propios (ej. mensualidad de crédito)

**Scope de tests unitarios:**
- Domain entities (validación con Zod)
- Use cases (lógica de negocio)
- Hooks críticos (ej. useReminders, useThemeMode)
- NO tests de UI/screens (demasiado setup, poco valor en MVP)

### Fase 2 — Finanzas e Ingresos

- Módulo Finanzas: gráficos varios, % de variación, cards de indicadores (mayores gastos, info relevante)
- Módulo Ingresos (detalle y evolución)

### Fase 3 — Inversiones y Mensualidades

- Módulo Inversiones: DP (Depósito a Plazo), FM (Fondo Mutuo), etc.
- Módulo Mensualidades: gastos fijos mensuales

### Fase 4 — Import/Export

- Importar cartola (Excel/CSV) con mapeo de columnas
- Exportar a Excel con 3 filtros: semanal, mensual, rango libre (desde/hasta)

## Riesgos / pendientes a resolver en `sdd-design`

- Formato exacto de cartola (cada banco exporta distinto) → Fase 4 arranca con importador genérico, no parsers por banco
- Definición visual (paleta, tipografía, componentes) — se define en diseño de Fase 1
- Estructura exacta de sync SQLite ↔ Supabase (offline-first vs online-first)

## Stack técnico confirmado

- React Native + Expo SDK (managed workflow, Expo Go compatible)
- TypeScript
- `expo-sqlite` (storage local)
- Supabase (Postgres + Auth + sync)
- `expo-notifications` (notificaciones locales)
- `react-native-gifted-charts` (gráficos SVG)
- `xlsx` + `expo-file-system` + `expo-sharing` (Excel)
- `@react-navigation/native` (navegación)
- `zustand` o `@tanstack/react-query` (estado global) — a decidir en diseño
- `jest` + `@testing-library/react-native` (tests unitarios de lógica de negocio)

## No-goals

- No se construirá conexión directa con APIs bancarias (Fintoc, Belvo, etc.)
- No se usará dev build ni módulos nativos que rompan Expo Go
- No se construirá backend propio (Supabase reemplaza backend)
- No se soportará web ni tablet en esta iteración (full mobile)
