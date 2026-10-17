import { MarketTick, Stock } from '../types/market';
import { INITIAL_STOCKS } from './mockData';

export type TickListener = (tick: MarketTick, updatedStock: Stock) => void;

export class MarketSimulator {
  private stocks: Map<string, Stock>;
  private listeners: Set<TickListener>;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private intervalMs: number;
  private activeSymbols: Set<string>;

  constructor(initialIntervalMs: number = 800) {
    this.intervalMs = initialIntervalMs;
    this.listeners = new Set();
    this.stocks = new Map();
    this.activeSymbols = new Set();

    // Deep clone initial stocks
    Object.values(INITIAL_STOCKS).forEach((stock) => {
      this.stocks.set(stock.symbol, { ...stock, sparkline: [...stock.sparkline] });
      this.activeSymbols.add(stock.symbol);
    });
  }

  public getSnapshot(): Record<string, Stock> {
    const result: Record<string, Stock> = {};
    this.stocks.forEach((stock, symbol) => {
      result[symbol] = { ...stock, sparkline: [...stock.sparkline] };
    });
    return result;
  }

  public getStock(symbol: string): Stock | undefined {
    const stock = this.stocks.get(symbol.toUpperCase());
    return stock ? { ...stock, sparkline: [...stock.sparkline] } : undefined;
  }

  public subscribe(listener: TickListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public subscribeSymbols(symbols: string[]): void {
    symbols.forEach((sym) => this.activeSymbols.add(sym.toUpperCase()));
  }

  public unsubscribeSymbols(symbols: string[]): void {
    symbols.forEach((sym) => this.activeSymbols.delete(sym.toUpperCase()));
  }

  public start(): void {
    if (this.intervalId) return;

    this.intervalId = setInterval(() => {
      this.generateTick();
    }, this.intervalMs);
  }

  public stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  public setInterval(ms: number): void {
    this.intervalMs = ms;
    if (this.intervalId) {
      this.stop();
      this.start();
    }
  }

  /**
   * Generates a single plausible price movement tick for a random active symbol
   */
  public generateTick(): MarketTick | null {
    const availableSymbols = Array.from(this.activeSymbols).filter((s) => this.stocks.has(s));
    if (availableSymbols.length === 0) return null;

    // Pick 1-2 symbols to tick in this cycle for natural market feel
    const randomSymbol = availableSymbols[Math.floor(Math.random() * availableSymbols.length)];
    const stock = this.stocks.get(randomSymbol);
    if (!stock) return null;

    // Plausible percentage shift between -0.3% and +0.3%
    const volatility = 0.003;
    const direction = Math.random() > 0.49 ? 1 : -1;
    const magnitude = Math.random() * volatility;
    
    // Slight mean reversion force
    const reversionForce = (stock.previousClose - stock.currentPrice) * 0.001;
    const priceDelta = stock.currentPrice * (direction * magnitude) + reversionForce;
    
    // Ensure 2 decimal places and price doesn't drop below $1.00
    const rawNewPrice = stock.currentPrice + priceDelta;
    const newPrice = Number(Math.max(1.0, rawNewPrice).toFixed(2));
    
    const change = Number((newPrice - stock.previousClose).toFixed(2));
    const changePercent = Number(((change / stock.previousClose) * 100).toFixed(2));
    
    // Update daily high/low
    const high = Number(Math.max(stock.high, newPrice).toFixed(2));
    const low = Number(Math.min(stock.low, newPrice).toFixed(2));
    
    // Incremental trade volume
    const addedVolume = Math.floor(100 + Math.random() * 2500);
    const volume = stock.volume + addedVolume;

    // Update sparkline (maintain last 15 points)
    const newSparkline = [...stock.sparkline.slice(-14), newPrice];

    const updatedStock: Stock = {
      ...stock,
      currentPrice: newPrice,
      change,
      changePercent,
      high,
      low,
      volume,
      sparkline: newSparkline,
      lastUpdated: Date.now(),
    };

    this.stocks.set(randomSymbol, updatedStock);

    const tick: MarketTick = {
      symbol: randomSymbol,
      price: newPrice,
      change,
      changePercent,
      volume,
      high,
      low,
      timestamp: Date.now(),
    };

    // Notify listeners
    this.listeners.forEach((listener) => {
      try {
        listener(tick, updatedStock);
      } catch (err) {
        console.error('Error in tick listener:', err);
      }
    });

    return tick;
  }
}

// Export singleton instance for client-side fallback
export const globalClientSimulator = new MarketSimulator(900);
