# Skill Propuesta: expo-finance-domain-entities

## Descripción

Entidades TypeScript + interfaces de repositorios para apps de finanzas personales, incluyendo Transaction, Category, Budget, Reminder, Investment, con validación Zod y tipos fuertemente tipados.

## Cuándo usar

- Apps de finanzas personales o expense tracking
- Cuando se necesita un modelo de dominio sólido desde el inicio
- Para proyectos que requieren validación de datos financieros
- Cuando se busca consistencia en la estructura de datos entre local y remoto

## Qué contendría

### Entidades principales

1. **Transaction**
   - Ingresos y gastos
   - Monto, fecha, categoría, descripción
   - Etiquetas (tags) para clasificación adicional

2. **Category**
   - Categorías de gastos/ingresos
   - Icono, color, tipo (income/expense)
   - Jerarquía (categorías padre/hijo)

3. **Budget**
   - Presupuestos mensuales por categoría
   - Límite, período, alerta threshold

4. **Reminder**
   - Recordatorios de pagos recurrentes
   - Frecuencia (diario, semanal, mensual, anual)
   - Próxima fecha, monto, beneficiario

5. **Investment**
   - Tipos: Depósito a Plazo (DP), Fondo Mutuo (FM), Acciones, Crypto
   - Monto invertido, valor actual, rendimiento
   - Fecha de compra, vencimiento (si aplica)

6. **Account**
   - Cuentas (efectivo, banco, tarjeta)
   - Balance actual
   - Tipo de cuenta

### Código de ejemplo

```typescript
// domain/entities/Transaction.ts
import { z } from 'zod';

export const TransactionType = z.enum(['income', 'expense']);
export type TransactionType = z.infer<typeof TransactionType>;

export const TransactionSchema = z.object({
  id: z.string().uuid(),
  amount: z.number().positive(),
  type: TransactionType,
  categoryId: z.string().uuid(),
  accountId: z.string().uuid().optional(),
  date: z.coerce.date(),
  description: z.string().max(500).optional(),
  tags: z.array(z.string()).default([]),
  notes: z.string().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable().default(null),
});

export type Transaction = z.infer<typeof TransactionSchema>;

export type CreateTransaction = Omit<Transaction, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>;
export type UpdateTransaction = Partial<CreateTransaction>;

// domain/entities/Category.ts
export const CategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(50),
  icon: z.string(), // emoji o nombre de icono
  color: z.string().regex(/^#[0-9A-F]{6}$/i), // hex color
  type: TransactionType,
  parentId: z.string().uuid().nullable().default(null),
  order: z.number().int().default(0),
  isActive: z.boolean().default(true),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type Category = z.infer<typeof CategorySchema>;

// domain/entities/Budget.ts
export const BudgetSchema = z.object({
  id: z.string().uuid(),
  categoryId: z.string().uuid(),
  amount: z.number().positive(),
  period: z.enum(['weekly', 'monthly', 'yearly']),
  alertThreshold: z.number().min(0).max(100).default(80), // percentage
  startDate: z.coerce.date(),
  endDate: z.coerce.date().nullable().default(null),
  isActive: z.boolean().default(true),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type Budget = z.infer<typeof BudgetSchema>;

// domain/entities/Reminder.ts
export const ReminderFrequency = z.enum(['daily', 'weekly', 'monthly', 'yearly', 'once']);
export type ReminderFrequency = z.infer<typeof ReminderFrequency>;

export const ReminderSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(100),
  amount: z.number().positive(),
  frequency: ReminderFrequency,
  nextDate: z.coerce.date(),
  categoryId: z.string().uuid().optional(),
  payee: z.string().max(100).optional(), // quien recibe el pago
  notes: z.string().optional(),
  notificationEnabled: z.boolean().default(true),
  notificationTime: z.string().regex(/^\d{2}:\d{2}$/).default('09:00'), // HH:mm
  isActive: z.boolean().default(true),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type Reminder = z.infer<typeof ReminderSchema>;

// domain/entities/Investment.ts
export const InvestmentType = z.enum([
  'deposito_plazo', // DP
  'fondo_mutuo', // FM
  'acciones',
  'crypto',
  'bonos',
  'otro',
]);
export type InvestmentType = z.infer<typeof InvestmentType>;

export const InvestmentSchema = z.object({
  id: z.string().uuid(),
  type: InvestmentType,
  name: z.string().min(1).max(100),
  amount: z.number().positive(), // monto invertido
  currentValue: z.number(), // valor actual
  purchaseDate: z.coerce.date(),
  maturityDate: z.coerce.date().nullable().default(null), // fecha de vencimiento
  interestRate: z.number().min(0).max(100).optional(), // tasa de interés anual %
  notes: z.string().optional(),
  isActive: z.boolean().default(true),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type Investment = z.infer<typeof InvestmentSchema>;

// domain/entities/Account.ts
export const AccountType = z.enum(['cash', 'checking', 'savings', 'credit_card', 'investment', 'other']);
export type AccountType = z.infer<typeof AccountType>;

export const AccountSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(50),
  type: AccountType,
  balance: z.number(),
  currency: z.string().length(3).default('CLP'), // ISO 4217
  icon: z.string().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  isActive: z.boolean().default(true),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type Account = z.infer<typeof AccountSchema>;

// domain/repositories/ITransactionRepository.ts
export interface ITransactionRepository {
  getAll(filters?: TransactionFilters): Promise<Transaction[]>;
  getById(id: string): Promise<Transaction | null>;
  create(transaction: CreateTransaction): Promise<Transaction>;
  update(id: string, transaction: UpdateTransaction): Promise<Transaction>;
  delete(id: string): Promise<void>; // soft delete
  
  // Métodos específicos de dominio
  getByCategory(categoryId: string, dateRange?: DateRange): Promise<Transaction[]>;
  getByDateRange(dateRange: DateRange): Promise<Transaction[]>;
  getMonthlyTotals(year: number): Promise<MonthlyTotal[]>;
  getCategoryBreakdown(dateRange: DateRange): Promise<CategoryBreakdown[]>;
}

export interface TransactionFilters {
  type?: TransactionType;
  categoryId?: string;
  accountId?: string;
  dateRange?: DateRange;
  tags?: string[];
  search?: string;
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface MonthlyTotal {
  month: number;
  year: number;
  income: number;
  expense: number;
  balance: number;
}

export interface CategoryBreakdown {
  categoryId: string;
  categoryName: string;
  amount: number;
  percentage: number;
  transactionCount: number;
}

// domain/repositories/ICategoryRepository.ts
export interface ICategoryRepository {
  getAll(includeInactive?: boolean): Promise<Category[]>;
  getById(id: string): Promise<Category | null>;
  getByType(type: TransactionType): Promise<Category[]>;
  create(category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<Category>;
  update(id: string, category: Partial<Category>): Promise<Category>;
  delete(id: string): Promise<void>;
  reorder(categoryIds: string[]): Promise<void>;
}

// domain/repositories/IReminderRepository.ts
export interface IReminderRepository {
  getAll(includeInactive?: boolean): Promise<Reminder[]>;
  getById(id: string): Promise<Reminder | null>;
  getUpcoming(days: number): Promise<Reminder[]>;
  create(reminder: Omit<Reminder, 'id' | 'createdAt' | 'updatedAt'>): Promise<Reminder>;
  update(id: string, reminder: Partial<Reminder>): Promise<Reminder>;
  delete(id: string): Promise<void>;
  markAsPaid(id: string): Promise<Reminder>; // actualiza nextDate según frecuencia
}

// domain/repositories/IInvestmentRepository.ts
export interface IInvestmentRepository {
  getAll(includeInactive?: boolean): Promise<Investment[]>;
  getById(id: string): Promise<Investment | null>;
  create(investment: Omit<Investment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Investment>;
  update(id: string, investment: Partial<Investment>): Promise<Investment>;
  delete(id: string): Promise<void>;
  
  // Métodos específicos
  getTotalInvested(): Promise<number>;
  getCurrentTotalValue(): Promise<number>;
  getTotalReturn(): Promise<{ amount: number; percentage: number }>;
  getByType(type: InvestmentType): Promise<Investment[]>;
}

// domain/usecases/GetDashboardData.ts
export class GetDashboardData {
  constructor(
    private transactionRepo: ITransactionRepository,
    private categoryRepo: ICategoryRepository
  ) {}

  async execute(dateRange: DateRange): Promise<DashboardData> {
    const [transactions, categories] = await Promise.all([
      this.transactionRepo.getByDateRange(dateRange),
      this.categoryRepo.getAll(),
    ]);

    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const categoryBreakdown = this.calculateCategoryBreakdown(
      transactions.filter(t => t.type === 'expense'),
      categories
    );

    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      categoryBreakdown,
      transactionCount: transactions.length,
    };
  }

  private calculateCategoryBreakdown(
    expenses: Transaction[],
    categories: Category[]
  ): CategoryBreakdown[] {
    const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);
    const grouped = new Map<string, number>();

    for (const transaction of expenses) {
      const current = grouped.get(transaction.categoryId) || 0;
      grouped.set(transaction.categoryId, current + transaction.amount);
    }

    return Array.from(grouped.entries()).map(([categoryId, amount]) => {
      const category = categories.find(c => c.id === categoryId)!;
      return {
        categoryId,
        categoryName: category.name,
        amount,
        percentage: (amount / totalExpense) * 100,
        transactionCount: expenses.filter(t => t.categoryId === categoryId).length,
      };
    });
  }
}

export interface DashboardData {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  categoryBreakdown: CategoryBreakdown[];
  transactionCount: number;
}
```

### Validación y sanitización

```typescript
// domain/validators/TransactionValidator.ts
import { TransactionSchema, CreateTransaction } from '../entities/Transaction';

export class TransactionValidator {
  static validateCreate(data: unknown): CreateTransaction {
    // Parse y validación con Zod
    const parsed = TransactionSchema.partial().parse(data);
    
    // Validaciones de negocio adicionales
    if (parsed.amount && parsed.amount > 1_000_000_000) {
      throw new Error('Transaction amount exceeds maximum allowed');
    }

    return parsed as CreateTransaction;
  }

  static sanitizeDescription(description?: string): string | undefined {
    if (!description) return undefined;
    return description.trim().slice(0, 500);
  }
}
```

## Dependencias

- `zod` (validación de schemas)
- TypeScript (tipado fuerte)

## Notas de implementación

- **Zod para validación**: Runtime validation + TypeScript types automáticos
- **Soft deletes**: Usar `deletedAt` en vez de DELETE real
- **UUIDs**: Todos los IDs son UUIDs para compatibilidad con sync
- **Fechas**: Usar `z.coerce.date()` para aceptar strings o Dates
- **Monedas**: ISO 4217 (CLP, USD, EUR, etc.)
- **Porcentajes**: 0-100, no 0-1
- **Optional vs Nullable**: Distinguir entre "no proporcionado" y "explícitamente null"

## Edge cases a manejar

1. **Transacciones en moneda extranjera**: Considerar tipo de cambio (futuro)
2. **Categorías eliminadas**: No borrar si tiene transacciones asociadas
3. **Presupuestos excedidos**: Calcular alertas en use cases, no en entidades
4. **Recordatorios pasados**: Marcar como "vencidos" si nextDate < hoy
5. **Inversiones con rendimiento negativo**: currentValue puede ser < amount

## Ventajas de este enfoque

- **Type-safe**: TypeScript + Zod = seguridad en compile-time y runtime
- **Separación de responsabilidades**: Entidades puras, repositorios como contratos
- **Testable**: Casos de uso aislados, fáciles de testear
- **Extensible**: Fácil agregar nuevas entidades sin romper existentes
- **Consistente**: Mismos patrones en todas las entidades

## Estado

**Propuesta** - Pendiente de implementación después del MVP de appFinanzasPersonales
