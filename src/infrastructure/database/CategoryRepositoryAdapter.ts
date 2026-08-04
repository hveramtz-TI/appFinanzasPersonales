import { CategoryRepositoryFactory } from '../../application/ports/CategoryRepositoryPort';
import { ICategoryRepository } from '../../domain/repositories/ICategoryRepository';
import { CategoryRepository } from '../../data/local/repositories/CategoryRepository';
import { getDatabase } from '../../data/local/database';

export class CategoryRepositoryAdapterFactory implements CategoryRepositoryFactory {
  async create(): Promise<ICategoryRepository> {
    const db = await getDatabase();
    return new CategoryRepository(db);
  }
}
