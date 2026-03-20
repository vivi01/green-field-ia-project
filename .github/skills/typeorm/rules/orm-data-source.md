# orm-data-source — Connection Configuration & Pool Management

Master TypeORM DataSource setup for production-ready database connections.

## DataSource Fundamentals

The `DataSource` is the central configuration object that manages:

- Connection pool
- Entity metadata
- Migration runner
- Query execution context

## Production Configuration

Create `src/database/data-source.ts`:

```typescript
import { DataSource, LoggerOptions } from "typeorm";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

// Determine logging level
const loggingOptions: LoggerOptions =
  process.env.NODE_ENV === "development"
    ? ["query", "error", "warn"] // Verbose in dev
    : ["error", "warn"];           // Only errors in production

export const AppDataSource = new DataSource({
  // Connection
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || "streamtube",

  // Entities & Migrations
  entities: [__dirname + "/../**/*.entity.ts"],
  migrations: [__dirname + "/migrations/**/*.ts"],
  migrationsTableName: "typeorm_migrations",

  // Schema synchronization (NEVER true in production)
  synchronize: process.env.NODE_ENV !== "production",

  // Logging
  logging: loggingOptions,
  logger: "advanced-console",

  // Connection pool
  poolSize: process.env.DB_POOL_SIZE ? parseInt(process.env.DB_POOL_SIZE) : 10,
  maxQueryExecutionTime: 30000, // 30 seconds

  // SSL (production)
  ssl: process.env.NODE_ENV === "production" ? {
    rejectUnauthorized: process.env.DB_SSL_REJECT !== "false",
  } : false,

  // Extra driver options
  extra: {
    connectionTimeoutMillis: 30000,
    idleTimeoutMillis: 30000,
    max: 20, // Max pool connections
  },

  // Drop schema on init (dev only)
  dropSchema: false,
});
```

## Environment-Specific Configs

### Development (.env.development)

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=devpass
DB_NAME=streamtube_dev
DB_POOL_SIZE=5
NODE_ENV=development
```

### Testing (.env.test)

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=testpass
DB_NAME=streamtube_test
DB_POOL_SIZE=2
NODE_ENV=test
```

### Production (.env.production)

```env
DB_HOST=db.example.com
DB_PORT=5432
DB_USERNAME=app_user
DB_PASSWORD=<SECURE_PASSWORD>
DB_NAME=streamtube_prod
DB_POOL_SIZE=20
DB_SSL_REJECT=true
NODE_ENV=production
```

## Connection Initialization

### Standalone Initialization

```typescript
import { AppDataSource } from "./database/data-source";

async function initializeDatabase() {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log("✅ Database connected");
    }
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  }
}

initializeDatabase();
```

### In NestJS Main

```typescript
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { AppDataSource } from "./database/data-source";

async function bootstrap() {
  // Initialize database
  if (!AppDataSource.isInitialized) {
    try {
      await AppDataSource.initialize();
      console.log("✅ Database connected");
    } catch (error) {
      console.error("❌ Failed to initialize database:", error);
      process.exit(1);
    }
  }

  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT || 3000);
}

bootstrap();
```

## Connection Pool Tuning

```typescript
{
  poolSize: 10,                              // Max concurrent connections
  maxQueryExecutionTime: 30000,              // Query timeout (30s)
  extra: {
    connectionTimeoutMillis: 30000,          // Connect timeout
    idleTimeoutMillis: 30000,                // Idle timeout
    max: 20,                                 // Absolute max pool size
    statement_timeout: "30000",              // PostgreSQL statement timeout
  },
}
```

### Pool Configuration Guidelines

| Setting | Development | Production |
|---------|-------------|-----------|
| `poolSize` | 5-10 | 10-20 |
| Max connections | 10-15 | 20-50 |
| Query timeout | 30s | 60s |
| Idle timeout | 30s | 900s (15m) |

## SSL/TLS Configuration

### Self-Signed Certificates

```typescript
ssl: {
  rejectUnauthorized: process.env.NODE_ENV !== "development",
}
```

### With Certificate Files

```typescript
import * as fs from "fs";

ssl: {
  ca: fs.readFileSync("path/to/ca.pem"),
  cert: fs.readFileSync("path/to/cert.pem"),
  key: fs.readFileSync("path/to/key.pem"),
  rejectUnauthorized: true,
}
```

## Logging Configuration

### Log Levels

```typescript
logging: ["query", "error", "warn", "info", "log"]

// Or conditional
logging: process.env.NODE_ENV === "development"
  ? ["query", "error", "warn"]
  : ["error"]
```

### Custom Logger

```typescript
import { Logger } from "typeorm";

class CustomLogger implements Logger {
  log(message: string, level?: "log" | "info" | "warn") {
    console.log(`[${level}] ${new Date().toISOString()} - ${message}`);
  }

  error(message: string, _stack?: string) {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`);
  }

  warn(message: string) {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`);
  }
}

export const AppDataSource = new DataSource({
  // ...
  logger: new CustomLogger(),
});
```

## Health Checks

```typescript
async function checkDatabaseHealth(): Promise<boolean> {
  try {
    if (!AppDataSource.isInitialized) {
      return false;
    }

    // Test connection
    const result = await AppDataSource.query("SELECT 1");
    return result.length > 0;
  } catch (error) {
    console.error("Database health check failed:", error);
    return false;
  }
}

// In NestJS health module
@Injectable()
export class DatabaseHealthIndicator {
  constructor(private health: HealthCheckService) {}

  async check() {
    return this.health.check([
      () =>
        AppDataSource.query("SELECT 1")
          .then(() => ({ database: { status: "up" } }))
          .catch((error) => ({ database: { status: "down", error: error.message } })),
    ]);
  }
}
```

## Graceful Shutdown

```typescript
async function gracefulShutdown() {
  console.log("Shutting down gracefully...");

  if (AppDataSource.isInitialized) {
    try {
      await AppDataSource.destroy();
      console.log("✅ Database connection closed");
    } catch (error) {
      console.error("❌ Failed to close database:", error);
    }
  }

  process.exit(0);
}

// Handle signals
process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);
```

## Common Issues & Solutions

### Issue: "Too many connections"

**Cause:** Pool exhausted by idle connections.

**Solution:**

```typescript
extra: {
  idleTimeoutMillis: 30000, // Close idle connections after 30s
}
```

### Issue: "Connection timeout"

**Cause:** Database unreachable or network issues.

**Solution:**

```typescript
extra: {
  connectionTimeoutMillis: 60000, // Increase timeout
}
```

### Issue: Slow migrations

**Cause:** Missing indexes or large tables.

**Solution:** Use migrations with proper indexing strategy.
