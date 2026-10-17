import { describe, it, expect } from 'vitest';
import { MarketSimulator } from '../services/marketSimulator';
import { generateHistoricalCandles, INITIAL_STOCKS } from '../services/mockData';

describe('Market Simulator & Historical Data Generator', () => {
  it('initializes with default seeded stocks', () => {
    const simulator = new MarketSimulator(500);
    const snapshot = simulator.getSnapshot();

    expect(Object.keys(snapshot).length).toBeGreaterThanOrEqual(5);
    expect(snapshot['AAPL']).toBeDefined();
    expect(snapshot['MSFT']).toBeDefined();
    expect(snapshot['NVDA']).toBeDefined();
    expect(snapshot['AAPL'].currentPrice).toBe(INITIAL_STOCKS['AAPL'].currentPrice);
  });

  it('generates plausible ticks with valid price movements', () => {
    const simulator = new MarketSimulator(100);
    const tick = simulator.generateTick();

    expect(tick).not.toBeNull();
    if (tick) {
      expect(tick.symbol).toBeDefined();
      expect(tick.price).toBeGreaterThan(0);
      expect(tick.volume).toBeGreaterThan(0);
      expect(tick.high).toBeGreaterThanOrEqual(tick.price);
      expect(tick.low).toBeLessThanOrEqual(tick.price);
      expect(tick.timestamp).toBeGreaterThan(0);
    }
  });

  it('notifies registered subscribers when ticks occur', () => {
    const simulator = new MarketSimulator(100);
    let receivedTick = false;

    const unsubscribe = simulator.subscribe((tick, stock) => {
      receivedTick = true;
      expect(tick.symbol).toBe(stock.symbol);
    });

    simulator.generateTick();
    expect(receivedTick).toBe(true);

    unsubscribe();
  });

  describe('generateHistoricalCandles', () => {
    const timeframes = ['1D', '1W', '1M', '3M', '1Y'] as const;

    timeframes.forEach((tf) => {
      it(`generates mathematically valid OHLCV candles for ${tf} timeframe`, () => {
        const candles = generateHistoricalCandles('AAPL', 228.5, tf);

        expect(candles.length).toBeGreaterThan(10);

        candles.forEach((candle, idx) => {
          // OHLC structural rules
          expect(candle.high).toBeGreaterThanOrEqual(Math.max(candle.open, candle.close));
          expect(candle.low).toBeLessThanOrEqual(Math.min(candle.open, candle.close));
          expect(candle.volume).toBeGreaterThan(0);
          expect(candle.open).toBeGreaterThan(0);
          expect(candle.close).toBeGreaterThan(0);

          // Chronological time order
          if (idx > 0) {
            expect(candle.time).toBeGreaterThan(candles[idx - 1].time);
          }
        });
      });
    });
  });
});
