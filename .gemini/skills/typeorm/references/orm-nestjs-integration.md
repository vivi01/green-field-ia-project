# orm-nestjs-integration — NestJS Module Setup & DI Configuration

Master TypeORM setup, dependency injection, and module configuration in NestJS applications.

## Installation & Setup

```bash
npm install @nestjs/typeorm typeorm
```

## Data Source Configuration

Create `src/database/data-source.ts`:

```typescript
import { DataSource } from "typeorm";
import * as dotenv from "dotenv";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  // Entity configuration
  entities: [__dirname + "/../**/*.entity.ts"],

  // Migrations
  migrations: [__dirname + "/../migrations/**/*.ts"],
  migrationsTableName: "migrations",

  // Production settings
  synchronize: false, // NEVER true in production
  logging: process.env.NODE_ENV === "development",
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});
```

## Module Configuration

### Basic Setup

```typescript
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppDataSource } from "../database/data-source";
import { User } from "./entities/user.entity";
import { UsersModule } from "./users/users.module";

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "postgres",
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [__dirname + "/**/*.entity.ts"],
      migrations: [__dirname + "/migrations/**/*.ts"],
      synchronize: false,
      logging: process.env.NODE_ENV === "development",
    }),
    UsersModule,
  ],
})
export class DatabaseModule {}
```

### Using DataSource Instance

```typescript
import { Module } from "@nestjs/common";
import { AppDataSource } from "../database/data-source";

@Module({
  providers: [
    {
      provide: DataSource,
      useValue: AppDataSource,
    },
  ],
  exports: [DataSource],
})
export class DatabaseModule {}
```

## Feature Module with TypeORM

```typescript
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { UsersService } from "./services/users.service";
import { UsersController } from "./controllers/users.controller";
import { UserRepository } from "./repositories/user.repository";

@Module({
  imports: [TypeOrmModule.forFeature([User])], // Register entities
  providers: [UserRepository, UsersService],    // Services use repository
  controllers: [UsersController],
  exports: [UsersService],                       // For other modules
})
export class UsersModule {}
```

## Service with Dependency Injection

```typescript
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./entities/user.entity";
import { CreateUserDto } from "./dto/create-user.dto";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create(dto);
    return this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(id: number): Promise<User> {
    return this.userRepository.findOne({ where: { id } });
  }
}
```

## Custom Repository Pattern (Best Practice)

```typescript
import { Injectable } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { User } from "../entities/user.entity";

@Injectable()
export class UserRepository extends Repository<User> {
  constructor(private dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.findOne({ where: { email } });
  }

  async findActive(): Promise<User[]> {
    return this.find({ where: { isActive: true } });
  }
}
```

Register in module:

```typescript
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UserRepository, UsersService],
})
export class UsersModule {}
```

## Connection Management

### Initialize in main.ts

```typescript
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { AppDataSource } from "./database/data-source";

async function bootstrap() {
  // Initialize database connection
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }

  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}

bootstrap();
```

### Graceful Shutdown

```typescript
async function bootstrap() {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }

  const app = await NestFactory.create(AppModule);
  await app.listen(3000);

  // Clean shutdown
  process.on("SIGTERM", async () => {
    console.log("SIGTERM received, shutting down...");
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
    await app.close();
    process.exit(0);
  });
}
```

## Running Migrations in NestJS

### CLI Commands

```bash
# Generate from entities
npm run typeorm migration:generate -- src/migrations/CreateUsers

# Run pending migrations
npm run typeorm migration:run

# Revert last
npm run typeorm migration:revert
```

### Add to package.json

```json
{
  "scripts": {
    "typeorm": "typeorm -d src/database/data-source.ts",
    "migration:generate": "npm run typeorm -- migration:generate",
    "migration:run": "npm run typeorm -- migration:run",
    "migration:revert": "npm run typeorm -- migration:revert"
  }
}
```

## Testing with TypeORM

### Test Database Setup

```typescript
import { Test, TestingModule } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UsersService } from "./users.service";
import { User } from "./entities/user.entity";

describe("UsersService", () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: "sqlite",
          database: ":memory:",
          entities: [User],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([User]),
      ],
      providers: [UsersService],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it("should create a user", async () => {
    const user = await service.create({ email: "test@example.com", name: "Test" });
    expect(user).toBeDefined();
  });
});
```

## Environment Configuration

Create `.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_NAME=streamtube
NODE_ENV=development
```

## Connection Pool Configuration

```typescript
TypeOrmModule.forRoot({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  poolSize: 10,           // Max connections
  maxQueryExecutionTime: 30000, // 30 seconds
  extra: {
    connectionTimeoutMillis: 30000,
  },
})
```
