import { Category, CreateCategory, UpdateCategory } from '../entities/Category';
import { TransactionType } from '../entities/Transaction';

export interface ICategoryRepository {
  getAll(includeInactive?: boolean): Promise<Category[]>;
  getById(id: string): Promise<Category | null>;
  getByType(type: TransactionType): Promise<Category[]>;
  create(category: CreateCategory): Promise<Category>;
  update(id: string, category: UpdateCategory): Promise<Category>;
  delete(id: string): Promise<void>;
  reorder(categoryIds: string[]): Promise<void>;
}
