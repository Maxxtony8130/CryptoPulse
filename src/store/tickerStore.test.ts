import { beforeEach, describe, expect, it } from 'vitest';
import { useTickerStore } from './tickerStore';

describe('tickerStore', () => {
  beforeEach(() => {
    useTickerStore.getState().reset();
  });

  it('keeps pairs ordered by top pair list and calculates direction', () => {
    useTickerStore.getState().applyTickerBatch([
      {
        symbol: 'ETHUSDT',
        openPrice: 2000,
        lastPrice: 2100,
        weightedAveragePrice: 2050,
        previousClosePrice: 1990,
        bestBidPrice: 2099,
        bestBidQuantity: 5,
        bestAskPrice: 2100,
        bestAskQuantity: 6,
        spread: 1,
        priceChange: 100,
        priceChangePercent: 5,
        high: 2200,
        low: 1900,
        volume: 10000,
        quoteVolume: 20000,
        tradeCount: 100,
        eventTime: 1,
        closeTime: 1,
      },
      {
        symbol: 'BTCUSDT',
        openPrice: 60000,
        lastPrice: 65000,
        weightedAveragePrice: 62000,
        previousClosePrice: 59000,
        bestBidPrice: 64990,
        bestBidQuantity: 2,
        bestAskPrice: 65000,
        bestAskQuantity: 2,
        spread: 10,
        priceChange: 5000,
        priceChangePercent: 8,
        high: 66000,
        low: 58000,
        volume: 8000,
        quoteVolume: 30000,
        tradeCount: 50,
        eventTime: 2,
        closeTime: 2,
      },
    ]);

    const firstState = useTickerStore.getState();
    expect(firstState.tickerList.map((item) => item.symbol)).toEqual(['BTCUSDT', 'ETHUSDT']);
    expect(firstState.tickersBySymbol.BTCUSDT.direction).toBe('flat');

    const { direction: _direction, ...btcWithoutDirection } = firstState.tickersBySymbol.BTCUSDT;
    useTickerStore.getState().applyTickerBatch([
      {
        ...btcWithoutDirection,
        lastPrice: 64000,
      },
    ]);

    expect(useTickerStore.getState().tickersBySymbol.BTCUSDT.direction).toBe('down');
  });
});
