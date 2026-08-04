---
name: expo-finance-domain-entities
description: "Trigger: finance domain, entities, transaction, category, budget, reminder, investment, entidades financieras. Create TypeScript domain entities with Zod validation for personal finance apps."
license: Apache-2.0
metadata:
  author: "gentle-ai"
  version: "1.0"
---

# Expo Finance Domain Entities

## Activation Contract

Create finance domain entities when:
- Building personal finance app
- Need transaction tracking (income/expense)
- Require category management
- Want budget tracking
- Need recurring payment reminders
- Require investment tracking (DP, FM, stocks)

## Hard Rules

- Use Zod for runtime validation + TypeScript types
- Define entity interfaces with all required fields
- Use UUID for primary keys
- Include createdAt, updatedAt, deletedAt timestamps
- Implement soft deletes (deletedAt field)
- Create custom error classes for domain validation
- Separate entity definition from repository interface

## Execution Steps

1. Create Transaction entity with Zod schema
2. Create Category entity with hierarchy support
3. Create Reminder entity with frequency types
4. Create repository interfaces for each entity
5. Create custom error classes (InvalidAmountError, etc.)
6. Create use cases for business logic
7. Add unit tests for entity validation

## Output Contract

- Transaction, Category, Reminder entities with Zod validation
- Repository interfaces for each entity
- Custom error classes for domain validation
- Use cases for CRUD operations
- Unit tests for entity validation

## References

- `references/example.md` — complete code example.
- `references/entity-fields.md` — per-entity field reference.
