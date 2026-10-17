import { Stock, OHLCVCandle, Timeframe } from '../types/market';

export const INITIAL_STOCKS: Record<string, Stock> = {
  AAPL: {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    sector: 'Technology',
    exchange: 'NASDAQ',
    currency: 'USD',
    currentPrice: 228.52,
    previousClose: 226.15,
    change: 2.37,
    changePercent: 1.05,
    high: 229.80,
    low: 225.40,
    open: 226.50,
    volume: 54231800,
    marketCap: 3480000000000,
    peRatio: 34.2,
    fiftyTwoWeekHigh: 237.23,
    fiftyTwoWeekLow: 164.08,
    sparkline: [224.1, 224.8, 225.2, 226.0, 225.8, 226.4, 227.1, 226.9, 227.5, 228.0, 227.8, 228.52],
    lastUpdated: Date.now(),
  },
  MSFT: {
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    sector: 'Technology',
    exchange: 'NASDAQ',
    currency: 'USD',
    currentPrice: 428.15,
    previousClose: 422.30,
    change: 5.85,
    changePercent: 1.39,
    high: 430.25,
    low: 421.50,
    open: 423.00,
    volume: 21340900,
    marketCap: 3180000000000,
    peRatio: 36.8,
    fiftyTwoWeekHigh: 468.35,
    fiftyTwoWeekLow: 327.20,
    sparkline: [420.5, 421.2, 422.0, 423.5, 424.0, 425.2, 426.0, 425.5, 427.1, 428.15],
    lastUpdated: Date.now(),
  },
  NVDA: {
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    sector: 'Semiconductors',
    exchange: 'NASDAQ',
    currency: 'USD',
    currentPrice: 138.45,
    previousClose: 134.90,
    change: 3.55,
    changePercent: 2.63,
    high: 140.20,
    low: 134.50,
    open: 135.20,
    volume: 89450200,
    marketCap: 3390000000000,
    peRatio: 64.5,
    fiftyTwoWeekHigh: 144.42,
    fiftyTwoWeekLow: 39.23,
    sparkline: [133.2, 134.0, 134.8, 135.5, 136.2, 135.8, 137.1, 138.0, 138.45],
    lastUpdated: Date.now(),
  },
  AMZN: {
    symbol: 'AMZN',
    name: 'Amazon.com Inc.',
    sector: 'Consumer Cyclical',
    exchange: 'NASDAQ',
    currency: 'USD',
    currentPrice: 188.75,
    previousClose: 190.20,
    change: -1.45,
    changePercent: -0.76,
    high: 191.10,
    low: 187.60,
    open: 190.00,
    volume: 38712300,
    marketCap: 1960000000000,
    peRatio: 44.1,
    fiftyTwoWeekHigh: 201.20,
    fiftyTwoWeekLow: 118.35,
    sparkline: [191.5, 191.0, 190.2, 189.8, 189.2, 188.9, 189.4, 188.75],
    lastUpdated: Date.now(),
  },
  TSLA: {
    symbol: 'TSLA',
    name: 'Tesla Inc.',
    sector: 'Automotive / Clean Energy',
    exchange: 'NASDAQ',
    currency: 'USD',
    currentPrice: 219.40,
    previousClose: 224.10,
    change: -4.70,
    changePercent: -2.10,
    high: 225.80,
    low: 217.50,
    open: 223.50,
    volume: 64120800,
    marketCap: 698000000000,
    peRatio: 61.2,
    fiftyTwoWeekHigh: 271.00,
    fiftyTwoWeekLow: 138.80,
    sparkline: [226.0, 224.5, 223.0, 221.8, 220.5, 221.2, 219.8, 219.4],
    lastUpdated: Date.now(),
  },
  GOOGL: {
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    sector: 'Communication Services',
    exchange: 'NASDAQ',
    currency: 'USD',
    currentPrice: 167.30,
    previousClose: 166.10,
    change: 1.20,
    changePercent: 0.72,
    high: 168.45,
    low: 165.80,
    open: 166.50,
    volume: 24510000,
    marketCap: 2070000000000,
    peRatio: 23.9,
    fiftyTwoWeekHigh: 191.75,
    fiftyTwoWeekLow: 120.21,
    sparkline: [165.5, 166.0, 166.2, 166.8, 167.0, 166.9, 167.3],
    lastUpdated: Date.now(),
  },
  META: {
    symbol: 'META',
    name: 'Meta Platforms Inc.',
    sector: 'Technology',
    exchange: 'NASDAQ',
    currency: 'USD',
    currentPrice: 588.60,
    previousClose: 579.20,
    change: 9.40,
    changePercent: 1.62,
    high: 592.00,
    low: 578.50,
    open: 580.00,
    volume: 15420000,
    marketCap: 1490000000000,
    peRatio: 28.7,
    fiftyTwoWeekHigh: 602.95,
    fiftyTwoWeekLow: 279.40,
    sparkline: [577.0, 580.2, 582.0, 584.5, 586.0, 585.2, 588.6],
    lastUpdated: Date.now(),
  },
  AMD: {
    symbol: 'AMD',
    name: 'Advanced Micro Devices',
    sector: 'Semiconductors',
    exchange: 'NASDAQ',
    currency: 'USD',
    currentPrice: 156.80,
    previousClose: 154.20,
    change: 2.60,
    changePercent: 1.69,
    high: 158.40,
    low: 153.80,
    open: 154.50,
    volume: 41250000,
    marketCap: 253000000000,
    peRatio: 112.4,
    fiftyTwoWeekHigh: 227.30,
    fiftyTwoWeekLow: 94.04,
    sparkline: [153.0, 154.2, 155.0, 155.8, 156.4, 156.8],
    lastUpdated: Date.now(),
  },
  NFLX: {
    symbol: 'NFLX',
    name: 'Netflix Inc.',
    sector: 'Communication Services',
    exchange: 'NASDAQ',
    currency: 'USD',
    currentPrice: 698.25,
    previousClose: 704.50,
    change: -6.25,
    changePercent: -0.89,
    high: 706.00,
    low: 695.10,
    open: 703.00,
    volume: 3820000,
    marketCap: 300000000000,
    peRatio: 42.8,
    fiftyTwoWeekHigh: 736.00,
    fiftyTwoWeekLow: 344.75,
    sparkline: [706.0, 703.5, 701.0, 699.2, 700.5, 698.25],
    lastUpdated: Date.now(),
  },
  JPM: {
    symbol: 'JPM',
    name: 'JPMorgan Chase & Co.',
    sector: 'Financial Services',
    exchange: 'NYSE',
    currency: 'USD',
    currentPrice: 221.40,
    previousClose: 219.80,
    change: 1.60,
    changePercent: 0.73,
    high: 222.50,
    low: 219.50,
    open: 220.10,
    volume: 9850000,
    marketCap: 630000000000,
    peRatio: 12.3,
    fiftyTwoWeekHigh: 225.48,
    fiftyTwoWeekLow: 135.19,
    sparkline: [219.0, 219.8, 220.4, 220.9, 221.1, 221.4],
    lastUpdated: Date.now(),
  },
};

export const DEFAULT_WATCHLIST_SYMBOLS = ['AAPL', 'MSFT', 'NVDA', 'AMZN', 'TSLA', 'GOOGL', 'META'];

/**
 * Simple pseudo-random number generator for deterministic candle generation
 */
function pseudoRandom(seed: number): () => number {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/**
 * Generate string seed into an integer
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Generates deterministic historical OHLCV data for Lightweight Charts
 */
export function generateHistoricalCandles(
  symbol: string,
  basePrice: number,
  timeframe: Timeframe
): OHLCVCandle[] {
  const seed = hashString(`${symbol}-${timeframe}`);
  const rand = pseudoRandom(seed);

  let candleCount: number;
  let intervalSeconds: number;

  switch (timeframe) {
    case '1D':
      candleCount = 78; // 6.5 hours of 5-minute candles
      intervalSeconds = 5 * 60;
      break;
    case '1W':
      candleCount = 70; // 7 days of 1-hour candles
      intervalSeconds = 60 * 60;
      break;
    case '1M':
      candleCount = 30; // 30 daily candles
      intervalSeconds = 24 * 60 * 60;
      break;
    case '3M':
      candleCount = 90; // 90 daily candles
      intervalSeconds = 24 * 60 * 60;
      break;
    case '1Y':
    default:
      candleCount = 250; // 250 trading days
      intervalSeconds = 24 * 60 * 60;
      break;
  }

  // End at the current rounded time
  const nowInSeconds = Math.floor(Date.now() / 1000);
  const startTime = nowInSeconds - candleCount * intervalSeconds;

  const candles: OHLCVCandle[] = [];
  // Calculate a reasonable starting price based on timeframe trend
  const volatility = timeframe === '1D' ? 0.003 : timeframe === '1W' ? 0.008 : 0.015;
  let runningClose = basePrice * (1 - (rand() - 0.48) * (candleCount * volatility * 0.4));

  for (let i = 0; i < candleCount; i++) {
    const time = startTime + i * intervalSeconds;
    const open = Number(runningClose.toFixed(2));
    
    // Price movement for this candle
    const deltaPercent = (rand() - 0.49) * volatility;
    let close = Number((open * (1 + deltaPercent)).toFixed(2));
    if (i === candleCount - 1) {
      // Pin the last candle's close to the current stock price
      close = basePrice;
    }

    const candleHighMax = Math.max(open, close);
    const candleLowMin = Math.min(open, close);

    const highExtra = rand() * volatility * open * 0.8;
    const lowExtra = rand() * volatility * open * 0.8;

    const high = Number((candleHighMax + highExtra).toFixed(2));
    const low = Number(Math.max(0.5, candleLowMin - lowExtra).toFixed(2));

    const baseVolume = 10000 + Math.floor(rand() * 50000);
    const volumeMultiplier = Math.abs(close - open) / (open * volatility + 0.0001);
    const volume = Math.floor(baseVolume * (1 + volumeMultiplier));

    candles.push({
      time,
      open,
      high,
      low,
      close,
      volume,
    });

    runningClose = close;
  }

  return candles;
}
