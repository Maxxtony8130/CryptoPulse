# CryptoPulse

High-frequency crypto ticker app built with Expo + React Native.

Tracks top 10 Binance pairs in real-time, batches UI updates to avoid thrashing, and handles reconnect/lifecycle like a production mobile app.

## Highlights

- Live Binance WebSocket stream for top 10 pairs (`24hrTicker`)
- Clean architecture (Domain / Infrastructure / Application-State / Presentation)
- Zustand store with controlled UI batching (`1000ms` flush window)
- `FlashList` rendering + Reanimated price flash (green on up, red on down)
- Exponential backoff reconnect with jitter + retry countdown in UI
- AppState-aware socket behavior (disconnect in background, reconnect on active)
- System dark/light mode support with theme-aware status bar
- Finance-friendly number formatting (price precision, compact volume, spread in bps)
- Unit tests for mapper, store logic, and backoff strategy

## Stack

- Expo SDK 54
- React Native 0.81
- Zustand
- `@shopify/flash-list`
- `react-native-reanimated` + `react-native-worklets`
- Vitest

## Architecture

```txt
app/
  _layout.tsx                # routing shell + status bar + themed background
  index.tsx                  # entry route -> HomeScreen

src/
  domain/
    models/Ticker.ts         # payload contracts + parsed model + mapper

  infrastructure/
    websocket/BinanceSocket.ts  # ws connect/subscribe/parse/reconnect

  hooks/
    useAppState.ts           # app lifecycle listener
    useTickerFeed.ts         # stream orchestration + batching + retry metadata

  store/
    tickerStore.ts           # normalized state + direction + ordered list

  presentation/
    screens/HomeScreen.tsx   # status, metrics strip, list container
    components/TickerCard.tsx # per-ticker UI + Reanimated flash
    theme/appTheme.ts        # dark/light theme tokens
    utils/numberFormat.ts    # numeric formatting helpers
```

## Data Pipeline

1. `HomeScreen` starts `useTickerFeed`.
2. `useTickerFeed` opens `BinanceSocket`.
3. Socket subscribes to:
   - `btcusdt@ticker`, `ethusdt@ticker`, ..., `dotusdt@ticker`
4. Incoming raw payload is mapped by `mapBinanceEventToTicker`.
5. Events are buffered in memory (`pendingTickersRef`) at high frequency.
6. Every 1000ms, one batched store write updates UI state.
7. `FlashList` renders `tickerList`; `TickerCard` animates price direction changes.

## Performance Strategy

- Input can arrive many times per second.
- UI commits only once per second.
- This reduces re-renders and keeps list animation smooth under load.

## Resilience Strategy

- Reconnect delay:
  - `min(1000 * 2^(attempt-1), 30000) + jitter(0..499ms)`
- Retry attempt and countdown are exposed in UI.
- Background/inactive:
  - flush pending data
  - close socket (battery/network friendly)
- Active:
  - reconnect automatically

## Theme and Status Bar

- App follows system theme using `useColorScheme()`.
- `app/_layout.tsx` sets theme-aware `StatusBar` and screen background.
- All screen/card colors come from centralized tokens in `appTheme.ts`.

## Scripts

```bash
yarn start
yarn android
yarn ios
yarn web
yarn lint
yarn test
yarn tsc --noEmit
```

## Setup

```bash
yarn install
yarn start
```

## Troubleshooting

If Worklets/Reanimated version mismatch appears:

```bash
npx expo install react-native-worklets react-native-reanimated
npx expo start --clear
```

If simulator still shows old native binaries, reinstall the app and rerun.
