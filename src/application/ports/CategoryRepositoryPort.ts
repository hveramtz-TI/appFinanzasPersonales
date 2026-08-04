import { ICategoryRepository } from '../../domain/repositories/ICategoryRepository';

export interface CategoryRepositoryFactory {
  create(): Promise<ICategoryRepository>;
}
