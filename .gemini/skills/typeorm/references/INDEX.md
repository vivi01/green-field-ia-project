# TypeORM Skill Index

Quick navigation for TypeORM database layer implementation in NestJS projects.

## 📚 Topics

| Topic | File | Focus |
|-------|------|-------|
| **Entity Design** | [orm-entities](./orm-entities.md) | Decorators, columns, primary keys, timestamps, indexes |
| **Relationships** | [orm-relationships](./orm-relationships.md) | One-to-one, one-to-many, many-to-many associations |
| **Repositories** | [orm-repositories](./orm-repositories.md) | Custom repository pattern, Query Builder, data access |
| **Migrations** | [orm-migrations](./orm-migrations.md) | Schema versioning, safe migrations, rollbacks |
| **Transactions** | [orm-transactions](./orm-transactions.md) | ACID compliance, QueryRunner, data consistency |
| **NestJS Integration** | [orm-nestjs-integration](./orm-nestjs-integration.md) | Module setup, DI, service layer configuration |
| **Data Source** | [orm-data-source](./orm-data-source.md) | Connection config, pools, SSL, health checks |
| **Best Practices** | [orm-best-practices](./orm-best-practices.md) | Patterns, anti-patterns, optimization strategies |

## 🎯 Quick Decisions

**When designing database features, refer to:**

- **Adding or modifying entities?** → [orm-entities](./orm-entities.md)
- **Working with relationships?** → [orm-relationships](./orm-relationships.md)
- **Implementing data access logic?** → [orm-repositories](./orm-repositories.md)
- **Need safe schema changes?** → [orm-migrations](./orm-migrations.md)
- **Handling multi-step operations?** → [orm-transactions](./orm-transactions.md)
- **Integrating with NestJS?** → [orm-nestjs-integration](./orm-nestjs-integration.md)
- **Configuring connections?** → [orm-data-source](./orm-data-source.md)
- **Optimizing queries or performance?** → [orm-best-practices](./orm-best-practices.md)

## 🔗 Related Skills & Instructions

- **NestJS Architecture:** `nestjs-best-practices` skill
- **Database Migrations Safety:** `.gemini/rules/typeorm-migrations.md`
- **NestJS Layer Separation:** `.gemini/rules/nestjs-layer-separation.md`
- **NestJS Entity Conventions:** `.gemini/rules/nestjs-entities.md`

## ✅ Key Principles

1. **Repository Pattern:** Always abstract database logic from services
2. **Migrations First:** Schema changes via versioned migrations, never synchronize in production
3. **Transactions:** Multi-step operations must be atomic
4. **Type Safety:** Full TypeScript support for entity metadata
5. **Relationship Clarity:** Define explicit join columns and cascade options
6. **Connection Pooling:** Configure pool size based on workload
7. **Error Propagation:** Let errors bubble to upper layers for centralized handling
