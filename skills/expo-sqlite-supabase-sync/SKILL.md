---
name: expo-sqlite-supabase-sync
description: "Trigger: SQLite Supabase sync, offline-first, local database, cloud backup, sincronización. Implement offline-first sync between expo-sqlite and Supabase with conflict resolution, sync queue, and background sync."
license: Apache-2.0
metadata:
  author: "gentle-ai"
  version: "1.0"
---

# Expo SQLite + Supabase Sync

## Activation Contract

Implement offline-first sync when:
- Need local SQLite storage with cloud backup
- App must work offline with eventual consistency
- Require conflict resolution for multi-device sync
- Want background sync on app resume

## Hard Rules

- SQLite is source of truth, Supabase is backup
- Use UUIDs for primary keys (never auto-increment)
- Implement sync queue table for pending changes
- Use last-write-wins conflict resolution
- Sync on app state change (background → foreground)
- Implement retry logic with exponential backoff
- Never block UI on sync operations

## Decision Gates

| Need | Approach |
|------|----------|
| Simple backup | Sync all changes to Supabase, no conflict handling |
| Multi-device sync | Implement conflict detection + resolution |
| Large datasets | Batch sync with pagination |
| Real-time updates | Add Supabase realtime subscriptions |

## Execution Steps

1. Create sync_queue table:
   ```sql
   CREATE TABLE sync_queue (
     id TEXT PRIMARY KEY,
     entityType TEXT NOT NULL,
     entityId TEXT NOT NULL,
     operation TEXT NOT NULL,
     payload TEXT NOT NULL,
     retryCount INTEGER DEFAULT 0,
     createdAt INTEGER NOT NULL
   );
   ```

2. Create SyncQueueRepository for queue operations
3. Create RemoteSyncExecutor for Supabase API calls
4. Create SyncOrchestrator to coordinate sync process
5. Add AppState listener for background→foreground sync
6. Implement retry logic (max 3 retries)
7. Add error handling and logging

## Output Contract

- Sync queue table created
- Sync service implemented with 3-layer architecture
- Background sync on app resume
- Retry logic with max retries
- Error handling for network failures

## Example

```typescript
// infrastructure/database/DatabaseSeedAdapter.ts
export class DatabaseSeedAdapter implements DatabaseSeedPort {
  constructor(private logger: LoggerPort) {}

  async seedDefaultCategories(categoryRepo: ICategoryRepository): Promise<void> {
    const existing = await categoryRepo.getAll(true);
    if (existing.length > 0) {
      this.logger.info('Database already seeded, skipping...');
      return;
    }

    for (const category of DEFAULT_CATEGORIES) {
      await categoryRepo.create(category);
    }
  }
}

// Application layer uses ports, not concrete implementations
export class AppInitializer {
  constructor(
    private dbFactory: DatabaseConnectionFactory,
    private seedPort: DatabaseSeedPort,
    private categoryRepoFactory: CategoryRepositoryFactory
  ) {}

  async initialize(): Promise<void> {
    await this.dbFactory.getDatabase();
    const categoryRepo = await this.categoryRepoFactory.create();
    await this.seedPort.seedDefaultCategories(categoryRepo);
  }
}
```
