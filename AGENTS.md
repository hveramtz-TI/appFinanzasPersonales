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

### Core Principles

- **KISS** → Prioriza soluciones simples y claras.
- **DRY** → Evita duplicación innecesaria.
- **YAGNI** → No implementes funcionalidades que no se necesitan.
- **SOLID** → Aplícalo cuando aporte claridad, no como dogma.
- **Separation of Concerns** → Cada componente debe tener una responsabilidad clara.
- **High Cohesion / Low Coupling** → Mantén módulos bien definidos y poco dependientes.
- **Fail Fast** → Detecta y comunica errores lo antes posible.
- **Clean Code** → Código legible, nombres descriptivos y funciones pequeñas.
- **Composition over Inheritance** → Prefiere composición cuando sea una mejor opción.
- **Convention over Configuration** → Sigue las convenciones del lenguaje o framework.
- **Program to Interfaces** → Depende de abstracciones cuando tenga sentido.
- **Encapsulation** → Oculta detalles internos y expón solo lo necesario.
- **Principle of Least Surprise** → El comportamiento del código debe ser predecible.
- **Boy Scout Rule** → Deja el código mejor de como lo encontraste.
- **Testing mindset** → Escribe código fácil de probar, aunque no siempre se generen pruebas.

### Architecture & Structure

- Follow Clean Architecture.
- Keep files small and focused.
- Write maintainable code.

### Project-Specific Constraints

- **Expo Go Compatible**: No usar módulos nativos que requieran dev build.
- **Offline First**: SQLite es la fuente de verdad, Supabase es backup/sync.
- **Personal App**: No sobre-ingenierizar. Si una solución simple funciona, úsala.
- **Feature-first structure**: El código de una feature vive junto, no disperso por capas.