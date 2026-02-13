import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import {
  mapBinanceEventToTicker,
  TOP_TICKER_PAIRS,
  type BinanceTickerEvent,
  type SupportedPair,
  type Ticker,
} from '../domain/models/Ticker';
import { BinanceSocket } from '../infrastructure/websocket/BinanceSocket';
import { useTickerStore } from '../store/tickerStore';
import { useAppState } from './useAppState';

const UI_FLUSH_INTERVAL_MS = 1_000;

interface RetryInfo {
  attempt: number;
  retryInSeconds: number | null;
}

interface FeedDebugStats {
  incomingMessagesPerSecond: number;
  uiFlushesPerSecond: number;
  pendingSymbols: number;
  totalMessages: number;
  totalUiFlushes: number;
}

export const useTickerFeed = (symbols: readonly SupportedPair[] = TOP_TICKER_PAIRS) => {
  const setConnectionStatus = useTickerStore((state) => state.setConnectionStatus);
  const applyTickerBatch = useTickerStore((state) => state.applyTickerBatch);

  const socketRef = useRef<BinanceSocket | null>(null);
  const pendingTickersRef = useRef<Record<string, Omit<Ticker, 'direction'>>>({});
  const lastRawEventRef = useRef<BinanceTickerEvent | null>(null);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const incomingPerSecondRef = useRef(0);
  const uiFlushesPerSecondRef = useRef(0);
  const totalMessagesRef = useRef(0);
  const totalUiFlushesRef = useRef(0);

  const [clockMs, setClockMs] = useState(Date.now());
  const [nextRetryAtMs, setNextRetryAtMs] = useState<number | null>(null);
  const [retryAttempt, setRetryAttempt] = useState(0);
  const [debugStats, setDebugStats] = useState<FeedDebugStats>({
    incomingMessagesPerSecond: 0,
    uiFlushesPerSecond: 0,
    pendingSymbols: 0,
    totalMessages: 0,
    totalUiFlushes: 0,
  });

  const symbolsKey = useMemo(() => symbols.join(','), [symbols]);
  const stableSymbols = useMemo(() => symbolsKey.split(',') as SupportedPair[], [symbolsKey]);

  const flushPendingTickers = useCallback(() => {
    const batch = Object.values(pendingTickersRef.current);
    if (!batch.length) {
      return;
    }

    pendingTickersRef.current = {};
    applyTickerBatch(batch);
    uiFlushesPerSecondRef.current += 1;
    totalUiFlushesRef.current += 1;
  }, [applyTickerBatch]);

  const disconnectSocket = useCallback(() => {
    socketRef.current?.disconnect();
    socketRef.current = null;
  }, []);

  const connectSocket = useCallback(() => {
    if (socketRef.current || appStateRef.current !== 'active') {
      return;
    }

    const socket = new BinanceSocket();
    socketRef.current = socket;

    socket.connect(stableSymbols, {
      onTicker: (event) => {
        pendingTickersRef.current[event.s] = mapBinanceEventToTicker(event);
        lastRawEventRef.current = event;
        incomingPerSecondRef.current += 1;
        totalMessagesRef.current += 1;
      },
      onStatusChange: (status) => {
        setConnectionStatus(status);
        if (status === 'connected' || status === 'disconnected' || status === 'idle') {
          setNextRetryAtMs(null);
          setRetryAttempt(0);
        }
      },
      onReconnectScheduled: (attempt, delayMs) => {
        setRetryAttempt(attempt);
        setNextRetryAtMs(Date.now() + delayMs);
      },
    });
  }, [setConnectionStatus, stableSymbols]);

  const handleAppStateChange = useCallback(
    (nextState: AppStateStatus) => {
      appStateRef.current = nextState;

      if (nextState === 'active') {
        connectSocket();
        return;
      }

      flushPendingTickers();
      disconnectSocket();
    },
    [connectSocket, disconnectSocket, flushPendingTickers]
  );

  useAppState(handleAppStateChange);

  useEffect(() => {
    setConnectionStatus('connecting');
    connectSocket();

    const flushInterval = setInterval(flushPendingTickers, UI_FLUSH_INTERVAL_MS);
    const statsInterval = setInterval(() => {
      setClockMs(Date.now());
      setDebugStats({
        incomingMessagesPerSecond: incomingPerSecondRef.current,
        uiFlushesPerSecond: uiFlushesPerSecondRef.current,
        pendingSymbols: Object.keys(pendingTickersRef.current).length,
        totalMessages: totalMessagesRef.current,
        totalUiFlushes: totalUiFlushesRef.current,
      });

      incomingPerSecondRef.current = 0;
      uiFlushesPerSecondRef.current = 0;
    }, 1_000);

    return () => {
      clearInterval(flushInterval);
      clearInterval(statsInterval);
      flushPendingTickers();
      disconnectSocket();
      setConnectionStatus('idle');
    };
  }, [connectSocket, disconnectSocket, flushPendingTickers, setConnectionStatus, symbolsKey]);

  const reconnect = useCallback(() => {
    disconnectSocket();
    connectSocket();
  }, [connectSocket, disconnectSocket]);

  const retryInfo: RetryInfo = useMemo(() => {
    if (!nextRetryAtMs) {
      return { attempt: 0, retryInSeconds: null };
    }

    return {
      attempt: retryAttempt,
      retryInSeconds: Math.max(0, Math.ceil((nextRetryAtMs - clockMs) / 1_000)),
    };
  }, [clockMs, nextRetryAtMs, retryAttempt]);

  return {
    reconnect,
    flushIntervalMs: UI_FLUSH_INTERVAL_MS,
    retryInfo,
    debugStats,
  };
};
