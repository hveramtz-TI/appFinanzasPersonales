# Skill Propuesta: expo-clean-architecture-scaffold

## Descripción

Genera la estructura completa de Clean Architecture para proyectos Expo/React Native, incluyendo carpetas domain/data/presentation con boilerplate de entidades, interfaces de repositorios, y configuración de providers.

## Cuándo usar

- Al iniciar un nuevo proyecto Expo que requiera arquitectura escalable
- Cuando se necesita separación clara de responsabilidades
- Para proyectos que crecerán con múltiples features y módulos

## Qué contendría

### Estructura de carpetas generada

```
src/
├── domain/
│   ├── entities/          # Entidades de negocio puras (TypeScript)
│   ├── usecases/          # Casos de uso (lógica de negocio)
│   └── repositories/      # Interfaces de repositorios (contratos)
├── data/
│   ├── local/             # Implementaciones SQLite
│   │   ├── database.ts
│   │   ├── migrations/
│   │   └── repositories/
│   ├── remote/            # Implementaciones Supabase/API
│   │   ├── client.ts
│   │   └── repositories/
│   └── mappers/           # DTOs ↔ Entities
├── presentation/
│   ├── screens/           # Pantallas React
│   ├── components/        # Componentes reutilizables
│   ├── hooks/             # Custom hooks
│   └── navigation/        # Configuración de navegación
└── shared/
    ├── theme/             # Sistema de temas
    ├── types/             # Tipos compartidos
    └── utils/             # Utilidades
```

### Archivos boilerplate

- `domain/entities/Transaction.ts` - Entidad base de transacción
- `domain/repositories/ITransactionRepository.ts` - Interfaz de repositorio
- `data/local/database.ts` - Configuración expo-sqlite con migraciones
- `data/local/repositories/TransactionRepository.ts` - Implementación SQLite
- `presentation/hooks/useTransactions.ts` - Hook de ejemplo

### Configuración de dependencias

- Inyección de dependencias simple (sin librerías externas)
- Factory functions para crear repositorios
- Context providers para inyección en React

## Ejemplos de uso

```typescript
// domain/entities/Transaction.ts
export interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  categoryId: string;
  date: Date;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

// domain/repositories/ITransactionRepository.ts
export interface ITransactionRepository {
  getAll(): Promise<Transaction[]>;
  getById(id: string): Promise<Transaction | null>;
  create(transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<Transaction>;
  update(id: string, transaction: Partial<Transaction>): Promise<Transaction>;
  delete(id: string): Promise<void>;
}

// data/local/repositories/TransactionRepository.ts
export class TransactionRepository implements ITransactionRepository {
  constructor(private db: SQLiteDatabase) {}
  
  async getAll(): Promise<Transaction[]> {
    const rows = await this.db.getAllAsync('SELECT * FROM transactions');
    return rows.map(mapRowToEntity);
  }
  // ... resto de métodos
}
```

## Dependencias

- `expo-sqlite` (para repositorios locales)
- `@supabase/supabase-js` (para repositorios remotos)
- `uuid` o `crypto.randomUUID()` (para IDs)

## Notas de implementación

- Las entidades de dominio NO deben tener dependencias externas
- Los repositorios implementan interfaces definidas en el dominio
- Los mappers convierten entre DTOs (data layer) y entidades (domain layer)
- Los hooks de presentation usan los casos de uso, no los repositorios directamente

## Estado

**Propuesta** - Pendiente de implementación después del MVP de appFinanzasPersonales
