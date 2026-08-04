---
name: expo-clean-architecture-scaffold
description: "Trigger: Expo project, Clean Architecture, feature-first, scaffold, estructura inicial. Create Expo project with feature-first Clean Architecture structure, domain/data/presentation layers, and TypeScript configuration."
license: Apache-2.0
metadata:
  author: "gentle-ai"
  version: "1.0"
---

# Expo Clean Architecture Scaffold

## Activation Contract

Create a new Expo project with feature-first Clean Architecture when:
- Starting a new Expo/React Native project
- Need scalable architecture with clear layer separation
- Want TypeScript + path aliases configured
- Require domain/data/presentation layer structure

## Hard Rules

- Use feature-first structure: `modules/{feature}/` contains components, hooks, screens
- Domain layer has ZERO framework dependencies (pure TypeScript)
- Data layer implements repository interfaces from domain
- Presentation layer uses hooks to access domain use cases
- All layers use TypeScript strict mode
- Configure path aliases for clean imports

## Execution Steps

1. Initialize Expo project with TypeScript template
2. Create folder structure:
   ```
   src/
   ├── domain/
   │   ├── entities/
   │   ├── repositories/
   │   └── usecases/
   ├── data/
   │   ├── local/
   │   ├── remote/
   │   ├── sync/
   │   └── mappers/
   ├── shared/
   │   ├── components/
   │   ├── hooks/
   │   ├── theme/
   │   ├── utils/
   │   └── constants/
   ├── modules/
   │   └── {feature}/
   │       ├── components/
   │       ├── hooks/
   │       └── screens/
   └── navigation/
   ```
3. Configure tsconfig.json with path aliases
4. Create base entities with Zod validation
5. Create repository interfaces in domain
6. Implement repositories in data layer
7. Create use cases that orchestrate business logic

## Output Contract

- Complete Expo project with TypeScript
- Feature-first folder structure
- Path aliases configured
- Base domain entities with validation
- Repository interfaces defined
- Sample use case implemented

## Example

```typescript
// domain/entities/Transaction.ts
import { z } from 'zod';

export const TransactionSchema = z.object({
  id: z.string().uuid(),
  amount: z.number().positive(),
  type: z.enum(['income', 'expense']),
  categoryId: z.string().uuid(),
  date: z.coerce.date(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

// domain/repositories/ITransactionRepository.ts
export interface ITransactionRepository {
  getAll(): Promise<Transaction[]>;
  create(data: CreateTransaction): Promise<Transaction>;
  update(id: string, data: UpdateTransaction): Promise<Transaction>;
  delete(id: string): Promise<void>;
}

// data/local/repositories/TransactionRepository.ts
export class TransactionRepository implements ITransactionRepository {
  constructor(private db: SQLiteDatabase) {}
  
  async getAll(): Promise<Transaction[]> {
    const rows = await this.db.getAllAsync('SELECT * FROM transactions');
    return rows.map(row => TransactionMapper.fromDatabase(row));
  }
}
```
