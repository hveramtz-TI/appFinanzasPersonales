import { CreateCategory } from '../../domain/entities/Category';

const expense = (
  name: string,
  icon: string,
  color: string,
  order: number
): CreateCategory => ({
  name,
  icon,
  color,
  type: 'expense',
  parentId: null,
  order,
  isActive: true,
});

const income = (
  name: string,
  icon: string,
  color: string,
  order: number
): CreateCategory => ({
  name,
  icon,
  color,
  type: 'income',
  parentId: null,
  order,
  isActive: true,
});

export const DEFAULT_CATEGORIES: CreateCategory[] = [
  // Gastos
  expense('Comida', '🍔', '#FF5722', 0),
  expense('Transporte', '🚗', '#2196F3', 1),
  expense('Entretenimiento', '🎬', '#9C27B0', 2),
  expense('Salud', '💊', '#4CAF50', 3),
  expense('Educación', '📚', '#FF9800', 4),
  expense('Ropa', '👕', '#E91E63', 5),
  expense('Hogar', '🏠', '#795548', 6),
  expense('Servicios', '💡', '#607D8B', 7),
  expense('Otros', '📦', '#9E9E9E', 8),
  
  // Ingresos
  income('Salario', '💰', '#4CAF50', 0),
  income('Freelance', '💻', '#2196F3', 1),
  income('Inversiones', '📈', '#FF9800', 2),
  income('Otros ingresos', '💵', '#9E9E9E', 3),
];
