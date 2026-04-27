---
title: DTO Rules
impact: HIGH
impactDescription: Keeps API contracts validated, explicit, and separated from database entities
tags: nestjs, dto, validation, class-validator
---

# DTO Rules

## Validation

- Always use `class-validator` decorators on every field (`@IsString()`, `@IsEmail()`, `@IsNotEmpty()`, etc.)
- Apply `class-transformer` decorators when type coercion is needed (e.g., `@Type(() => Number)`)

## Separation of Concerns

- Create separate DTOs per operation: `CreateXDto`, `UpdateXDto`, `QueryXDto`
- Never use an entity class as a DTO — entities are database models, DTOs are API contracts
- For update DTOs, use `PartialType(CreateXDto)` from `@nestjs/mapped-types` to avoid duplication

## Naming

- File naming: `create-user.dto.ts`, `update-video.dto.ts`, `query-channel.dto.ts`
- Class naming: `CreateUserDto`, `UpdateVideoDto`, `QueryChannelDto`
