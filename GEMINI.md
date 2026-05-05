# Project Instructions

## General Principles

- **Skill & Rule Precedence:** ALWAYS check the `.gemini` folder for skills and rules before starting any task.
- **Mandatory Skill Usage:** If a skill exists for a specific task (e.g., `research`, `plan-phase`, `implement-phase`), it MUST be used for that task.
- **Rule Adherence:** All code changes and architectural designs must strictly follow the rules defined in `.gemini/rules/`.
- **Parallel Agent Execution:** ALWAYS run subagents in parallel whenever their tasks are independent and do not mutate the same files or resources to maximize efficiency.
