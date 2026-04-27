# orm-relationships — Associations & Entity Dependencies

Master TypeORM relationship decorators for modeling database associations: one-to-one, one-to-many, and many-to-many.

## One-to-One Relationships

**Use when:** One entity instance is associated with exactly one instance of another entity.

```typescript
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  // Owner side of the relationship
  @OneToOne(() => Profile, (profile) => profile.user, {
    cascade: true, // Auto-save/remove related profile
    eager: false,  // Load profile only when explicitly requested
  })
  @JoinColumn() // Foreign key is stored in this table
  profile: Profile;
}

@Entity()
export class Profile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  bio: string;

  // Inverse side (no @JoinColumn here)
  @OneToOne(() => User, (user) => user.profile)
  user: User;
}
```

## One-to-Many / Many-to-One Relationships

**Use when:** One entity can have multiple instances of another entity.

```typescript
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  // One user has many posts
  @OneToMany(() => Post, (post) => post.author)
  posts: Post[];
}

@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  // Many posts belong to one user
  @ManyToOne(() => User, (user) => user.posts, {
    onDelete: "CASCADE", // Delete posts when user is deleted
    eager: false,
  })
  @JoinColumn({ name: "author_id" }) // Custom foreign key column name
  author: User;

  @Column()
  authorId: number; // Explicit foreign key property (optional but recommended)
}
```

## Many-to-Many Relationships

**Use when:** Multiple instances of two entities can be associated with each other.

```typescript
@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  // Owner side of many-to-many
  @ManyToMany(() => Tag, (tag) => tag.posts)
  @JoinTable({
    name: "post_tags", // Junction table name
    joinColumn: { name: "post_id" },
    inverseJoinColumn: { name: "tag_id" },
  })
  tags: Tag[];
}

@Entity()
export class Tag {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  // Inverse side (no @JoinTable here)
  @ManyToMany(() => Post, (post) => post.tags)
  posts: Post[];
}
```

## Relationship Options

### Common Options

```typescript
@OneToMany(() => Post, (post) => post.author, {
  cascade: true,              // Auto-save/remove related entities
  eager: false,               // Load relations only on demand
  lazy: false,                // Don't use lazy loading
  onDelete: "CASCADE",        // Delete related when parent deleted
  onUpdate: "CASCADE",        // Update related when parent updated
  orphanedRowAction: "remove" // Remove orphaned rows
})
```

### Cascade Options

- `true`: Cascade insert and update
- `["insert"]`: Only cascade inserts
- `["update"]`: Only cascade updates
- `["remove"]`: Cascade deletes

### Delete/Update Actions

- `"CASCADE"`: Propagate deletions/updates
- `"RESTRICT"`: Prevent deletion if children exist
- `"SET NULL"`: Set foreign key to NULL
- `"NO ACTION"`: No automatic action (database enforces)
- `"SET DEFAULT"`: Set to default value

## Eager vs Lazy Loading

```typescript
// EAGER: Load relations automatically (use sparingly)
@ManyToOne(() => User, { eager: true })
author: User;

// LAZY: Load on-demand using QueryBuilder
@ManyToOne(() => User)
author: Promise<User>;
```

## Load Relations in Queries

```typescript
// Find with relations
const post = await postRepository.findOne({
  where: { id: 1 },
  relations: ["author", "tags"], // String array or nested object
});

// With QueryBuilder
const post = await postRepository
  .createQueryBuilder("post")
  .leftJoinAndSelect("post.author", "author") // Load author
  .leftJoinAndSelect("post.tags", "tags")     // Load tags
  .where("post.id = :id", { id: 1 })
  .getOne();
```
