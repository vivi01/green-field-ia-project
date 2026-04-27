---
title: Entity Rules
impact: HIGH
impactDescription: Keeps TypeORM entities explicit, stable, and safe for schema evolution
tags: typeorm, nestjs, entities, migrations
---

# Entity Rules

## Naming and Structure

- Always pass an explicit table name to `@Entity('table_name')` — do not rely on auto-generated names
- Use UUID as primary key: `@PrimaryGeneratedColumn('uuid')`
- Always include timestamp columns: `@CreateDateColumn()` and `@UpdateDateColumn()`

## Column Conventions

- Sensitive fields (passwords, tokens) must use `{ select: false }` to exclude from default queries
- Use `{ unique: true }` for naturally unique fields (email, slug)
- Define explicit column types when the default mapping is ambiguous

## Relationships

- Always define both sides of a relationship (e.g., `@OneToMany` + `@ManyToOne`)
- Prefer explicit relation loading in queries (`relations` or QueryBuilder) as the default strategy
- Use eager loading only for small, frequently required relations with predictable access patterns
- Use lazy loading only when explicitly justified, and monitor for N+1 query risk

## Schema Changes

- Never modify an entity without creating a corresponding migration
- Never use `synchronize: true` in production — only in early development if at all
- Generate migrations via TypeORM CLI, not by hand
