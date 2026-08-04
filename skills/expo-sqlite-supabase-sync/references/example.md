# Example

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
