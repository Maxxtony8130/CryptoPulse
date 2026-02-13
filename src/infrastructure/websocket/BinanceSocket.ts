import type { BinanceTickerEvent } from '../../domain/models/Ticker';

const BINANCE_WS_BASE_URL = 'wss://stream.binance.com:9443/ws';
const SUBSCRIPTION_ID = 1;
const MAX_RETRY_MS = 30_000;
const BASE_RETRY_MS = 1_000;

export type SocketStatus =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'disconnected'
  | 'error';

interface ConnectionHandlers {
  onTicker: (data: BinanceTickerEvent) => void;
  onStatusChange?: (status: SocketStatus) => void;
  onReconnectScheduled?: (attempt: number, delayMs: number) => void;
}

interface BinanceControlMessage {
  result: null;
  id: number;
}

const isControlMessage = (payload: unknown): payload is BinanceControlMessage => {
  if (!payload || typeof payload !== 'object') {
    return false;
  }

  return 'result' in payload && 'id' in payload;
};

const isTickerEvent = (payload: unknown): payload is BinanceTickerEvent => {
  if (!payload || typeof payload !== 'object') {
    return false;
  }

  const candidate = payload as Partial<BinanceTickerEvent>;
  return (
    candidate.e === '24hrTicker' &&
    typeof candidate.s === 'string' &&
    typeof candidate.c === 'string' &&
    typeof candidate.p === 'string' &&
    typeof candidate.P === 'string' &&
    typeof candidate.h === 'string' &&
    typeof candidate.l === 'string' &&
    typeof candidate.v === 'string' &&
    typeof candidate.q === 'string' &&
    typeof candidate.b === 'string' &&
    typeof candidate.a === 'string' &&
    typeof candidate.B === 'string' &&
    typeof candidate.A === 'string' &&
    typeof candidate.w === 'string' &&
    typeof candidate.o === 'string' &&
    typeof candidate.x === 'string' &&
    typeof candidate.E === 'number' &&
    typeof candidate.C === 'number' &&
    typeof candidate.n === 'number'
  );
};

export const calculateBackoffDelay = (attempt: number) => {
  const backoff = Math.min(BASE_RETRY_MS * 2 ** Math.max(attempt - 1, 0), MAX_RETRY_MS);
  const jitter = Math.floor(Math.random() * 500);
  return backoff + jitter;
};

export class BinanceSocket {
  private ws: WebSocket | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempts = 0;
  private isManualDisconnect = false;
  private symbols: string[] = [];
  private handlers: ConnectionHandlers | null = null;

  connect(symbols: string[], handlers: ConnectionHandlers) {
    this.symbols = symbols;
    this.handlers = handlers;
    this.isManualDisconnect = false;
    this.openSocket(this.reconnectAttempts > 0 ? 'reconnecting' : 'connecting');
  }

  disconnect() {
    this.isManualDisconnect = true;
    this.clearReconnectTimer();

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.handlers?.onStatusChange?.('disconnected');
  }

  private openSocket(status: SocketStatus) {
    this.clearReconnectTimer();
    this.handlers?.onStatusChange?.(status);

    this.ws = new WebSocket(BINANCE_WS_BASE_URL);

    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
      this.handlers?.onStatusChange?.('connected');

      const subscriptionPayload = {
        method: 'SUBSCRIBE',
        params: this.symbols.map((symbol) => `${symbol.toLowerCase()}@ticker`),
        id: SUBSCRIPTION_ID,
      };

      this.ws?.send(JSON.stringify(subscriptionPayload));
    };

    this.ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(String(event.data)) as unknown;

        if (isControlMessage(payload)) {
          return;
        }

        if (isTickerEvent(payload)) {
          this.handlers?.onTicker(payload);
        }
      } catch {
        this.handlers?.onStatusChange?.('error');
      }
    };

    this.ws.onerror = () => {
      this.handlers?.onStatusChange?.('error');
    };

    this.ws.onclose = () => {
      this.ws = null;

      if (this.isManualDisconnect) {
        return;
      }

      this.scheduleReconnect();
    };
  }

  private scheduleReconnect() {
    this.reconnectAttempts += 1;
    this.handlers?.onStatusChange?.('reconnecting');
    const delay = calculateBackoffDelay(this.reconnectAttempts);
    this.handlers?.onReconnectScheduled?.(this.reconnectAttempts, delay);

    this.reconnectTimer = setTimeout(() => {
      this.openSocket('reconnecting');
    }, delay);
  }

  private clearReconnectTimer() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }
}
