# orm-transactions — ACID Compliance & Data Consistency

Master database transactions for ensuring data consistency and implementing complex multi-step operations safely.

## Transaction Basics

**Purpose:** Ensure ACID properties — Atomicity, Consistency, Isolation, Durability.

- **Atomicity:** All-or-nothing execution
- **Consistency:** Database rules enforced
- **Isolation:** Concurrent transactions don't interfere
- **Durability:** Committed data survives failures

## Query Runner Transactions

**For complex scenarios with manual control:**

```typescript
import { DataSource, QueryRunner } from "typeorm";

export class OrdersService {
  constructor(private dataSource: DataSource) {}

  async createOrderWithItems(dto: CreateOrderDto): Promise<Order> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Step 1: Create order
      const order = queryRunner.manager.create(Order, {
        userId: dto.userId,
        totalPrice: dto.totalPrice,
      });
      await queryRunner.manager.save(order);

      // Step 2: Create order items and decrease stock
      for (const item of dto.items) {
        const product = await queryRunner.manager.findOne(Product, {
          where: { id: item.productId },
        });

        if (!product || product.stock < item.quantity) {
          throw new Error("Insufficient stock");
        }

        // Create item
        const orderItem = queryRunner.manager.create(OrderItem, {
          order,
          product,
          quantity: item.quantity,
        });
        await queryRunner.manager.save(orderItem);

        // Decrease stock
        product.stock -= item.quantity;
        await queryRunner.manager.save(product);
      }

      // Commit if all steps succeed
      await queryRunner.commitTransaction();
      return order;
    } catch (error) {
      // Rollback on ANY error
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Always release connection
      await queryRunner.release();
    }
  }
}
```

## Transaction Decorator (Simplified)

**For NestJS services — cleaner syntax:**

```typescript
import { Transactional } from "typeorm-transactional";

@Transactional()
async createOrderWithItems(dto: CreateOrderDto): Promise<Order> {
  // All queries within this method are transactional
  // Auto-rollback on errors
  // No manual try/catch needed

  const order = await this.ordersRepository.save({
    userId: dto.userId,
    totalPrice: dto.totalPrice,
  });

  for (const item of dto.items) {
    const product = await this.productsRepository.findOne({
      where: { id: item.productId },
    });

    if (!product || product.stock < item.quantity) {
      throw new Error("Insufficient stock"); // Auto-rolls back entire transaction
    }

    await this.orderItemsRepository.save({
      order,
      product,
      quantity: item.quantity,
    });

    product.stock -= item.quantity;
    await this.productsRepository.save(product);
  }

  return order;
}
```

## DataSource.transaction()

**For simpler transactions:**

```typescript
const order = await this.dataSource.transaction(async (manager) => {
  const order = manager.create(Order, {
    userId: dto.userId,
    totalPrice: dto.totalPrice,
  });
  await manager.save(order);

  for (const item of dto.items) {
    const product = await manager.findOne(Product, {
      where: { id: item.productId },
    });

    if (!product || product.stock < item.quantity) {
      throw new Error("Insufficient stock");
    }

    const orderItem = manager.create(OrderItem, { order, product, quantity: item.quantity });
    await manager.save(orderItem);

    product.stock -= item.quantity;
    await manager.save(product);
  }

  return order;
});
```

## Isolation Levels

**PostgreSQL & MySQL support different isolation levels:**

```typescript
// Serializable: Strictest, slowest
await queryRunner.query("SET TRANSACTION ISOLATION LEVEL SERIALIZABLE");

// Repeatable Read: Prevents dirty reads & non-repeatable reads
await queryRunner.query("SET TRANSACTION ISOLATION LEVEL REPEATABLE READ");

// Read Committed: Default, prevents dirty reads
await queryRunner.query("SET TRANSACTION ISOLATION LEVEL READ COMMITTED");

// Read Uncommitted: Least strict, fastest
await queryRunner.query("SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED");
```

## Handling Transaction Errors

```typescript
import { TransactionStartedError, TransactionAlreadyStartedError } from "typeorm";

try {
  await queryRunner.startTransaction();
  // ... database operations
  await queryRunner.commitTransaction();
} catch (error) {
  await queryRunner.rollbackTransaction();

  if (error instanceof YourBusinessLogicError) {
    // Handle app-level errors
    throw new BadRequestException(error.message);
  }

  if (error instanceof DatabaseError) {
    // Handle DB-level errors
    throw new InternalServerErrorException("Database operation failed");
  }

  throw error; // Re-throw unexpected errors
}
```

## Best Practices

1. **Keep transactions short:** Lock duration matters in multi-user systems
2. **Minimize locked tables:** Reduce scope to necessary operations only
3. **Handle errors explicitly:** Always rollback on exceptions
4. **Use appropriate isolation levels:** Balance consistency vs performance
5. **Avoid nested transactions:** Start one per operation
6. **Release connections:** Always call `queryRunner.release()`
7. **Test rollback scenarios:** Verify data consistency on failures
8. **Log transaction boundaries:** Track long-running transactions in production

## Common Pitfall: N+1 in Transactions

```typescript
// ❌ BAD: Loop + individual queries = N+1 problem
const orders = await orderRepository.find();
for (const order of orders) {
  const items = await orderItemRepository.find({ where: { order } }); // N queries!
}

// ✅ GOOD: Load all relations once
const orders = await orderRepository.find({
  relations: ["items"],
});
```
