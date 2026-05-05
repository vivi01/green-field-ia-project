# orm-repositories — Data Access Patterns & Query Builder

Master custom repositories, query builders, and database abstraction for testable, maintainable data access layers.

## Repository Pattern (Data Mapper)

**Why:** Abstracts database logic from business logic, enabling easier testing and swappable implementations.

### Basic Repository Usage

```typescript
import { DataSource } from "typeorm";
import { User } from "./entities/user.entity";

// Inject repository via DI
constructor(private userRepository: Repository<User>) {}

// Basic operations
const users = await this.userRepository.find();
const activeUsers = await this.userRepository.find({
  where: { isActive: true },
});

const user = await this.userRepository.findOne({ where: { id: 1 } });
const userOrFail = await this.userRepository.findOneOrFail({
  where: { id: 1 },
});

// Create and save
const newUser = this.userRepository.create({
  email: "user@example.com",
  name: "John Doe",
});
await this.userRepository.save(newUser);

// Update
await this.userRepository.update({ id: 1 }, { name: "Jane Doe" });

// Delete
await this.userRepository.delete({ id: 1 });

// Soft delete (requires @DeleteDateColumn)
await this.userRepository.softDelete({ id: 1 });
```

### Custom Repository (Recommended)

**Best practice for NestJS:** Create a custom repository extending `Repository<T>` and register it as a provider.

```typescript
import { Repository, DataSource } from "typeorm";
import { User } from "./entities/user.entity";

export class UserRepository extends Repository<User> {
  constructor(private dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.findOne({ where: { email } });
  }

  async findActiveUsers(): Promise<User[]> {
    return this.find({
      where: { isActive: true },
      order: { createdAt: "DESC" },
    });
  }

  async findWithRelations(userId: number): Promise<User | null> {
    return this.findOne({
      where: { id: userId },
      relations: ["profile", "posts", "posts.tags"],
    });
  }
}
```

### Register in NestJS Module

```typescript
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserRepository } from "./repositories/user.repository";
import { UsersService } from "./services/users.service";

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UserRepository, UsersService],
})
export class UsersModule {}
```

## Query Builder

**Use for:** Complex queries, joins, conditions, sorting, pagination.

### Basic Query Builder

```typescript
const users = await this.userRepository
  .createQueryBuilder("user")
  .where("user.isActive = :isActive", { isActive: true })
  .andWhere("user.createdAt >= :date", { date: new Date("2024-01-01") })
  .orderBy("user.createdAt", "DESC")
  .skip(0)
  .take(10)
  .getMany();
```

### Joins

```typescript
// LEFT JOIN (all users + their posts, posts can be null)
const users = await this.userRepository
  .createQueryBuilder("user")
  .leftJoinAndSelect("user.posts", "post")
  .where("user.isActive = :isActive", { isActive: true })
  .getMany();

// INNER JOIN (only users with posts)
const users = await this.userRepository
  .createQueryBuilder("user")
  .innerJoinAndSelect("user.posts", "post")
  .getMany();

// With conditions on related entities
const users = await this.userRepository
  .createQueryBuilder("user")
  .leftJoinAndSelect("user.posts", "post", "post.published = :published", { published: true })
  .getMany();
```

### Aggregations & Raw Results

```typescript
// COUNT
const count = await this.userRepository
  .createQueryBuilder("user")
  .select("COUNT(*)", "count")
  .where("user.isActive = :isActive", { isActive: true })
  .getRawOne();

// GROUP BY with aggregates
const results = await this.userRepository
  .createQueryBuilder("user")
  .select("user.status", "status")
  .addSelect("COUNT(*)", "count")
  .groupBy("user.status")
  .getRawMany();

// Raw SQL execution
const users = await this.userRepository.query(
  `SELECT * FROM users WHERE is_active = $1`,
  [true]
);
```

### Subqueries

```typescript
const userIds = this.userRepository
  .createQueryBuilder("user")
  .select("user.id")
  .where("user.isActive = :isActive", { isActive: true });

const posts = await this.postRepository
  .createQueryBuilder("post")
  .where(`post.authorId IN (${userIds.getQuery()})`)
  .setParameters(userIds.getParameters())
  .getMany();
```

### Bulk Operations

```typescript
// Insert
await this.userRepository
  .createQueryBuilder()
  .insert()
  .into(User)
  .values([
    { email: "user1@example.com", name: "User 1" },
    { email: "user2@example.com", name: "User 2" },
  ])
  .execute();

// Update
await this.userRepository
  .createQueryBuilder()
  .update(User)
  .set({ isActive: false })
  .where("createdAt < :date", { date: new Date("2020-01-01") })
  .execute();

// Delete
await this.userRepository
  .createQueryBuilder()
  .delete()
  .where("isActive = :isActive", { isActive: false })
  .execute();
```

## Query Performance Tips

- Use `.select()` to limit columns returned
- Use `leftJoinAndSelect` only for needed relations
- Use `relations` in `.find()` for simple cases
- Index frequently filtered columns
- Use pagination (`.skip()` and `.take()`)
- Avoid `N+1` query problems: load relations explicitly

## Error Handling

```typescript
try {
  const user = await this.userRepository.findOneOrFail({
    where: { id: 1 },
  });
} catch (error) {
  if (error instanceof EntityNotFoundError) {
    throw new NotFoundException("User not found");
  }
  throw error;
}
```
