import { DatabaseSeedPort } from '../../application/ports/DatabaseSeedPort';
import { LoggerPort } from '../../application/ports/LoggerPort';
import { ICategoryRepository } from '../../domain/repositories/ICategoryRepository';
import { DEFAULT_CATEGORIES } from '../../data/constants/defaultCategories';

export class DatabaseSeedAdapter implements DatabaseSeedPort {
  constructor(private logger: LoggerPort) {}

  async seedDefaultCategories(categoryRepo: ICategoryRepository): Promise<void> {
    // Verificar si ya hay categorías
    const existing = await categoryRepo.getAll(true);
    if (existing.length > 0) {
      this.logger.info('Database already seeded, skipping...');
      return;
    }

    this.logger.info('Seeding database with default categories...');
    
    for (const category of DEFAULT_CATEGORIES) {
      await categoryRepo.create(category);
    }

    this.logger.info(`Seeded ${DEFAULT_CATEGORIES.length} categories`);
  }
}
