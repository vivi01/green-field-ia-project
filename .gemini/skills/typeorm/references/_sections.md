# Sections

This file defines all sections, their ordering, impact levels, and descriptions.
The section ID (in parentheses) is the filename prefix used to group rules.

---

## 1. Entity Design (orm-entities)

**Impact:** CRITICAL
**Description:** Entities are the foundation of TypeORM. Proper decorators, column configurations, and primary key strategies ensure database schema correctness and type safety.

## 2. Relationships (orm-relationships)

**Impact:** CRITICAL
**Description:** Relationships define how entities associate. One-to-one, one-to-many, and many-to-many mappings are essential for data integrity and query efficiency.

## 3. Repositories (orm-repositories)

**Impact:** HIGH
**Description:** Repository Pattern abstracts database access logic from business logic. Custom repositories and QueryBuilder enable testable, maintainable data layers.

## 4. Migrations (orm-migrations)

**Impact:** HIGH
**Description:** Migrations provide versioned, reversible schema changes. Safe migration practices prevent data loss and support zero-downtime deployments.

## 5. Transactions (orm-transactions)

**Impact:** HIGH
**Description:** Transactions ensure ACID properties for multi-step operations. Proper transaction handling guarantees data consistency under concurrent access.

## 6. NestJS Integration (orm-nestjs-integration)

**Impact:** MEDIUM-HIGH
**Description:** Integrating TypeORM with NestJS requires proper module setup, dependency injection, and connection management for production-ready applications.

## 7. Data Source (orm-data-source)

**Impact:** MEDIUM-HIGH
**Description:** DataSource configuration manages connection pooling, SSL, logging, and health checks. Environment-specific configurations support dev/test/prod deployments.
