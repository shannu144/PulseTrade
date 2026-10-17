import {
  ConnectionSource,
  ConnectionStatus,
  MarketTick,
  Stock,
  WSClientMessage,
  WSServerMessage,
} from '../types/market';
import { globalClientSimulator } from './marketSimulator';
import { INITIAL_STOCKS } from './mockData';

export type StatusListener = (status: ConnectionStatus, source: ConnectionSource) => void;
export type TickListener = (tick: MarketTick) => void;
export type BatchTickListener = (ticks: MarketTick[]) => void;
export type SnapshotListener = (snapshot: Record<string, Stock>) => void;
export type LatencyListener = (latencyMs: number) => void;

export class MarketDataService {
  private wsUrl: string;
  private ws: WebSocket | null = null;
  private status: ConnectionStatus = 'disconnected';
  private source: ConnectionSource = 'offline';
  
  private statusListeners: Set<StatusListener> = new Set();
  private tickListeners: Set<TickListener> = new Set();
  private batchTickListeners: Set<BatchTickListener> = new Set();
  private snapshotListeners: Set<SnapshotListener> = new Set();
  private latencyListeners: Set<LatencyListener> = new Set();

  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private pingIntervalId: ReturnType<typeof setInterval> | null = null;
  
  private subscribedSymbols: Set<string> = new Set(Object.keys(INITIAL_STOCKS));
  private fallbackSimulatorActive = false;
  private fallbackUnsubscribe: (() => void) | null = null;
  private enableFallback = true;
  private isExplicitDisconnect = false;

  // Batching queue for high-frequency ticks
  private pendingTicks: MarketTick[] = [];
  private batchRafId: number | null = null;

  constructor(
    wsUrl: string = import.meta.env.VITE_WS_URL || 'ws://localhost:8080',
    enableFallback: boolean = import.meta.env.VITE_ENABLE_CLIENT_SIMULATOR_FALLBACK !== 'false'
  ) {
    this.wsUrl = wsUrl;
    this.enableFallback = enableFallback;
  }

  public getStatus(): ConnectionStatus {
    return this.status;
  }

  public getSource(): ConnectionSource {
    return this.source;
  }

  public onStatusChange(listener: StatusListener): () => void {
    this.statusListeners.add(listener);
    listener(this.status, this.source);
    return () => this.statusListeners.delete(listener);
  }

  public onTick(listener: TickListener): () => void {
    this.tickListeners.add(listener);
    return () => this.tickListeners.delete(listener);
  }

  public onBatchTicks(listener: BatchTickListener): () => void {
    this.batchTickListeners.add(listener);
    return () => this.batchTickListeners.delete(listener);
  }

  public onSnapshot(listener: SnapshotListener): () => void {
    this.snapshotListeners.add(listener);
    return () => this.snapshotListeners.delete(listener);
  }

  public onLatency(listener: LatencyListener): () => void {
    this.latencyListeners.add(listener);
    return () => this.latencyListeners.delete(listener);
  }

  public connect(): void {
    this.isExplicitDisconnect = false;

    // Check if browser is online
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      this.setStatus('error', 'offline');
      return;
    }

    this.setStatus(this.reconnectAttempts > 0 ? 'reconnecting' : 'connecting', 'standalone_ws');

    try {
      this.ws = new WebSocket(this.wsUrl);

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        this.setStatus('connected', 'standalone_ws');
        this.stopFallbackSimulator();

        // Send subscriptions
        this.sendMessage({
          type: 'subscribe',
          symbols: Array.from(this.subscribedSymbols),
        });

        this.startHeartbeat();
      };

      this.ws.onmessage = (event: MessageEvent) => {
        try {
          const message: WSServerMessage = JSON.parse(event.data);
          this.handleServerMessage(message);
        } catch (err) {
          console.warn('Failed to parse WebSocket message:', err);
        }
      };

      this.ws.onerror = () => {
        // Handled in onclose
      };

      this.ws.onclose = () => {
        this.stopHeartbeat();
        this.ws = null;

        if (this.isExplicitDisconnect) {
          this.setStatus('disconnected', 'offline');
          return;
        }

        // Try reconnecting or fallback
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          const delay = Math.min(1000 * Math.pow(1.5, this.reconnectAttempts), 10000);
          this.setStatus('reconnecting', 'standalone_ws');

          this.reconnectTimeoutId = setTimeout(() => {
            this.connect();
          }, delay);
        } else {
          // Exceeded retry attempts: if fallback enabled, switch to client simulation
          if (this.enableFallback && !this.fallbackSimulatorActive) {
            console.info('Standalone WebSocket unavailable. Activating internal client market simulator.');
            this.startFallbackSimulator();
          } else {
            this.setStatus('error', 'offline');
          }
        }
      };
    } catch {
      if (this.enableFallback) {
        this.startFallbackSimulator();
      } else {
        this.setStatus('error', 'offline');
      }
    }
  }

  public disconnect(): void {
    this.isExplicitDisconnect = true;
    this.stopHeartbeat();
    this.clearReconnectTimeout();
    this.stopFallbackSimulator();

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.setStatus('disconnected', 'offline');
  }

  public manualReconnect(): void {
    this.disconnect();
    this.reconnectAttempts = 0;
    this.connect();
  }

  public subscribe(symbol: string): void {
    const sym = symbol.toUpperCase();
    this.subscribedSymbols.add(sym);

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.sendMessage({
        type: 'subscribe',
        symbols: [sym],
      });
    }

    if (this.fallbackSimulatorActive) {
      globalClientSimulator.subscribeSymbols([sym]);
    }
  }

  public unsubscribe(symbol: string): void {
    const sym = symbol.toUpperCase();
    this.subscribedSymbols.delete(sym);

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.sendMessage({
        type: 'unsubscribe',
        symbols: [sym],
      });
    }

    if (this.fallbackSimulatorActive) {
      globalClientSimulator.unsubscribeSymbols([sym]);
    }
  }

  private sendMessage(msg: WSClientMessage): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
    }
  }

  private handleServerMessage(message: WSServerMessage): void {
    switch (message.type) {
      case 'welcome':
        break;

      case 'snapshot':
        this.snapshotListeners.forEach((listener) => listener(message.data));
        break;

      case 'tick':
        this.queueTick(message.tick);
        break;

      case 'batch_ticks':
        message.ticks.forEach((t) => this.queueTick(t));
        break;

      case 'pong': {
        const now = Date.now();
        const latency = Math.max(1, Math.round(now - message.clientTimestamp));
        this.latencyListeners.forEach((listener) => listener(latency));
        break;
      }

      case 'error':
        console.warn('Server reported error:', message.message);
        break;
    }
  }

  /**
   * Queue ticks and flush via requestAnimationFrame to avoid micro-lag on UI
   */
  private queueTick(tick: MarketTick): void {
    this.pendingTicks.push(tick);

    // Call individual tick listener immediately for critical subscribers (e.g. chart)
    this.tickListeners.forEach((listener) => listener(tick));

    if (this.batchRafId === null) {
      if (typeof window !== 'undefined' && window.requestAnimationFrame) {
        this.batchRafId = window.requestAnimationFrame(() => this.flushTicks());
      } else {
        this.flushTicks();
      }
    }
  }

  private flushTicks(): void {
    this.batchRafId = null;
    if (this.pendingTicks.length === 0) return;

    const ticksToFlush = [...this.pendingTicks];
    this.pendingTicks = [];

    this.batchTickListeners.forEach((listener) => listener(ticksToFlush));
  }

  private setStatus(status: ConnectionStatus, source: ConnectionSource): void {
    this.status = status;
    this.source = source;
    this.statusListeners.forEach((listener) => listener(status, source));
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.pingIntervalId = setInterval(() => {
      this.sendMessage({
        type: 'ping',
        timestamp: Date.now(),
      });
    }, 10000);
  }

  private stopHeartbeat(): void {
    if (this.pingIntervalId) {
      clearInterval(this.pingIntervalId);
      this.pingIntervalId = null;
    }
  }

  private clearReconnectTimeout(): void {
    if (this.reconnectTimeoutId) {
      clearTimeout(this.reconnectTimeoutId);
      this.reconnectTimeoutId = null;
    }
  }

  private startFallbackSimulator(): void {
    if (this.fallbackSimulatorActive) return;
    this.fallbackSimulatorActive = true;
    this.setStatus('connected', 'client_sim');

    // Emit initial snapshot from simulator
    const snapshot = globalClientSimulator.getSnapshot();
    this.snapshotListeners.forEach((listener) => listener(snapshot));

    // Listen to ticks from simulator
    this.fallbackUnsubscribe = globalClientSimulator.subscribe((tick) => {
      this.queueTick(tick);
    });

    globalClientSimulator.start();

    // Fake latency for client simulator (sub-5ms)
    this.latencyListeners.forEach((listener) => listener(2));
  }

  private stopFallbackSimulator(): void {
    if (!this.fallbackSimulatorActive) return;
    this.fallbackSimulatorActive = false;

    if (this.fallbackUnsubscribe) {
      this.fallbackUnsubscribe();
      this.fallbackUnsubscribe = null;
    }
    globalClientSimulator.stop();
  }
}

// Global market data service singleton instance
export const marketDataService = new MarketDataService();
