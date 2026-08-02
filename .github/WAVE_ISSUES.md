# Stellar Wave — Pre-drafted Issues

---

## Issue 1 — Live WebSocket odds updates in MarketCard (Medium, 300pts)

**Title:** `Connect MarketList to WebSocket for real-time odds updates`

Currently odds are fetched via REST and refresh every 60s. Connect the
`MarketList` component to the backend WebSocket to receive live odds pushes
and update `MarketCard` odds in real time without a full refetch.

**Requirements:**
- Create `src/hooks/useOddsWebSocket.ts` — connects to `WS_URL`, subscribes to selected sport
- Push incoming `odds_update` events into TanStack Query cache via `queryClient.setQueryData`
- Odds values in `MarketCard` animate when they change (CSS transition on the number)
- Graceful reconnect on connection drop (exponential backoff, max 5 retries)
- Show a subtle "Live" indicator when WebSocket is connected

---

## Issue 2 — Mobile bottom sheet for bet slip (Medium, 250pts)

**Title:** `Replace mobile fixed-bottom bet slip with a swipeable bottom sheet`

The current mobile bet slip is a fixed `div` at the bottom of the screen.
Replace it with a proper bottom sheet that:

**Requirements:**
- Swipe-up to expand, swipe-down to minimize (show only selection + stake)
- Smooth spring animation (CSS or framer-motion-lite)
- Accessible: trap focus when expanded, close with Escape key
- Works at 375px, 390px, 428px viewport widths
- Does not obscure the last market card when minimized

---

## Issue 3 — My Bets: add claim payout button for winning bets (Medium, 350pts)

**Title:** `Add "Claim Payout" button to winning bets in My Bets page`

When a bet has `status === 'Won'` and the market is settled, show a
**Claim Payout** button in `BetHistoryRow`. Clicking it builds and signs a
`claim_payout` Soroban transaction via Freighter.

**Requirements:**
- Button only visible for `Won` status bets
- Builds `BettingPool.claim_payout(bet_id)` transaction using `@stellar/stellar-sdk`
- Signs with `signTx` from `src/lib/freighter.ts`
- Shows loading state during submission, success/error toast on completion
- Disables button after successful claim (optimistic update)

---

## Issue 4 — Add i18n support: English, French, Portuguese (High, 400pts)

**Title:** `Add internationalization (i18n) for EN, FR, and PT-BR`

The Stellar Wave program highlights Africa and LATAM as key regions.
Add i18n so the app is accessible to those communities.

**Requirements:**
- Use `next-intl` (compatible with Next.js 14 App Router)
- Translate all user-visible strings: nav, market cards, bet slip, pages
- Language switcher in the Navbar (EN / FR / PT)
- French (`fr`) and Brazilian Portuguese (`pt-BR`) translation files
- RTL support not required for this issue

---

## Issue 5 — Dark/light mode toggle (Low, 150pts)

**Title:** `Add system-respecting dark/light mode toggle`

Add a theme toggle to the Navbar that switches between dark (current) and
a light theme. Should default to the user's OS preference.

**Requirements:**
- Use `next-themes` with `attribute="class"`
- Light theme uses a white/off-white background with dark text
- Toggle button in Navbar with accessible label ("Switch to light mode")
- Theme persists in `localStorage`
- No flash of wrong theme on initial load

---

## Issue 6 — Add Stellar Expert deep links to bet history (Low, 100pts)

**Title:** `Link bet IDs and transactions to Stellar Expert explorer`

In `BetHistoryRow`, make the bet ID and any available `txHash` clickable
links to [Stellar Expert](https://stellar.expert/explorer/testnet).

**Requirements:**
- Bet ID links to the contract's page on Stellar Expert testnet
- If a `txHash` is available, show a small "View tx" link
- Links open in a new tab with `rel="noopener noreferrer"`
- Add aria-label: `"View bet #N on Stellar Expert"`
- No backend changes required
