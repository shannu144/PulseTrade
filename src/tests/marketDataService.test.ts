import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MarketDataService } from '../services/marketDataService';
import { Stock, MarketTick } from '../types/market';

describe('MarketDataService', () => {
  let service: MarketDataService;

  beforeEach(() => {
    service = new MarketDataService('ws://localhost:9999', false);
  });

  it('initializes with disconnected status', () => {
    expect(service.getStatus()).toBe('disconnected');
  });

  it('registers status change listener and receives current status', () => {
    const statusListener = vi.fn();
    const unsub = service.onStatusChange(statusListener);

    expect(statusListener).toHaveBeenCalledWith('disconnected', 'offline');
    unsub();
  });

  it('dispatches ticks to tick listeners', () => {
    const tickListener = vi.fn();
    const unsub = service.onTick(tickListener);

    const testTick: MarketTick = {
      symbol: 'AAPL',
      price: 230.5,
      change: 2.0,
      changePercent: 0.88,
      volume: 100000,
      high: 231.0,
      low: 228.0,
      timestamp: Date.now(),
    };

    // Private method access for unit test simulation
    (service as any).queueTick(testTick);

    expect(tickListener).toHaveBeenCalledWith(testTick);
    unsub();
  });

  it('parses snapshot messages and notifies snapshot subscribers', () => {
    const snapshotListener = vi.fn();
    const unsub = service.onSnapshot(snapshotListener);

    const mockSnapshot: Record<string, Stock> = {
      AAPL: {
        symbol: 'AAPL',
        name: 'Apple Inc.',
        sector: 'Technology',
        exchange: 'NASDAQ',
        currency: 'USD',
        currentPrice: 228.0,
        previousClose: 225.0,
        change: 3.0,
        changePercent: 1.33,
        high: 229.0,
        low: 224.0,
        open: 225.5,
        volume: 500000,
        marketCap: 3000000000000,
        peRatio: 30,
        fiftyTwoWeekHigh: 235,
        fiftyTwoWeekLow: 165,
        sparkline: [225, 226, 228],
        lastUpdated: Date.now(),
      },
    };

    (service as any).handleServerMessage({
      type: 'snapshot',
      data: mockSnapshot,
    });

    expect(snapshotListener).toHaveBeenCalledWith(mockSnapshot);
    unsub();
  });

  it('calculates latency upon receiving pong message', () => {
    const latencyListener = vi.fn();
    const unsub = service.onLatency(latencyListener);

    const clientTimestamp = Date.now() - 25; // 25ms simulated roundtrip
    (service as any).handleServerMessage({
      type: 'pong',
      clientTimestamp,
      serverTimestamp: Date.now() - 10,
    });

    expect(latencyListener).toHaveBeenCalled();
    const latencyArg = latencyListener.mock.calls[0][0];
    expect(latencyArg).toBeGreaterThanOrEqual(1);

    unsub();
  });
});
