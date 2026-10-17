import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ConnectionSource,
  ConnectionStatus,
  MarketOverviewStats,
  MarketTick,
  Stock,
} from '../types/market';
import { marketDataService } from '../services/marketDataService';
import { INITIAL_STOCKS } from '../services/mockData';

export interface UseMarketDataReturn {
  stocks: Record<string, Stock>;
  selectedSymbol: string;
  selectedStock: Stock | null;
  setSelectedSymbol: (symbol: string) => void;
  connectionStatus: ConnectionStatus;
  connectionSource: ConnectionSource;
  latency: number;
  reconnect: () => void;
  marketStats: MarketOverviewStats;
  isInitialLoading: boolean;
  flashStates: Record<string, 'up' | 'down' | null>;
}

export function useMarketData(initialSymbol: string = 'AAPL'): UseMarketDataReturn {
  const [stocks, setStocks] = useState<Record<string, Stock>>(INITIAL_STOCKS);
  const [selectedSymbol, setSelectedSymbol] = useState<string>(initialSymbol);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
  const [connectionSource, setConnectionSource] = useState<ConnectionSource>('standalone_ws');
  const [latency, setLatency] = useState<number>(12);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
  const [flashStates, setFlashStates] = useState<Record<string, 'up' | 'down' | null>>({});

  useEffect(() => {
    // 1. Subscribe to status changes
    const unsubStatus = marketDataService.onStatusChange((status, source) => {
      setConnectionStatus(status);
      setConnectionSource(source);
    });

    // 2. Subscribe to latency
    const unsubLatency = marketDataService.onLatency((lat) => {
      setLatency(lat);
    });

    // 3. Subscribe to full snapshot
    const unsubSnapshot = marketDataService.onSnapshot((snapshot) => {
      setStocks((prev) => ({ ...prev, ...snapshot }));
      setIsInitialLoading(false);
    });

    // 4. Subscribe to batched ticks for smooth UI rendering
    const unsubBatch = marketDataService.onBatchTicks((ticks: MarketTick[]) => {
      setIsInitialLoading(false);

      setStocks((prev) => {
        let changed = false;
        const next = { ...prev };
        const newFlashes: Record<string, 'up' | 'down' | null> = {};

        ticks.forEach((tick) => {
          const current = next[tick.symbol];
          if (!current) return;

          changed = true;
          const direction = tick.price >= current.currentPrice ? 'up' : 'down';
          newFlashes[tick.symbol] = direction;

          next[tick.symbol] = {
            ...current,
            currentPrice: tick.price,
            change: tick.change,
            changePercent: tick.changePercent,
            high: tick.high,
            low: tick.low,
            volume: tick.volume,
            sparkline: [...current.sparkline.slice(-14), tick.price],
            lastUpdated: tick.timestamp,
          };
        });

        if (!changed) return prev;

        // Apply visual flashes
        setFlashStates((prevFlashes) => ({ ...prevFlashes, ...newFlashes }));

        // Auto clear flashes after 700ms
        setTimeout(() => {
          setFlashStates((prevFlashes) => {
            const cleared = { ...prevFlashes };
            Object.keys(newFlashes).forEach((sym) => {
              if (cleared[sym] === newFlashes[sym]) {
                cleared[sym] = null;
              }
            });
            return cleared;
          });
        }, 700);

        return next;
      });
    });

    // Initialize connection
    marketDataService.connect();

    return () => {
      unsubStatus();
      unsubLatency();
      unsubSnapshot();
      unsubBatch();
      marketDataService.disconnect();
    };
  }, []);

  const reconnect = useCallback(() => {
    marketDataService.manualReconnect();
  }, []);

  const selectedStock = useMemo(() => {
    return stocks[selectedSymbol] || null;
  }, [stocks, selectedSymbol]);

  // Compute market overview stats
  const marketStats = useMemo<MarketOverviewStats>(() => {
    const stockList = Object.values(stocks);
    if (stockList.length === 0) {
      return {
        totalTracked: 0,
        gainersCount: 0,
        losersCount: 0,
        unchangedCount: 0,
        topGainer: null,
        topLoser: null,
        totalMarketVolume: 0,
        marketTrendPercent: 0,
      };
    }

    let gainers = 0;
    let losers = 0;
    let unchanged = 0;
    let totalVol = 0;
    let sumChangePercent = 0;

    let topGainer: Stock = stockList[0];
    let topLoser: Stock = stockList[0];

    stockList.forEach((s) => {
      totalVol += s.volume;
      sumChangePercent += s.changePercent;

      if (s.changePercent > 0) gainers++;
      else if (s.changePercent < 0) losers++;
      else unchanged++;

      if (s.changePercent > topGainer.changePercent) {
        topGainer = s;
      }
      if (s.changePercent < topLoser.changePercent) {
        topLoser = s;
      }
    });

    return {
      totalTracked: stockList.length,
      gainersCount: gainers,
      losersCount: losers,
      unchangedCount: unchanged,
      topGainer: topGainer || null,
      topLoser: topLoser || null,
      totalMarketVolume: totalVol,
      marketTrendPercent: Number((sumChangePercent / stockList.length).toFixed(2)),
    };
  }, [stocks]);

  return {
    stocks,
    selectedSymbol,
    selectedStock,
    setSelectedSymbol,
    connectionStatus,
    connectionSource,
    latency,
    reconnect,
    marketStats,
    isInitialLoading,
    flashStates,
  };
}
