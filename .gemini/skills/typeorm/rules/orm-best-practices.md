# Best Practices: Patterns, Anti-patterns & Optimization

## Core Principles

Apply TypeORM in NestJS following these proven patterns:

- **Migrations First**: Never synchronize schema in production. Use migrations for controlled schema evolution.
- **Relations Management**: Choose explicit loading (recommended) over eager/lazy to control query behavior.
- **Performance**: Use indexes and avoid N+1 queries through proper eager loading.
- **Data Integrity**: Leverage cascade operations and database constraints for consistency.
- **Naming**: Follow snake_case in database, PascalCase in TypeScript via naming strategies.

## When to Apply

- **Designing new entities or features** with complex relationships
- **Optimizing slow queries** or investigating N+1 problems
- **Planning production deployments** with schema changes
- **Refactoring lazy/eager loading** to improve performance

## Migration Safety

### ✅ Production-Ready Pattern

```typescript
// data-source.ts
export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: +process.env.DB_PORT,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: ["src/**/*.entity.ts"],
  migrations: ["src/database/migrations/*.ts"],
  synchronize: false, // ← Always false in production
  migrationsRun: true, // Auto-run on startup (optional)
});

// Run migrations before server starts
if (process.env.NODE_ENV === "production") {
  await AppDataSource.runMigrations();
}
```

### ❌ Anti-pattern

```typescript
synchronize: true, // NEVER in production - loses data
```

## Relation Loading Strategies

### Eager Loading (Decorator-Level)

Automatically loads relations on every query. Use sparingly — can hide N+1 issues.

```typescript
@Entity()
export class User {
  @Column()
  name: string;

  @OneToMany(() => Post, (post) => post.author, { eager: true })
  posts: Post[];
}

// posts loaded automatically on find()
const user = await userRepository.findOne({ where: { id: 1 } });
console.log(user.posts); // already available
```

**Trade-off:** Convenience vs hidden performance cost.

### Lazy Loading (Promise-Based)

Relations return Promises, requiring explicit await. Useful when relations may not always be needed.

```typescript
@Entity()
export class User {
  @Column()
  name: string;

  @OneToMany(() => Post, (post) => post.author)
  posts: Promise<Post[]>; // note: Promise type
}

// Must explicitly await
const user = await userRepository.findOne({ where: { id: 1 } });
const userPosts = await user.posts; // Single query for each user access
```

**Risk:** Can still cause N+1 if not carefully managed.

### Explicit Loading (Recommended)

Query method specifies exactly which relations to load. Most control, most transparent.

```typescript
// Load user with posts in a single query
const user = await userRepository.findOne({
  where: { id: 1 },
  relations: ["posts", "profile"],
});

// Or with QueryBuilder for more control
const user = await userRepository
  .createQueryBuilder("user")
  .leftJoinAndSelect("user.posts", "posts")
  .leftJoinAndSelect("user.profile", "profile")
  .where("user.id = :id", { id: 1 })
  .getOne();
```

**Benefit:** Explicit, testable, debuggable. See exactly which queries execute.

## Avoiding N+1 Queries

### ❌ Problem: N+1 Query

```typescript
// 1 query to find all users
const users = await userRepository.find();

// Then N queries (one per user) — accessing unprepared relation
for (const user of users) {
  const posts = await user.posts; // ← Triggers separate query per user
}

// Total queries: 1 + N
```

### ✅ Solution: Eager Load Relations

```typescript
// Single query with JOIN
const users = await userRepository.find({
  relations: ["posts"],
});

// No additional queries — posts already loaded
for (const user of users) {
  console.log(user.posts);
}

// Total queries: 1
```

### ✅ Alternative: QueryBuilder

```typescript
const users = await userRepository
  .createQueryBuilder("user")
  .leftJoinAndSelect("user.posts", "posts")
  .getMany();

// Total queries: 1
```

## Database Indexing

### Creating Indexes

Use `@Index()` decorator to accelerate frequent queries:

```typescript
@Entity()
@Index(["email"]) // Single column
@Index(["firstName", "lastName"]) // Composite
export class User {
  @Column()
  @Index() // Inline syntax
  email: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  createdAt: Date;
}
```

### When to Index

```typescript
// ✅ Good candidates
- Primary foreign key lookups: @OneToMany() relations
- Search filters: `where email = ?`
- Sort columns: `ORDER BY createdAt`
- Composite indexes: Common filter combinations

// ❌ Avoid excessive indexes
- High-cardinality low-frequency queries
- Write-heavy tables (each index = write cost)
- Very small tables (full table scan faster)
```

### Migration with Index

```typescript
// src/database/migrations/CreateUser.ts
import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";

export class CreateUser1672531200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "user",
        columns: [
          { name: "id", type: "int", isPrimary: true },
          { name: "email", type: "varchar", isUnique: true },
          { name: "firstName", type: "varchar" },
          { name: "lastName", type: "varchar" },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      "user",
      new TableIndex({
        name: "IDX_user_email",
        columnNames: ["email"],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex("user", "IDX_user_email");
    await queryRunner.dropTable("user");
  }
}
```

## Cascade Operations

Cascade propagates parent changes to related records (save, update, remove).

### Define Cascade

```typescript
@Entity()
export class User {
  @Column()
  name: string;

  @OneToMany(() => Post, (post) => post.author, {
    cascade: true, // Save/update/remove cascades
    onDelete: "CASCADE", // Database-level cascade
  })
  posts: Post[];
}
```

### Behavior

```typescript
// Save user → auto-saves related posts
const user = new User();
user.name = "Alice";
user.posts = [new Post(), new Post()];
await userRepository.save(user); // All posts saved

// Remove user → auto-removes related posts
await userRepository.remove(user);
```

### ⚠️ Trade-offs

- **Pro:** Automatic consistency, less boilerplate
- **Con:** Can hide expensive operations (deleting 10K posts silently)
- **Recommendation:** Explicit cascade with logging/auditing in service layer

## Naming Strategies

Bridge PascalCase TypeScript with snake_case database columns:

### Custom Strategy

```typescript
// src/common/snake-naming.strategy.ts
import { DefaultNamingStrategy, NamingStrategyInterface } from "typeorm";
import { snakeCase } from "typeorm/util/StringUtils";

export class SnakeNamingStrategy extends DefaultNamingStrategy implements NamingStrategyInterface {
  tableName(targetName: string, userSpecifiedName?: string): string {
    return userSpecifiedName ? userSpecifiedName : snakeCase(targetName);
  }

  columnName(
    propertyName: string,
    customName: string | undefined,
    embeddedPrefixes: string[],
  ): string {
    const name = customName || snakeCase(propertyName);
    return embeddedPrefixes.length ? snakeCase(embeddedPrefixes.join("_")) + "_" + name : name;
  }

  relationName(propertyName: string): string {
    return snakeCase(propertyName);
  }

  primaryKeyName(classNameOrTable: string, propertyName: string): string {
    return "id";
  }
}
```

### Apply in Data Source

```typescript
// data-source.ts
export const AppDataSource = new DataSource({
  type: "postgres",
  // ... connection details
  namingStrategy: new SnakeNamingStrategy(),
});
```

### Result

```typescript
// TypeScript
@Entity()
export class UserProfile {
  @Column()
  firstName: string;

  @Column()
  lastName: string;
}

// Database
CREATE TABLE user_profile (
  id INT PRIMARY KEY,
  first_name VARCHAR(255),
  last_name VARCHAR(255)
);
```

## Query Performance Debugging

### Logging Queries

```typescript
// data-source.ts
export const AppDataSource = new DataSource({
  // ... config
  logging: process.env.NODE_ENV === "development",
  logger: "file", // Logs to ormlogs.log
  maxQueryExecutionTime: 1000, // Warn if query > 1s
});
```

### Inspect Query Plan

```typescript
// PostgreSQL example
const result = await queryRunner.query(`
  EXPLAIN ANALYZE
  SELECT u.* FROM "user" u
  LEFT JOIN "post" p ON u.id = p.author_id
  WHERE u.email = $1
`, ['user@example.com']);
```

## References

- See [Entity Design](./orm-entities.md) for decorator details
- See [Relationships](./orm-relationships.md) for relation patterns
- See [Repository Pattern](./orm-repositories.md) for query abstraction
- See [Migrations](./orm-migrations.md) for schema evolution
