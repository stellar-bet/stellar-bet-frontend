# stellar-bet-frontend

> Next.js 14 dApp for the StellarBet prediction market platform.

[![Stellar Wave Program](https://img.shields.io/badge/Stellar%20Wave-Active-blue?logo=stellar)](https://drips.network/wave)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org)
[![Freighter](https://img.shields.io/badge/Wallet-Freighter-purple)](https://www.freighter.app/)

## Features

- Live odds from The Odds API via the backend WebSocket feed
- Freighter wallet connect — non-custodial, browser extension
- Bet slip — single click to select an outcome, set stake, place bet
- Full Soroban transaction build + sign flow (no private keys on server)
- My Bets dashboard — full history with status indicators
- Liquidity page — deposit XLM to earn protocol fees
- Mobile-first, fully accessible (ARIA labels, keyboard nav)

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 App Router |
| Styling | Tailwind CSS |
| State | Zustand |
| Data fetching | TanStack Query |
| Wallet | Freighter (@stellar/freighter-api) |
| Stellar SDK | @stellar/stellar-sdk |

## Getting Started

```bash
cp .env.example .env.local
# Fill in contract addresses after deploying stellar-bet-contracts

npm install
npm run dev
# Open http://localhost:3000
```

Make sure `stellar-bet-backend` is running on port 3001.

## Pages

| Route | Description |
|---|---|
| `/` | Live markets, sport filter, bet slip |
| `/my-bets` | Bet history for connected wallet |
| `/liquidity` | Provide liquidity, pool stats |

## Wallet Setup

1. Install [Freighter](https://www.freighter.app/) browser extension
2. Switch to **Testnet** in Freighter settings
3. Fund your testnet account via [Friendbot](https://laboratory.stellar.org/#account-creator?network=test)
4. Click "Connect Wallet" in the app

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md). Open issues tagged `stellar-wave` carry point rewards.

## License

MIT
