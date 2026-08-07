# Contributing

Thanks for helping improve Zigi Voice. This is a concept prototype, so keep
changes focused and well-tested.

## Setup

```bash
nvm use            # Node 20 (see .nvmrc)
npm install
cp .env.example .env   # add keys only if you want live Twi/Kusaal voice
npm run dev
```

## Before opening a PR

Run the full gate — it must pass (CI runs the same):

```bash
npm run check      # lint + typecheck + test + build
```

## Conventions

- **Voice/domain logic** (`src/voice/`, `src/data/`) is pure and unit-tested.
  Add a test for any behaviour change; the pure modules use `// @ts-check` +
  JSDoc, so keep them type-clean.
- **UI** is React function components. Interactive elements must be real
  `<button>`s (or have proper `role`/label + keyboard handling) and pass
  `jest-axe`.
- **Never** add a `VITE_`-prefixed secret. Provider calls go through the
  `/api/*` proxy.
- Format with Prettier (`npm run format`); lint must be clean.

## Tests

- Unit/component/proxy: `npm test`
- Coverage: `npm run test:coverage`
- E2E: `npx playwright install` once, then `npm run e2e`
