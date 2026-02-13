export type PriceDirection = 'up' | 'down' | 'flat';

export const TOP_TICKER_PAIRS = [
  'BTCUSDT',
  'ETHUSDT',
  'SOLUSDT',
  'BNBUSDT',
  'XRPUSDT',
  'ADAUSDT',
  'DOGEUSDT',
  'AVAXUSDT',
  'LINKUSDT',
  'DOTUSDT',
] as const;

export type SupportedPair = (typeof TOP_TICKER_PAIRS)[number];

export interface BinanceTickerEvent {
  e: '24hrTicker';
  E: number;
  C: number;
  s: string;
  o: string;
  p: string;
  P: string;
  w: string;
  x: string;
  c: string;
  b: string;
  B: string;
  a: string;
  A: string;
  h: string;
  l: string;
  v: string;
  q: string;
  n: number;
}

export interface Ticker {
  symbol: string;
  openPrice: number;
  lastPrice: number;
  weightedAveragePrice: number;
  previousClosePrice: number;
  bestBidPrice: number;
  bestBidQuantity: number;
  bestAskPrice: number;
  bestAskQuantity: number;
  spread: number;
  priceChange: number;
  priceChangePercent: number;
  high: number;
  low: number;
  volume: number;
  quoteVolume: number;
  tradeCount: number;
  eventTime: number;
  closeTime: number;
  direction: PriceDirection;
}

const safeNumber = (value: string): number => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const mapBinanceEventToTicker = (event: BinanceTickerEvent): Omit<Ticker, 'direction'> => {
  const bestBidPrice = safeNumber(event.b);
  const bestAskPrice = safeNumber(event.a);

  return {
    symbol: event.s,
    openPrice: safeNumber(event.o),
    lastPrice: safeNumber(event.c),
    weightedAveragePrice: safeNumber(event.w),
    previousClosePrice: safeNumber(event.x),
    bestBidPrice,
    bestBidQuantity: safeNumber(event.B),
    bestAskPrice,
    bestAskQuantity: safeNumber(event.A),
    spread: Math.max(bestAskPrice - bestBidPrice, 0),
    priceChange: safeNumber(event.p),
    priceChangePercent: safeNumber(event.P),
    high: safeNumber(event.h),
    low: safeNumber(event.l),
    volume: safeNumber(event.v),
    quoteVolume: safeNumber(event.q),
    tradeCount: event.n,
    eventTime: event.E,
    closeTime: event.C,
  };
};
