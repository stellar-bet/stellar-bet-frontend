# Contributing to stellar-bet-frontend

This repo is part of the **Stellar Wave Program** — open issues tagged
`stellar-wave` carry XLM point rewards via [Drips Wave](https://drips.network/wave).

## Prerequisites

- Node.js 20+
- npm 10+
- [Freighter wallet](https://www.freighter.app/) browser extension (for manual testing)
- A running instance of `stellar-bet-backend` on port 3001

## Setup

```bash
git clone https://github.com/YOUR_ORG/stellar-bet-frontend
cd stellar-bet-frontend
npm install
cp .env.example .env.local
npm run dev
# Open http://localhost:3000
```

## Running Tests

```bash
npm run test:run
```

## Code Style

- TypeScript strict mode throughout — no `any`
- Tailwind for all styles — no inline `style=` objects
- Components: functional, named exports, `'use client'` only where needed
- Accessibility: every interactive element needs `aria-label` or visible text
- No client-side secrets — env vars prefixed `NEXT_PUBLIC_` only

## Accessibility Requirements

All UI contributions must:
- Pass keyboard navigation (Tab, Enter, Space, Escape)
- Include meaningful `aria-label` or `aria-labelledby` on buttons, inputs, regions
- Not rely on color alone to convey information (use text labels too)
- Support 200% browser zoom without horizontal scrolling

## Workflow

1. Fork → branch: `git checkout -b feat/your-feature`
2. Code + tests
3. `npm run type-check` — zero errors
4. `npm run lint` — zero errors
5. `npm run test:run` — all pass
6. PR against `main`, reference the issue: `Closes #N`

## Stellar Wave

Apply via https://drips.network/wave.
Do not claim issues by commenting.
