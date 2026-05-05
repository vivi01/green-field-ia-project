---
name: typeorm
description: "**DATABASE SKILL** — Master TypeORM entity mapping, repository patterns, database design, and ORM integration with NestJS. USE FOR: designing entities and relationships; implementing repository abstractions; planning features involving database schema, data persistence, or ORM queries; refactoring database logic for testability and separation of concerns; optimizing queries and transactions. DO NOT USE FOR: SQL optimization; MongoDB or non-relational; DevOps or infrastructure; frontend logic."
---

# TypeORM & NestJS Database Integration

Master TypeORM for building scalable, maintainable database layers in NestJS applications. Focuses on Data Mapper pattern, repository abstractions, and enterprise database practices.

## When to Apply This Skill

**Load this skill when:**

- Designing entities and relationships for database features
- Implementing custom repository abstractions (Repository Pattern)
- Planning features involving database schema design or data persistence
- Adding or modifying database relationships (one-to-one, one-to-many, many-to-many)
- Optimizing database queries, implementing caching, or refactoring ORM logic
- Writing migrations or database-related feature code
- Refactoring database logic for testability and separation of concerns (following `arch-use-repository-pattern` from nestjs-best-practices)
- Integrating TypeORM with NestJS modules, dependency injection, and services

## When NOT to Apply This Skill

**Skip this skill for:**

- Database-specific SQL optimization (use DB documentation)
- MongoDB or non-relational databases
- Infrastructure, DevOps, deployment, or database administration
- Frontend or business logic unrelated to data persistence
- Configuration-only tasks (.env files, connection strings)
- Third-party ORMs (Prisma, Sequelize, etc.)
- General TypeScript syntax or compiler settings

## Topics

Detailed guidance is organized by topic. Load specific sections as needed:

1. **[Entity Design](./references/orm-entities.md)** — Decorators, column types, primary keys, timestamps
2. **[Relationships](./references/orm-relationships.md)** — One-to-one, one-to-many, many-to-many patterns
3. **[Repository Pattern](./references/orm-repositories.md)** — Custom abstractions, query builders, testability
4. **[Migrations](./references/orm-migrations.md)** — Safe database schema changes, versioning
5. **[Transactions](./references/orm-transactions.md)** — ACID compliance, data consistency
6. **[NestJS Integration](./references/orm-nestjs-integration.md)** — Module setup, DI, service layer
7. **[Data Source](./references/orm-data-source.md)** — Connection configuration, pooling, production setup
8. **[Best Practices](./references/orm-best-practices.md)** — Patterns, anti-patterns, optimization strategies

See also the **[Index](./references/INDEX.md)** for quick navigation.
