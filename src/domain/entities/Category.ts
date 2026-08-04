import { z } from 'zod';
import { TransactionType } from './Transaction';

export const CategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(50),
  icon: z.string(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i),
  type: TransactionType,
  parentId: z.string().uuid().nullable().default(null),
  order: z.number().int().default(0),
  isActive: z.boolean().default(true),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type Category = z.infer<typeof CategorySchema>;

export type CreateCategory = Omit<Category, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateCategory = Partial<CreateCategory>;
