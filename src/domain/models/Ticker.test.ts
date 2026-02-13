import { describe, expect, it } from 'vitest';
import { mapBinanceEventToTicker } from './Ticker';

describe('mapBinanceEventToTicker', () => {
  it('maps Binance payload into parsed ticker model', () => {
    const mapped = mapBinanceEventToTicker({
      e: '24hrTicker',
      E: 1770995214576,
      C: 1770995214573,
      s: 'DOGEUSDT',
      o: '0.09362000',
      p: '0.00048000',
      P: '0.513',
      w: '0.09275569',
      x: '0.09361000',
      c: '0.09410000',
      b: '0.09410000',
      B: '39380.00000000',
      a: '0.09411000',
      A: '59598.00000000',
      h: '0.09455000',
      l: '0.09069000',
      v: '600551498.00000000',
      q: '55704571.50478000',
      n: 809750,
    });

    expect(mapped.symbol).toBe('DOGEUSDT');
    expect(mapped.lastPrice).toBeCloseTo(0.0941);
    expect(mapped.priceChangePercent).toBeCloseTo(0.513);
    expect(mapped.bestBidPrice).toBeCloseTo(0.0941);
    expect(mapped.bestAskPrice).toBeCloseTo(0.09411);
    expect(mapped.spread).toBeCloseTo(0.00001);
    expect(mapped.tradeCount).toBe(809750);
    expect(mapped.closeTime).toBe(1770995214573);
  });
});
