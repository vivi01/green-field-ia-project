# Template: TypeORM Rule

Copy this template when creating new rule documentation files for the TypeORM skill.

---

## Frontmatter

No frontmatter required. File naming pattern is the key:
- **Prefix:** `orm-` (identifies this as a TypeORM/ORM rule)
- **Suffix:** descriptive name (e.g., `orm-entities`, `orm-lazy-loading`)
- **Format:** `orm-descriptive-name.md`

## File Structure

```markdown
# orm-rule-name — Short Description

**Category:** Link to _sections.md or inline description.

**Impact:** CRITICAL | HIGH | MEDIUM-HIGH | MEDIUM | LOW

## Core Concept
Brief explanation of why this rule matters.

## When to Apply
- Use case 1
- Use case 2

## How to Implement

### Scenario 1
Code example 1

### Scenario 2
Code example 2

## Common Pitfalls
- ❌ Anti-pattern 1: Explanation
- ✅ Better approach: Explanation

## Best Practices
1. Practice 1
2. Practice 2

## Testing
Example of how to test this rule.

## Related Rules
- orm-another-rule
- orm-related-concept
```

## Guidelines

- **Keep files to 100–200 lines** — Users should scan quickly
- **Use practical examples** — Real StreamTube scenarios (Users, Channels, Videos)
- **Link to related rules** — At the end, reference other relevant rules
- **No meta-discussion** — Focus on "how to do it right"
- **Explicit filenames** — The filename acts as documentation

## Example: orm-entities.md

```markdown
# orm-entities — Entity Design & Decorators

Master TypeORM entity definitions, decorators, column types, and primary key strategies.

## Core Principles
...
```
