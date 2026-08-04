import { CategorySchema } from '@domain/entities/Category';

describe('Category Entity', () => {
  it('should create a valid category', () => {
    const category = CategorySchema.parse({
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Comida',
      icon: '🍔',
      color: '#FF5722',
      type: 'expense',
      parentId: null,
      order: 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    expect(category.name).toBe('Comida');
    expect(category.color).toBe('#FF5722');
  });

  it('should reject invalid color format', () => {
    expect(() => {
      CategorySchema.parse({
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Comida',
        icon: '🍔',
        color: 'invalid-color',
        type: 'expense',
        parentId: null,
        order: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }).toThrow();
  });
});
