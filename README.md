# stellar-bet-frontend

Next.js 14 dApp for the StellarBet prediction market platform on Stellar/Soroban.

[![Next.js](https://img.shields.io/badge/Next.js-14.2.5-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue?logo=typescript)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?logo=tailwindcss)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Pages](#pages)
- [State Management](#state-management)
- [API Client](#api-client)
- [Wallet Integration](#wallet-integration)
- [Odds System](#odds-system)
- [Casino Games](#casino-games)
- [Project Structure](#project-structure)
- [Testing](#testing)
- [Security](#security)
- [License](#license)

---

## Overview

StellarBet frontend is a sports betting and casino dApp. It connects to the [stellar-bet-backend](../stellar-bet-backend) for live data and submits bets directly to Soroban contracts via the [Freighter](https://www.freighter.app/) browser wallet. Private keys never leave the browser.

**Key capabilities:**

- Live odds via the backend WebSocket feed, polled every 12–30 seconds depending on the page
- Accumulator (multi-bet) slip — up to 20 selections across different matches, combined odds calculated client-side
- Full Soroban transaction build-and-sign flow: backend builds the XDR, Freighter signs it, frontend submits it
- Preview mode: when contract addresses are not configured, all bet placements simulate a 1.2-second delay and show a testnet toast — no real transactions required to explore the UI
- 8 instant casino games with client-side provably fair RNG
- User profile stored in `localStorage` (username, avatar, currency preference)
- Odds format switcher: Decimal / Fractional / American, persisted to `localStorage`

---

## Architecture

```
stellar-bet-backend (REST + WebSocket)
         │
         │  TanStack Query (HTTP polls + stale-while-revalidate)
         ▼
 src/lib/api.ts        ← typed fetch wrappers for all backend endpoints
         │
         ├─▶ Pages / Components   ← render data, dispatch user actions
         │
         ├─▶ Zustand stores       ← shared cross-component state
         │     ├ walletStore      ← Freighter connection, address, network
         │     ├ accumStore       ← accumulator bet slip (up to 20 legs)
         │     ├ betSlipStore     ← single-bet slip (markets page)
         │     ├ oddsStore        ← odds format preference
         │     └ userStore        ← registration profile
         │
         └─▶ src/lib/freighter.ts ← all Freighter API calls isolated here
                   │
                   └─▶ Soroban contracts (via Freighter signTransaction)
```

**Transaction flow (when contracts are deployed):**

1. User clicks odds → selection added to `accumStore` or `betSlipStore`
2. User clicks "Place Bet" → `POST /api/bets/build-tx` with bet parameters
3. Backend returns unsigned Soroban transaction XDR + network passphrase
4. Frontend calls `signTx(txXdr, networkPassphrase)` via `freighter.ts`
5. Freighter shows the transaction to the user for approval
6. Signed XDR is submitted via `POST /api/bets/submit-tx`

---

## Prerequisites

- [Node.js](https://nodejs.org) 20+
- [Freighter](https://www.freighter.app/) browser extension, switched to **Testnet**
- [stellar-bet-backend](../stellar-bet-backend) running on port 3001
- Deployed contract addresses from [stellar-bet-contracts](../stellar-bet-contracts) (optional — see Preview Mode above)

---

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Copy and fill in environment variables
cp .env.example .env.local

# 3. Start dev server
npm run dev
# Open http://localhost:3000
```

Make sure `stellar-bet-backend` is running before starting the frontend.

```bash
# Type check
npm run type-check

# Lint
npm run lint

# Production build
npm run build
npm start
```

---

## Configuration

All public env vars are forwarded to the client via `next.config.mjs`. Empty contract addresses activate preview mode — the app is fully explorable without a deployed backend.

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001` | stellar-bet-backend base URL |
| `NEXT_PUBLIC_WS_URL` | `ws://localhost:3001/ws` | WebSocket endpoint |
| `NEXT_PUBLIC_STELLAR_NETWORK` | `testnet` | `testnet` or `mainnet` |
| `NEXT_PUBLIC_CONTRACT_BETTING_POOL` | _(empty)_ | BettingPool contract address |
| `NEXT_PUBLIC_CONTRACT_HOUSE_ESCROW` | _(empty)_ | HouseEscrow contract address |
| `NEXT_PUBLIC_CONTRACT_BET_TOKEN` | _(empty)_ | BetToken contract address |

> Note: `NEXT_PUBLIC_CONTRACT_ODDS_ORACLE` is not needed by the frontend — oracle reporting is handled by the backend service.

---

## Pages

| Route | Component | Description |
|---|---|---|
| `/` | `app/page.tsx` | Home: hero carousel, quick sport tabs, live watch section, featured matches table, casino strip, virtual sports strip |
| `/sports` | `app/sports/page.tsx` | Full schedule: sport/competition tab filter, team search, match rows grouped by competition, odds format switcher |
| `/match/[id]` | `app/match/[id]/page.tsx` | Single match with all available markets |
| `/live` | `app/live/page.tsx` | Live in-play matches, refetched every 12 seconds, filtered by sport |
| `/virtuals` | `app/virtuals/page.tsx` | Virtual sports with live countdown timers, refetched every 10 seconds |
| `/aviator` | `app/aviator/page.tsx` | Aviator crash game |
| `/games` | `app/games/page.tsx` | Casino lobby: all 8 games with preview canvases |
| `/games/mines` | `app/games/mines/page.tsx` | Minesweeper-style game |
| `/games/plinko` | `app/games/plinko/page.tsx` | Plinko ball-drop game |
| `/games/dice` | `app/games/dice/page.tsx` | Roll over/under a target number |
| `/games/hilo` | `app/games/hilo/page.tsx` | Higher/lower card guessing game |
| `/games/wheel` | `app/games/wheel/page.tsx` | Weighted spin wheel |
| `/games/keno` | `app/games/keno/page.tsx` | Pick numbers, 20 drawn from 40 |
| `/games/limbo` | `app/games/limbo/page.tsx` | Set a target multiplier and try to hit it |
| `/my-bets` | `app/my-bets/page.tsx` | Bet history (demo data), accumulator slip review, per-status filtering |
| `/liquidity` | `app/liquidity/page.tsx` | Pool stats, deposit form, how-it-works explainer |
| `/promotions` | `app/promotions/page.tsx` | Promotions listing |
| `/register` | `app/register/page.tsx` | Username / avatar / currency preference registration |
| `/account` | `app/account/page.tsx` | User account settings |

**Accumulator slip** (`AccumSlip`) is rendered in a sticky right-side panel on desktop (`w-72`) and as a slide-up overlay on mobile (`bottom-16`, `max-h-[72vh]`). It is present on `/`, `/sports`, `/live`, and `/virtuals`.

---

## State Management

Five Zustand stores. Persistence is noted per store.

### `walletStore` — `src/store/walletStore.ts`

Persisted to `sessionStorage` (key: `stellar-bet-wallet`). Cleared on tab close.

| State | Type | Description |
|---|---|---|
| `address` | `string \| null` | Connected Stellar G-address |
| `network` | `FreighterNetwork \| null` | `TESTNET`, `PUBLIC`, or `FUTURENET` |
| `isConnected` | `boolean` | Whether Freighter access is granted |
| `isConnecting` | `boolean` | In-flight connection request |
| `error` | `string \| null` | Last connection error message |

| Action | Description |
|---|---|
| `connect()` | Calls `requestAccess()` then `getAddress()` + `getNetwork()` |
| `disconnect()` | Clears all wallet state |
| `refresh()` | Silently checks if site is still allowed; called once on app mount |

### `accumStore` — `src/store/accumStore.ts`

Not persisted (in-memory only). Accumulator slip for multi-bet selections.

- One selection per match (adding a new pick for the same match replaces the previous one)
- Max 20 legs
- `calcAccumOdds(selections)` — product of all leg decimal odds
- `calcAccumPayout(stakeXlm, selections)` — `stakeXlm × combined decimal odds`

### `betSlipStore` — `src/store/betSlipStore.ts`

Not persisted. Single-bet slip, used on the markets page. Holds one `BetSlipItem` at a time. Default stake: 10 XLM.

### `oddsStore` — `src/store/oddsStore.ts`

Persisted to `localStorage` (key: `stellar-bet-odds-format`). Stores the user's preferred odds display format: `decimal` (default), `fractional`, or `american`.

### `userStore` — `src/store/userStore.ts`

Persisted to `localStorage` (key: `stellar-bet-user`). Stores the optional registration profile: username, avatar, currency preference, and country. Not tied to the wallet address — local only in this version.

---

## API Client

`src/lib/api.ts` exports typed fetch wrappers organized by domain. All calls go through `apiFetch<T>()`, which:

1. Prepends `NEXT_PUBLIC_API_URL`
2. Expects `{ success: boolean; data?: T; error?: string }` response shape
3. Throws if `success` is false or the response is not ok

```ts
// Examples
import { marketsApi, betsApi, liveApi, virtualsApi, scheduleApi, liquidityApi } from '@/lib/api';

const markets = await marketsApi.list();
const liveOdds = await marketsApi.liveOdds('soccer_epl');
const bets = await betsApi.getUserBets(address);
const estimate = await betsApi.estimate(10, 25000);
const live = await liveApi.all();
const schedule = await scheduleApi.all();
const virtuals = await virtualsApi.all();
const aviator = await virtualsApi.aviatorState();
const pool = await liquidityApi.stats();
```

All queries use TanStack Query with `refetchOnWindowFocus: false` and `retry: 1`. Refetch intervals vary by page sensitivity (10 seconds for virtuals, 12 seconds for live, 30 seconds for liquidity, 60 seconds for schedule).

---

## Wallet Integration

All Freighter interactions are isolated in `src/lib/freighter.ts`. Components never import `@stellar/freighter-api` directly.

| Function | Description |
|---|---|
| `isFreighterInstalled()` | Checks `isConnected()` from the extension |
| `isSiteAllowed()` | Checks if the user has previously granted access |
| `connectWallet()` | Calls `requestAccess()`, `getAddress()`, `getNetwork()`; returns `WalletState` |
| `getWalletState()` | Non-prompting check of current state; used by `walletStore.refresh()` on mount |
| `signTx(txXdr, networkPassphrase)` | Calls `signTransaction()`; returns signed XDR string |
| `validateNetwork(walletNetwork, expectedNetwork)` | Guards bet placement against wrong network |

**Wallet setup for users:**

1. Install [Freighter](https://www.freighter.app/) (Chrome/Firefox/Brave)
2. Open Freighter → Settings → Network → switch to **Testnet**
3. Fund your testnet account via [Stellar Laboratory Friendbot](https://laboratory.stellar.org/#account-creator?network=test)
4. Click "Connect Wallet" in the app

---

## Odds System

`src/lib/odds.ts` — all odds are stored and transmitted as **basis points** (bps). `10000 bps = 1.00 decimal odds`.

| Function | Description |
|---|---|
| `bpsToDecimal(bps)` | `bps / 10000` |
| `bpsToFractional(bps)` | e.g. `25000 → "3/2"` via GCD reduction |
| `bpsToAmerican(bps)` | e.g. `25000 → "+150"`, `15000 → "-200"` |
| `formatOdds(bps, format)` | Dispatches to the above based on the user's `oddsStore` preference |
| `calcPayoutFromBps(stakeXlm, oddsBps)` | `stakeXlm × oddsBps / 10000` |
| `impliedProbability(oddsBps)` | `(1 / decimal) × 100` as a percentage string |

**Constraints (enforced by the BettingPool contract):** minimum 1.01x (10100 bps), maximum 50x (500000 bps).

---

## Casino Games

All 8 games use a **provably fair commit-reveal scheme** backed by the backend, with a **5% house edge** applied via `applyEdge()` in `src/lib/gameUtils.ts`.

### Provably fair flow

1. Before each round the frontend calls `POST /api/games/commit` — the server generates a random 256-bit `serverSeed` and returns `sha256(serverSeed)` as a commitment. The server cannot change the seed after this point.
2. The frontend sends the player's `clientSeed` (editable in the controls panel) via `POST /api/games/reveal`. The server returns the `serverSeed` and `resultBytes = HMAC-SHA256(serverSeed, clientSeed:nonce)`.
3. Game outcomes are derived deterministically from `resultBytes` using `resultBytesToFloats()` in `src/lib/gameUtils.ts`.
4. Players can independently verify any past round via `POST /api/games/verify` or by computing `HMAC-SHA256(serverSeed, clientSeed:nonce)` themselves and confirming it matches the published `resultBytes`.

Each game page shows a collapsible **🔐 Provably Fair** panel after every round with the full `serverSeed`, `serverSeedHash`, `clientSeed`, `nonce`, and `resultBytes`. The `useProvablyFair` hook in `src/hooks/useProvablyFair.ts` manages the full commit-reveal lifecycle.

| Game | Route | Mechanic | Max Win |
|---|---|---|---|
| Aviator | `/aviator` | Crash game — cash out before the multiplier resets. Pareto-like RNG, ~5% of rounds crash at 1.00x | 100x+ |
| Mines | `/games/mines` | Pick safe tiles on a 5×5 grid avoiding bombs. Multiplier calculated from hypergeometric probability | ~500x |
| Plinko | `/games/plinko` | Drop ball through 8 rows of pegs into multiplier buckets | 29x |
| Dice | `/games/dice` | Roll over/under a target (1–99). Set your own win chance | 99x |
| HiLo | `/games/hilo` | Guess higher/lower than the current card. Multiplier from remaining deck probability | ~26x |
| Wheel | `/games/wheel` | 7-segment weighted wheel (1.5x/2x/3x/5x/10x/0x/1x) | 10x |
| Keno | `/games/keno` | Pick 1–10 numbers; 20 drawn from 40. Payout from `KENO_MULTIPLIERS` lookup table | 2000x |
| Limbo | `/games/limbo` | Set a target multiplier; RNG result must exceed it | 1000x |

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx            # Root layout: TopBar, LiveTicker, SportsSidebar, MobileNav, Toaster
│   ├── providers.tsx         # QueryClientProvider + WalletRefresher (silent reconnect on mount)
│   ├── page.tsx              # Home page
│   ├── aviator/              # Aviator crash game page
│   ├── games/                # Casino lobby + 7 individual game pages
│   ├── live/                 # Live in-play page
│   ├── liquidity/            # Liquidity pool page
│   ├── match/[id]/           # Match detail page
│   ├── my-bets/              # Bet history + bet slip review
│   ├── promotions/           # Promotions page
│   ├── register/             # User registration
│   ├── sports/               # Full schedule + sport tabs
│   └── virtuals/             # Virtual sports page
├── components/
│   ├── aviator/              # AviatorGame — full game loop component
│   ├── betslip/              # BetSlip — single-bet slip for markets page
│   ├── dashboard/            # BetHistoryRow, StatsBar
│   ├── games/                # GameLayout — shared shell for casino games
│   ├── home/                 # FeaturedBanner, HeroCarousel
│   ├── layout/               # Footer, MobileNav, Navbar, SportsSidebar, TopBar
│   ├── live/                 # LiveMatchCard, LiveTicker (scrolling banner), LiveWatchSection
│   ├── markets/              # MarketCard, MarketList, SportFilter
│   ├── schedule/             # AccumSlip, CompetitionGroup, MatchRow
│   ├── ui/                   # Badge, Button, Card, Skeleton (base UI primitives)
│   └── virtuals/             # VirtualGameCard
├── lib/
│   ├── api.ts                # Typed fetch wrappers + all API types
│   ├── constants.ts          # API_URL, WS_URL, CONTRACT_IDS, sport/status labels
│   ├── freighter.ts          # All Freighter wallet calls
│   ├── gameUtils.ts          # Casino RNG, house edge, Mines/Keno/HiLo math, card deck
│   ├── odds.ts               # Odds conversions: bps ↔ decimal/fractional/american
│   └── utils.ts              # cn(), calcPayout(), formatXlm(), general helpers
└── store/
    ├── accumStore.ts         # Accumulator (multi-bet) slip
    ├── betSlipStore.ts       # Single-bet slip
    ├── oddsStore.ts          # Odds format preference
    ├── userStore.ts          # User registration profile
    └── walletStore.ts        # Freighter wallet state
```

---

## Testing

```bash
# Run tests (single pass)
npm run test:run

# Jest watch mode
npm test
```

Tests use [Jest](https://jestjs.io) + [React Testing Library](https://testing-library.com) with `jest-environment-jsdom`. The app passes `--passWithNoTests` so CI does not fail before test coverage is added.

---

---

## Security

This is **testnet software**. Do not use real funds until a full security audit is complete. See [SECURITY.md](./SECURITY.md) for responsible disclosure guidelines.

Key notes:
- Private keys never leave the browser — all signing happens inside Freighter
- Wallet state is persisted to `sessionStorage`, not `localStorage`, so it clears on tab close
- Contract addresses are the only sensitive config; they are public by design on Stellar
- The casino RNG is client-side only — in production it must be provably fair and server-verified

---

## License

MIT
