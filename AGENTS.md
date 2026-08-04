# Development Workflow

## Planning First

Always start every new feature in Planning mode.

Before running any SDD workflow:

1. Create a `planning.md`.
2. Validate the planning with the user.
3. Do not generate code during the planning phase.
4. The planning document becomes the source of truth for SDD.

## SDD Workflow

Once `planning.md` is approved:

planning.md
    ↓
sdd-spec
    ↓
sdd-design
    ↓
sdd-tasks
    ↓
sdd-apply
    ↓
sdd-verify

Always use the planning document as the primary context.

Never invent requirements that are not present in the planning document unless explicitly requested.

If information is missing, ask questions before continuing.

## Coding

- Follow Clean Architecture.
- Prefer SOLID principles.
- Write maintainable code.
- Keep files small.
- Prefer composition over inheritance.