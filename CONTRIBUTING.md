# Contributing

## Development flow

1. Install dependencies in the root and `web/`.
2. Copy `.env.example` files before running local workflows.
3. Run `npm run typecheck` and `npm run test` in the root.
4. Run `cd web && npm run typecheck && npm run test`.
5. If you change prompt logic or schemas, update sample fixtures and README examples in the same change.

## Pull requests

- Describe the use case or problem being improved.
- Note any prompt, schema, or API contract changes.
- Include the commands you ran locally.

## Scope

Small, focused improvements are preferred over broad rewrites. Keep business rules deterministic where possible and avoid hiding core logic inside prompts when code can enforce it more reliably.
