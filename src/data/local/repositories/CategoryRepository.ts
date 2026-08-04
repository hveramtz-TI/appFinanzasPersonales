import * as SQLite from 'expo-sqlite';
import { Category, CreateCategory, UpdateCategory, CategorySchema } from '../../../domain/entities/Category';
import { TransactionType } from '../../../domain/entities/Transaction';
import { ICategoryRepository } from '../../../domain/repositories/ICategoryRepository';
import { EntityNotFoundError } from '../../../domain/errors';
import { CategoryMapper, CategoryRow } from '../../mappers/CategoryMapper';

export class CategoryRepository implements ICategoryRepository {
  constructor(private db: SQLite.SQLiteDatabase) {}

  async getAll(includeInactive = false): Promise<Category[]> {
    const query = includeInactive
      ? 'SELECT * FROM categories ORDER BY "order" ASC'
      : 'SELECT * FROM categories WHERE isActive = 1 ORDER BY "order" ASC';

    const rows = await this.db.getAllAsync(query) as CategoryRow[];
    return rows.map(row => CategoryMapper.fromDatabase(row));
  }

  async getById(id: string): Promise<Category | null> {
    const row = await this.db.getFirstAsync(
      'SELECT * FROM categories WHERE id = ?',
      id
    ) as CategoryRow | null;
    return row ? CategoryMapper.fromDatabase(row) : null;
  }

  async getByType(type: TransactionType): Promise<Category[]> {
    const rows = await this.db.getAllAsync(
      'SELECT * FROM categories WHERE type = ? AND isActive = 1 ORDER BY "order" ASC',
      type
    ) as CategoryRow[];
    return rows.map(row => CategoryMapper.fromDatabase(row));
  }

  async create(category: CreateCategory): Promise<Category> {
    const id = crypto.randomUUID();
    const now = new Date();
    const fullCategory = CategorySchema.parse({
      ...category,
      id,
      createdAt: now,
      updatedAt: now,
    });

    const dbData = CategoryMapper.toDatabase(fullCategory);

    await this.db.runAsync(
      `INSERT INTO categories (id, name, icon, color, type, parentId, "order", isActive, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        dbData.id,
        dbData.name,
        dbData.icon,
        dbData.color,
        dbData.type,
        dbData.parentId,
        dbData.order,
        dbData.isActive,
        dbData.createdAt,
        dbData.updatedAt,
      ]
    );

    return fullCategory;
  }

  async update(id: string, category: UpdateCategory): Promise<Category> {
    const existing = await this.getById(id);
    if (!existing) {
      throw new EntityNotFoundError('Category', id);
    }

    const updated = {
      ...existing,
      ...category,
      updatedAt: new Date(),
    };

    const dbData = CategoryMapper.toDatabase(updated);

    await this.db.runAsync(
      `UPDATE categories SET
        name = ?, icon = ?, color = ?, type = ?, parentId = ?,
        "order" = ?, isActive = ?, updatedAt = ?
       WHERE id = ?`,
      [
        dbData.name,
        dbData.icon,
        dbData.color,
        dbData.type,
        dbData.parentId,
        dbData.order,
        dbData.isActive,
        dbData.updatedAt,
        id,
      ]
    );

    return updated;
  }

  async delete(id: string): Promise<void> {
    await this.db.runAsync('DELETE FROM categories WHERE id = ?', id);
  }

  async reorder(categoryIds: string[]): Promise<void> {
    const now = new Date().getTime();
    for (let i = 0; i < categoryIds.length; i++) {
      await this.db.runAsync(
        'UPDATE categories SET "order" = ?, updatedAt = ? WHERE id = ?',
        [i, now, categoryIds[i]]
      );
    }
  }
}
