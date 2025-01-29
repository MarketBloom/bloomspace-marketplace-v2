# Feature Organization

Each feature should:
1. Be self-contained
2. Have its own types
3. Have clear dependencies
4. Be lazy-loaded when possible

Example structure:
features/
  delivery/
    components/      // Components
    hooks/          // Custom hooks
    types.ts        // Feature-specific types
    utils.ts        // Feature-specific utilities
    index.ts        // Public API 