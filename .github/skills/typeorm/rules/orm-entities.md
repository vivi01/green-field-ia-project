# orm-entities — Entity Design & Decorators

Master TypeORM entity definitions, decorators, column types, and primary key strategies.

## Core Principles

- Entities represent database tables
- Use TypeScript decorators for metadata
- Support inheritance and computed columns
- Enable type-safe database access

## TypeScript Configuration

Required settings in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "strict": true,
    "target": "ES2020",
    "module": "commonjs",
    "moduleResolution": "node"
  }
}
```

## Basic Entity Structure

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  VersionColumn,
  Index,
} from "typeorm";

@Entity("users")
@Index(["email"])
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 255, unique: true })
  email: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  name: string | null;

  @Column({ type: "boolean", default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;

  @VersionColumn()
  version: number;
}
```

## Primary Key Strategies

### Auto-Increment (Default)

```typescript
@PrimaryGeneratedColumn()
id: number;
```

### UUID

```typescript
@PrimaryGeneratedColumn("uuid")
id: string;
```

### Custom Primary Key

```typescript
@PrimaryColumn()
id: string;
```

### Composite Primary Key

```typescript
@Entity()
export class OrderItem {
  @PrimaryColumn()
  orderId: number;

  @PrimaryColumn()
  productId: number;
}
```

## Column Decorators & Types

```typescript
@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  // String columns
  @Column({ type: "varchar", length: 255 })
  name: string;

  @Column({ type: "text", nullable: true })
  description: string | null;

  // Numeric columns
  @Column({ type: "decimal", precision: 10, scale: 2 })
  price: number;

  @Column({ type: "int", default: 0 })
  stock: number;

  // Boolean
  @Column({ type: "boolean", default: true })
  isAvailable: boolean;

  // JSON (PostgreSQL JSONB)
  @Column({ type: "jsonb", nullable: true })
  metadata: Record<string, any> | null;

  // Enum
  @Column({
    type: "enum",
    enum: ["active", "inactive", "pending"],
    default: "pending",
  })
  status: "active" | "inactive" | "pending";

  // Timestamp columns
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null; // Soft delete marker

  // Version column for optimistic locking
  @VersionColumn()
  version: number;

  // Computed/Generated columns
  @Column({ generated: "STORED", generatedType: "STORED", asExpression: "first_name || ' ' || last_name" })
  fullName: string;
}
```

## Indexes & Constraints

```typescript
@Entity("users")
@Index(["email"]) // Single column
@Index(["firstName", "lastName"]) // Composite
@Unique(["email"]) // Unique constraint
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;
}
```

## Column Options Reference

| Option | Type | Description |
|--------|------|-------------|
| `type` | string | Database column type |
| `length` | number | String length (varchar) |
| `precision` | number | Decimal precision |
| `scale` | number | Decimal scale |
| `nullable` | boolean | Allow NULL values |
| `default` | any | Default value |
| `unique` | boolean | Unique constraint |
| `primary` | boolean | Primary key |
| `generated` | "increment" \| "uuid" | Auto-generation strategy |
| `array` | boolean | PostgreSQL array type |
| `enum` | Array | Enum values |
