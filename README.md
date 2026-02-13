# CryptoPulse - High-Frequency Crypto Pulse

React Native (Expo) app that tracks top crypto pairs from Binance WebSocket with production-grade state handling and performance controls.

## Assignment Goals Covered

- Real-time WebSocket for top 10 pairs via Binance `24hrTicker`
- Clean architecture split into `domain`, `infrastructure`, `store`, and `presentation`
- UI update batching every `1000ms` while network events arrive every `250-500ms`
- Optimized list rendering with `FlashList`
- Reanimated price flash for up/down changes
- Resilience with exponential backoff reconnect + app lifecycle handling

## Tech Stack

- Expo SDK 54 + React Native
- Zustand (state management)
- Shopify FlashList (large/fast list rendering)
- React Native Reanimated + Worklets
- Vitest (unit tests)

## Project Structure

```txt
app/
  _layout.tsx
  index.tsx
src/
  domain/
    models/Ticker.ts
  infrastructure/
    websocket/BinanceSocket.ts
  hooks/
    useAppState.ts
    useTickerFeed.ts
  store/
    tickerStore.ts
  presentation/
    components/TickerCard.tsx
    screens/HomeScreen.tsx
```

## Data Flow

1. `BinanceSocket` connects and sends subscribe payload for top pairs.
2. Incoming ticker events are parsed in `mapBinanceEventToTicker`.
3. Events are buffered in-memory (`pendingTickersRef`) at high frequency.
4. Buffer is flushed into Zustand only once every `1000ms`.
5. UI reads normalized state and renders with `FlashList`.

This prevents UI thrashing while still preserving high-frequency feed ingestion.

## Performance Guardrails

- Batch write interval: `UI_FLUSH_INTERVAL_MS = 1000`
- Dev debug panel shows:
  - WebSocket messages/sec
  - UI flushes/sec
  - pending symbol count
  - total messages and total flushes

## Reconnection Strategy

- Exponential backoff with jitter:
  - `delay = min(1000 * 2^(attempt-1), 30000) + random(0..499)`
- UI shows reconnect attempt and countdown when reconnect is scheduled.

## App Lifecycle Policy

- App active: keep socket connected
- App background/inactive: flush pending data and close socket (battery-friendly)
- App foreground: reconnect automatically

## Setup

```bash
yarn install
```

## Run

```bash
yarn start
```

## Validation Commands

```bash
yarn lint
yarn test
yarn tsc --noEmit
```

## Notes

- If you see Worklets/Reanimated mismatch, run:

```bash
npx expo install react-native-worklets react-native-reanimated
npx expo start --clear
```
