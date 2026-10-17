export type Timeframe = '1D' | '1W' | '1M' | '3M' | '1Y';

export interface OHLCVCandle {
  time: number; // Unix timestamp in seconds for Lightweight Charts
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Stock {
  symbol: string;
  name: string;
  sector: string;
  exchange: string;
  currency: string;
  currentPrice: number;
  previousClose: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  volume: number;
  marketCap: number;
  peRatio: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  sparkline: number[];
  lastUpdated: number;
}

export interface MarketTick {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  timestamp: number;
}

export type ConnectionStatus = 'connected' | 'connecting' | 'reconnecting' | 'disconnected' | 'error';
export type ConnectionSource = 'standalone_ws' | 'client_sim' | 'offline';

export interface MarketOverviewStats {
  totalTracked: number;
  gainersCount: number;
  losersCount: number;
  unchangedCount: number;
  topGainer: Stock | null;
  topLoser: Stock | null;
  totalMarketVolume: number;
  marketTrendPercent: number;
}

// Discriminable WebSocket Protocol Messages
export type WSClientMessage =
  | { type: 'subscribe'; symbols: string[] }
  | { type: 'unsubscribe'; symbols: string[] }
  | { type: 'ping'; timestamp: number };

export type WSServerMessage =
  | {
      type: 'welcome';
      clientId: string;
      serverTime: number;
      availableSymbols: string[];
      isSimulated: true;
    }
  | {
      type: 'snapshot';
      data: Record<string, Stock>;
    }
  | {
      type: 'tick';
      tick: MarketTick;
    }
  | {
      type: 'batch_ticks';
      ticks: MarketTick[];
    }
  | {
      type: 'pong';
      clientTimestamp: number;
      serverTimestamp: number;
    }
  | {
      type: 'error';
      message: string;
    };
