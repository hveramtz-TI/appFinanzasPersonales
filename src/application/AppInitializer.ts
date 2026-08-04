import { DatabaseConnectionFactory } from './ports/DatabasePort';
import { DatabaseSeedPort } from './ports/DatabaseSeedPort';
import { CategoryRepositoryFactory } from './ports/CategoryRepositoryPort';

export class AppInitializer {
  constructor(
    private dbFactory: DatabaseConnectionFactory,
    private seedPort: DatabaseSeedPort,
    private categoryRepoFactory: CategoryRepositoryFactory
  ) {}

  async initialize(): Promise<void> {
    // Inicializar base de datos (crea tablas)
    await this.dbFactory.getDatabase();
    
    // Seed de datos por defecto
    const categoryRepo = await this.categoryRepoFactory.create();
    await this.seedPort.seedDefaultCategories(categoryRepo);
  }
}
