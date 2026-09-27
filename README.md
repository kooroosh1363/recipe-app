# RecipeRelay — Resilient Recipe Data Client

RecipeRelay modernizes the original 2023 React recipe exercise into a focused front-end engineering demo about **reliable client-side data delivery**.

Unlike a typical recipe UI project, the main subject here is not the cards. It is what happens when data is slow, stale, unavailable, retried, superseded, or restored from cache.

## What was wrong with the original project

The original repository contained:

- Create React App / `react-scripts 5`
- a temporary `salam` heading
- an almost-empty Veggie component
- a nested duplicate `.map()` in Popular that repeated the same recipes
- direct API fetch with no loading/error/abort handling
- `console.log` in the UI path
- many dependencies that were not being used meaningfully
- CRA boilerplate README
- no automated tests or CI
- a committed `.env` file containing an API credential

RecipeRelay keeps the original API-learning idea but turns it into a deliberately engineered data client.

## Core behavior

The application demonstrates:

- five-minute cache TTL
- fresh / stale / miss classification
- cached fallback
- deterministic demo fallback
- one automatic retry for transient failures
- no retry on aborted requests
- `AbortController` cancellation
- superseded refresh requests are cancelled
- request/data diagnostics shown directly in the UI
- URL-backed search state
- responsive loading, empty, and fallback states
- reduced-motion handling

## Architecture

```text
demo-recipes.js
      │
      ▼
recipe-client.js
      ├── cache read
      ├── TTL decision
      ├── optional network request
      ├── retry policy
      ├── abort propagation
      └── cache/demo fallback
      │
      ├──────────────┐
      ▼              ▼
cache.js        url-state.js
      │              │
      └───────┬──────┘
              ▼
            App.jsx
```

## Data decision flow

```text
fresh cache?
  ├─ yes → use cache immediately
  └─ no
      ↓
API key configured?
  ├─ no → stale cache or demo fallback
  └─ yes
      ↓
network request
  ├─ success → normalize + cache + render
  └─ failure → retry once
                 ├─ success → cache + render
                 └─ failure → stale cache or demo fallback
```

Aborted requests are never retried.

## URL state

Search is mirrored into the `q` query parameter:

```text
/recipe-app/?q=vegan
```

This makes the current filtered view bookmarkable and keeps state visible instead of hiding it entirely inside React memory.

## Security

The old repository committed a real API credential in `.env`.

That file has been removed from the maintained branch and replaced by:

```text
.env.example
```

However, deleting a credential from the current tree does **not** remove it from Git history. The previously committed key must be considered exposed and should be revoked/rotated.

For local experimentation:

```bash
cp .env.example .env
```

Then add your own key:

```text
VITE_SPOONACULAR_API_KEY=your_own_key
```

Important: Vite `VITE_*` values are embedded in browser code. They are not secrets. A production integration requiring a private API key should use a backend proxy.

## Local development

Requirements:

- Node.js 20+

Run:

```bash
npm install
npm run dev
```

Vite normally serves the app at:

```text
http://localhost:5173
```

## Tests

```bash
npm test
```

The suite verifies:

- fresh/stale/miss cache decisions
- cache serialization
- query-string read/write behavior
- search across title, summary, and tags
- retry after transient failure
- no retry after abort
- initial recipe loading
- URL synchronization during search
- manual refresh behavior

## Production build

```bash
npm run build
```

The optimized site is written to `dist/`.

## CI

Every pull request and push to `master` runs:

```text
npm install
   ↓
Vitest
   ↓
Vite production build
```

## GitHub Pages

A manual deployment workflow is included.

Enable once:

**Settings → Pages → Source → GitHub Actions**

Then:

**Actions → Deploy Pages → Run workflow**

## Scope

RecipeRelay is a front-end resilience and data-flow demo. It is not a production recipe service, nutrition product, account system, checkout flow, or secure credential proxy.

## License

No new license terms are introduced by this modernization.
