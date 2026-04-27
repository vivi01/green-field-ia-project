---
name: testing-guide-nestjs-project
description: "**TESTING SKILL** - NestJS unit, integration, and e2e testing conventions for StreamTube. USE FOR: writing tests, choosing test scope, setting up test modules, handling test data, and validating application behavior. DO NOT USE FOR: production runtime logic unrelated to tests."
license: MIT
metadata:
  author: streamtube-team
  version: "1.0.0"
---

# NestJS Testing Guide

Practical testing guidance for the StreamTube NestJS backend. Focuses on unit, integration, and end-to-end tests with realistic data and isolated dependencies.

## When to Apply This Skill

Use this skill when you are:

- Creating or updating unit tests for services, controllers, guards, or helpers
- Adding integration tests that exercise the database and ORM behavior
- Writing e2e tests that validate HTTP routes and application wiring
- Choosing what to mock and what to keep real in a test suite
- Setting up test modules, fixtures, factories, or cleanup logic

## When NOT to Apply This Skill

Skip this skill when you are:

- Changing production business logic that is not test-related
- Debugging infrastructure, deployment, or Docker issues unrelated to tests
- Writing frontend tests for a non-NestJS application
- Looking for pure TypeScript syntax help without testing context

## Core Principles

1. Keep tests close to the code they validate.
2. Mock only the boundaries that are expensive, unstable, or external.
3. Prefer realistic data over hardcoded artificial fixtures.
4. Use clear Arrange-Act-Assert structure.
5. Run focused tests during development and the full suite before finishing.

## Quick References

- Unit tests: mock repositories, HTTP clients, queues, cache clients, and mail providers.
- Integration tests: keep the database real and stub external integrations.
- E2E tests: keep the API and database real and verify HTTP contracts end to end.
- Database cleanup: prefer `repository.clear()` or explicit SQL deletes when needed.

## Related Rules

- `.gemini/rules/nestjs-testing.md`
- `.gemini/skills/nestjs-best-practices/rules/test-use-testing-module.md`
- `.gemini/skills/nestjs-best-practices/rules/test-e2e-supertest.md`
