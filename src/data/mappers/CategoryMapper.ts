import { Category } from '../../domain/entities/Category';
import { EntityNotFoundError } from '../../domain/errors';

export interface CategoryRow {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: string;
  parentId: string | null;
  order: number;
  isActive: number;
  createdAt: number;
  updatedAt: number;
}

export class CategoryMapper {
  static toDatabase(category: Category): CategoryRow {
    return {
      id: category.id,
      name: category.name,
      icon: category.icon,
      color: category.color,
      type: category.type,
      parentId: category.parentId ?? null,
      order: category.order,
      isActive: category.isActive ? 1 : 0,
      createdAt: category.createdAt.getTime(),
      updatedAt: category.updatedAt.getTime(),
    };
  }

  static fromDatabase(row: CategoryRow): Category {
    return {
      id: row.id,
      name: row.name,
      icon: row.icon,
      color: row.color,
      type: row.type,
      parentId: row.parentId ?? null,
      order: row.order,
      isActive: row.isActive === 1,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    };
  }
}

export { EntityNotFoundError };
