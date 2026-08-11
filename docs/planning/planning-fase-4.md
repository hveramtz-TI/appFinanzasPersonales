# Planning — Fase 4: Import/Export

**Fecha**: 2026-08-10
**Estado**: Planning inicial

## Visión

Permitir al usuario importar transacciones desde archivos Excel/CSV (cartolas bancarias genéricas) y exportar sus datos financieros a Excel con filtros por período. Esto cierra el ciclo de datos de la app: entrada manual + importación masiva + salida a Excel para análisis externo o respaldo.

## Alcance

### Import

- Seleccionar archivo `.xlsx`, `.xls` o `.csv` desde el dispositivo
- Vista previa de las primeras filas del archivo
- Mapeo de columnas: el usuario asigna cada columna del archivo a un campo de `Transaction` (monto, fecha, descripción, tipo)
- Detección automática de tipo (ingreso/gasto) por signo del monto
- Asignación de categoría por defecto durante la importación
- Resumen post-importación: cuántas transacciones se crearon, cuántas se saltaron
- Manejo de duplicados (misma fecha + monto + descripción = skip)

### Export

- Exportar transacciones a `.xlsx`
- 3 filtros de período: semanal, mensual, rango libre (desde/hasta)
- Columnas: Fecha, Tipo, Categoría, Monto, Descripción
- Compartir archivo vía `expo-sharing` (abre el sheet nativo del OS)

## Decisiones de arquitectura

| Área | Decisión |
|---|---|
| Librería Excel | `xlsx` (SheetJS) — ya listada en el stack técnico del planning general |
| Acceso a archivos | `expo-file-system` + `expo-document-picker` (nuevo) para seleccionar archivos |
| Compartir export | `expo-sharing` — abre el menú nativo de compartir |
| Mapeo de columnas | Configurable por el usuario en UI paso a paso (wizard de 2-3 pantallas) |
| Detección de tipo | Por signo: monto > 0 → income, monto < 0 → expense (configurable) |
| Categoría default | El usuario elige una categoría del seed antes de importar |
| Duplicados | Hash compuesto: `fecha + monto + descripción`. Si existe → skip (no update) |
| Export a Excel | `xlsx.utils.json_to_sheet()` + `xlsx.write()` → buffer → `expo-sharing` |
| Formato fechas | El usuario indica el formato durante el mapeo (DD/MM/AAAA, MM/DD/AAAA, etc.) |

## No-goals

- No se construyen parsers específicos por banco (el usuario mapea columnas manualmente)
- No se importan/exportan inversiones ni reminders (solo transacciones)
- No se sincroniza con APIs bancarias
- No se hace OCR de PDFs
- No se exporta a PDF (solo Excel)

## Stack técnico

| Herramienta | Uso |
|---|---|
| `xlsx` (SheetJS) | Parseo de Excel/CSV + generación de Excel |
| `expo-file-system` | Leer/escribir archivos en el filesystem |
| `expo-document-picker` | Seleccionar archivo del dispositivo |
| `expo-sharing` | Compartir archivo exportado |
| `expo-sqlite` | Insertar transacciones importadas |
| `uuid` | Generar IDs para transacciones importadas |

## UI/UX — Flujo de importación

```
┌─ Pantalla 1: Seleccionar archivo ──────┐
│  [Seleccionar archivo]                  │
│  Formatos: .xlsx, .xls, .csv           │
│  Último archivo importado: (nombre)     │
└─────────────────────────────────────────┘
              ↓
┌─ Pantalla 2: Vista previa ─────────────┐
│  Tabla con primeras 5 filas del archivo │
│  "El archivo tiene 142 filas"           │
│  [Continuar]                            │
└─────────────────────────────────────────┘
              ↓
┌─ Pantalla 3: Mapeo de columnas ────────┐
│  Para cada campo requerido:             │
│  Fecha:   [▼ Columna A (DD/MM/AAAA)]   │
│  Monto:   [▼ Columna B]                │
│  Descrip: [▼ Columna C]                │
│  Tipo:    [○ Por signo  ○ Por columna] │
│  Categoría default: [▼ Sin categoría]  │
│  Formato fecha: [▼ DD/MM/AAAA]         │
│                                         │
│  [Importar 142 transacciones]           │
└─────────────────────────────────────────┘
              ↓
┌─ Pantalla 4: Resultado ────────────────┐
│  ✅ 138 importadas                      │
│  ⏭️ 4 saltadas (duplicados)             │
│  ❌ 0 errores                           │
│  [Volver a Finanzas]                    │
└─────────────────────────────────────────┘
```

## UI/UX — Flujo de exportación

```
┌─ Pantalla: Exportar ───────────────────┐
│  Período:                               │
│  [○ Semanal  ○ Mensual  ● Rango libre] │
│                                         │
│  Desde: [01/01/2026]                    │
│  Hasta: [31/01/2026]                    │
│                                         │
│  Transacciones en el rango: 45          │
│                                         │
│  [Exportar a Excel]                     │
└─────────────────────────────────────────┘
```

## Slices propuestos

| Slice | Descripción | LOC est. |
|---|---|---|
| 1 | Import: file picker + preview | ~250 |
| 2 | Import: column mapping + wizard UI | ~350 |
| 3 | Import: insertion logic + dedup + result screen | ~250 |
| 4 | Export: date filters + Excel generation + sharing | ~300 |
| **Total** | | **~1.150** |

Alternativa: 2 slices más grandes (~550 c/u).

## Riesgos

| Riesgo | Mitigación |
|---|---|
| `expo-document-picker` no disponible en Expo Go | Verificar compatibilidad antes de implementar. Si no funciona, usar `expo-file-system` con URI directa |
| Formatos de fecha inconsistentes entre bancos | El usuario configura el formato durante el mapeo |
| Archivos Excel muy grandes (>10MB) | Limitar a 5000 filas, mostrar warning si excede |
| Duplicados con transacciones manuales existentes | Hash fecha+monto+descripción; skip silencioso |
| Encoding de CSV (UTF-8 vs Latin1) | SheetJS maneja detección automática |

## Dependencias a instalar

```bash
npx expo install expo-document-picker expo-file-system expo-sharing
npm install xlsx
```

`expo-file-system` y `expo-sharing` ya deberían estar (están en el planning general).

## Próximos pasos

1. Verificar compatibilidad de `expo-document-picker` con Expo Go
2. Instalar dependencias necesarias
3. Crear spec detallado para Slice 1
4. Implementar
