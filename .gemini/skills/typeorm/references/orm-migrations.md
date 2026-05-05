# orm-migrations — Schema Versioning & Safe Changes

Master safe database schema changes with TypeORM migrations. Essential for versioned, reversible database evolution.

## Core Principles

- Migrations are versioned, timestamped scripts
- Always reversible (up/down methods)
- Support pure SQL or TypeORM APIs
- Generated OR manually written
- Run sequentially in production

## Creating Migrations

### Generate from Entity Changes

**Recommended:** Auto-generate migrations from entity modifications.

```bash
npx typeorm migration:generate src/migrations/CreateUsers -d src/data-source.ts
npx typeorm migration:generate src/migrations/AddUserProfile -d src/data-source.ts
```

TypeORM compares current entities to database schema and generates change scripts.

### Manual Migration

For custom logic:

```bash
npx typeorm migration:create src/migrations/SeedRoles
```

## Migration File Structure

```typescript
import { MigrationInterface, QueryRunner, Table, TableColumn, TableIndex } from "typeorm";

export class CreateUsers1234567890 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create table
    await queryRunner.createTable(
      new Table({
        name: "users",
        columns: [
          {
            name: "id",
            type: "int",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "email",
            type: "varchar",
            length: "255",
            isUnique: true,
          },
          {
            name: "is_active",
            type: "boolean",
            default: true,
          },
          {
            name: "created_at",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
          },
        ],
      })
    );

    // Create index
    await queryRunner.createIndex(
      "users",
      new TableIndex({
        name: "IDX_USERS_EMAIL",
        columnNames: ["email"],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reverse changes
    await queryRunner.dropIndex("users", "IDX_USERS_EMAIL");
    await queryRunner.dropTable("users");
  }
}
```

## Common Operations

### Add Column

```typescript
await queryRunner.addColumn(
  "users",
  new TableColumn({
    name: "profile_id",
    type: "int",
    isNullable: true,
  })
);
```

### Drop Column

```typescript
await queryRunner.dropColumn("users", "profile_id");
```

### Add Foreign Key

```typescript
await queryRunner.createForeignKey(
  "posts",
  new TableForeignKey({
    columnNames: ["author_id"],
    referencedTableName: "users",
    referencedColumnNames: ["id"],
    onDelete: "CASCADE",
  })
);
```

### Drop Foreign Key

```typescript
await queryRunner.dropForeignKey("posts", "fk_author");
```

### Create Index

```typescript
await queryRunner.createIndex(
  "users",
  new TableIndex({
    name: "IDX_EMAIL",
    columnNames: ["email"],
  })
);
```

## Running Migrations

### Run All Pending

```bash
npx typeorm migration:run -d src/data-source.ts
```

### Revert Last Migration

```bash
npx typeorm migration:revert -d src/data-source.ts
```

### Show Migration Status

```bash
npx typeorm migration:show -d src/data-source.ts
```

## Best Practices

1. **One migration per feature:** Each logical change gets its own file
2. **Keep migrations small:** Easier to debug and revert
3. **Always write down() method:** Enable rollbacks
4. **Use generated migrations:** Reduces errors vs manual
5. **Test migrations locally:** Before production deployment
6. **Never edit committed migrations:** Create new ones instead
7. **Use timestamps:** TypeORM auto-generates unique names
8. **Document complex migrations:** Add comments explaining why

## Migration Safety Rules

```typescript
// ✅ SAFE: Add nullable column (no existing data affected)
new TableColumn({
  name: "age",
  type: "int",
  isNullable: true,
});

// ✅ SAFE: Add column with default
new TableColumn({
  name: "status",
  type: "varchar",
  default: "'active'",
});

// ❌ RISKY: Add non-nullable column to existing table
// Fails if table has rows (no default value provided)
new TableColumn({
  name: "required_field",
  type: "varchar",
  isNullable: false,
});

// ✅ SAFE: Drop unused columns in phases
// 1. Deploy code that ignores column
// 2. In next release, drop column
```

## Data Seeding Migrations

```typescript
export class SeedRolesMigration implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO roles (name) VALUES ('admin'), ('user'), ('moderator')`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM roles WHERE name IN ('admin', 'user', 'moderator')`);
  }
}
```
