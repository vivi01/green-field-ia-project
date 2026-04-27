---
title: NestJS Module Structure
impact: HIGH
impactDescription: Keeps module composition predictable, minimal, and aligned with NestJS feature boundaries
tags: nestjs, modules, architecture, dependency-injection
---

# NestJS Module Structure

- `@Module()` property order: `imports` → `controllers` → `providers` → `exports`
- `TypeOrmModule.forFeature([...])` goes in domain module `imports`, never in `AppModule`
- `AppModule` only contains global infrastructure (ConfigModule, TypeOrmModule) and domain modules — no business providers
- `exports` only for dependencies other modules need; don't export by default
