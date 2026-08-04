import { ICategoryRepository } from '../../domain/repositories/ICategoryRepository';

export interface DatabaseSeedPort {
  seedDefaultCategories(categoryRepo: ICategoryRepository): Promise<void>;
}
