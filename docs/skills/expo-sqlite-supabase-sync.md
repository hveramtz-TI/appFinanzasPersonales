# Skill Propuesta: expo-sqlite-supabase-sync

## Descripción

Implementa sincronización offline-first entre expo-sqlite (storage local) y Supabase (cloud backup), con resolución de conflictos basada en UUIDs, cola de sincronización, y estrategia last-write-wins.

## Cuándo usar

- Apps Expo que necesitan funcionar sin conexión a internet
- Cuando se requiere backup en la nube de datos locales
- Para apps multi-dispositivo donde el usuario puede editar en diferentes dispositivos
- Proyectos donde la latencia de red no debe afectar la UX

## Qué contendría

### Arquitectura de sync

```
┌─────────────────┐
│   App (React)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  SQLite Local   │ ◄── Escritura inmediata
│  (expo-sqlite)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Sync Queue    │ ◄── Cambios pendientes
│  (tabla local)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Sync Service   │ ◄── Background sync
│  (worker)       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    Supabase     │ ◄── Cloud backup
│   (Postgres)    │
└─────────────────┘
```

### Componentes principales

1. **Schema con UUIDs y timestamps**
   - Primary keys: UUID (no auto-increment)
   - `created_at`, `updated_at` en todas las tablas
   - `synced_at` para tracking de sincronización
   - `deleted_at` para soft deletes

2. **Sync Queue table**
   ```sql
   CREATE TABLE sync_queue (
     id TEXT PRIMARY KEY,
     entity_type TEXT NOT NULL,
     entity_id TEXT NOT NULL,
     operation TEXT NOT NULL, -- 'INSERT' | 'UPDATE' | 'DELETE'
     payload TEXT NOT NULL,
     created_at INTEGER NOT NULL,
     retry_count INTEGER DEFAULT 0
   );
   ```

3. **Sync Service**
   - Escucha cambios en sync_queue
   - Aplica cambios a Supabase
   - Maneja retries con exponential backoff
   - Marca items como sincronizados

4. **Conflict Resolution**
   - Last-write-wins basado en `updated_at`
   - Detección de conflictos (opcional)
   - Merge strategies configurables

### Código de ejemplo

```typescript
// data/sync/SyncService.ts
export class SyncService {
  constructor(
    private localDb: SQLiteDatabase,
    private supabase: SupabaseClient
  ) {}

  async syncPendingChanges(): Promise<void> {
    const pending = await this.localDb.getAllAsync(
      'SELECT * FROM sync_queue ORDER BY created_at ASC'
    );

    for (const item of pending) {
      try {
        await this.applyToSupabase(item);
        await this.localDb.runAsync(
          'DELETE FROM sync_queue WHERE id = ?',
          [item.id]
        );
      } catch (error) {
        await this.handleSyncError(item, error);
      }
    }
  }

  private async applyToSupabase(item: SyncQueueItem): Promise<void> {
    const { entity_type, entity_id, operation, payload } = item;
    const data = JSON.parse(payload);

    switch (operation) {
      case 'INSERT':
      case 'UPDATE':
        await this.supabase
          .from(entity_type)
          .upsert({ ...data, id: entity_id }, { onConflict: 'id' });
        break;
      case 'DELETE':
        await this.supabase
          .from(entity_type)
          .delete()
          .eq('id', entity_id);
        break;
    }
  }
}

// data/local/repositories/BaseRepository.ts
export abstract class BaseRepository<T> {
  constructor(
    protected db: SQLiteDatabase,
    protected tableName: string,
    protected syncService: SyncService
  ) {}

  async create(entity: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
    const id = crypto.randomUUID();
    const now = new Date();
    const fullEntity = {
      ...entity,
      id,
      createdAt: now,
      updatedAt: now,
    };

    await this.db.runAsync(
      `INSERT INTO ${this.tableName} (...) VALUES (...)`,
      [/* params */]
    );

    // Queue for sync
    await this.syncService.queueChange({
      entityType: this.tableName,
      entityId: id,
      operation: 'INSERT',
      payload: fullEntity,
    });

    return fullEntity;
  }
}
```

### Configuración de Supabase

```sql
-- Tabla en Supabase (debe espejar schema local)
CREATE TABLE transactions (
  id UUID PRIMARY KEY,
  amount DECIMAL NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category_id UUID NOT NULL,
  date TIMESTAMP NOT NULL,
  description TEXT,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id)
);

-- RLS policies
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions"
  ON transactions FOR UPDATE
  USING (auth.uid() = user_id);
```

## Dependencias

- `expo-sqlite` (storage local)
- `@supabase/supabase-js` (cloud sync)
- `expo-network` (detección de conectividad)
- `uuid` o `crypto.randomUUID()` (IDs únicos)

## Notas de implementación

- **Offline-first**: La app siempre escribe en SQLite primero, sync es asíncrono
- **UUIDs obligatorios**: No usar auto-increment para evitar conflictos
- **Soft deletes**: Usar `deleted_at` en vez de DELETE real para tracking
- **Background sync**: Usar AppState para detectar cuando la app vuelve a foreground
- **Retry logic**: Exponential backoff para errores de red
- **Conflict detection**: Opcional, pero útil para alerts al usuario

## Edge cases a manejar

1. **Usuario offline por mucho tiempo**: Cola de sync crece → limitar tamaño o alertar
2. **Mismo registro editado en 2 dispositivos**: Last-write-wins, pero documentar comportamiento
3. **Supabase down**: App sigue funcionando, sync se reintenta automáticamente
4. **Conflicto de schema**: Migraciones deben ser compatibles entre local y cloud

## Estado

**Propuesta** - Pendiente de implementación después del MVP de appFinanzasPersonales
