import { create } from 'zustand';
import type { SocketStatus } from '../infrastructure/websocket/BinanceSocket';
import type { Ticker } from '../domain/models/Ticker';
import { TOP_TICKER_PAIRS } from '../domain/models/Ticker';

interface TickerStore {
  tickersBySymbol: Record<string, Ticker>;
  tickerList: Ticker[];
  connectionStatus: SocketStatus;
  lastUiFlushAt: number | null;
  applyTickerBatch: (incomingTickers: Omit<Ticker, 'direction'>[]) => void;
  setConnectionStatus: (status: SocketStatus) => void;
  reset: () => void;
}

export const useTickerStore = create<TickerStore>((set) => ({
  tickersBySymbol: {},
  tickerList: [],
  connectionStatus: 'idle',
  lastUiFlushAt: null,
  applyTickerBatch: (incomingTickers) => {
    set((state) => {
      const nextBySymbol = { ...state.tickersBySymbol };

      for (const nextTicker of incomingTickers) {
        const previousTicker = state.tickersBySymbol[nextTicker.symbol];
        const previousPrice = previousTicker?.lastPrice ?? nextTicker.lastPrice;
        const direction: Ticker['direction'] =
          nextTicker.lastPrice > previousPrice
            ? 'up'
            : nextTicker.lastPrice < previousPrice
            ? 'down'
            : 'flat';

        nextBySymbol[nextTicker.symbol] = {
          ...nextTicker,
          direction,
        };
      }

      const tickerList = TOP_TICKER_PAIRS.map((pair) => nextBySymbol[pair]).filter(
        (ticker): ticker is Ticker => Boolean(ticker)
      );

      return {
        tickersBySymbol: nextBySymbol,
        tickerList,
        lastUiFlushAt: Date.now(),
      };
    });
  },
  setConnectionStatus: (status) => {
    set({ connectionStatus: status });
  },
  reset: () => {
    set({
      tickersBySymbol: {},
      tickerList: [],
      connectionStatus: 'idle',
      lastUiFlushAt: null,
    });
  },
}));
