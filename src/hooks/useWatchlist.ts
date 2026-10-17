import { useState, useEffect, useMemo, useCallback } from 'react';
import { Stock } from '../types/market';
import { DEFAULT_WATCHLIST_SYMBOLS, INITIAL_STOCKS } from '../services/mockData';

const STORAGE_KEY = 'pulsetrade_watchlist_symbols';

export type SortField = 'symbol' | 'price' | 'changePercent' | 'volume';
export type SortOrder = 'asc' | 'desc';

export interface UseWatchlistReturn {
  watchlistSymbols: string[];
  allAvailableSymbols: string[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortField: SortField;
  sortOrder: SortOrder;
  handleSort: (field: SortField) => void;
  addSymbol: (symbol: string) => boolean;
  removeSymbol: (symbol: string) => void;
  resetWatchlist: () => void;
  isInWatchlist: (symbol: string) => boolean;
  filteredWatchlistStocks: Stock[];
  searchResultStocks: Stock[];
}

export function useWatchlist(stocks: Record<string, Stock>): UseWatchlistReturn {
  const [watchlistSymbols, setWatchlistSymbols] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Ignore localStorage read errors
    }
    return DEFAULT_WATCHLIST_SYMBOLS;
  });

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortField, setSortField] = useState<SortField>('changePercent');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Persist watchlist changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(watchlistSymbols));
    } catch {
      // Ignore quota errors
    }
  }, [watchlistSymbols]);

  const allAvailableSymbols = useMemo(() => {
    return Object.keys(INITIAL_STOCKS);
  }, []);

  const isInWatchlist = useCallback(
    (symbol: string) => {
      return watchlistSymbols.includes(symbol.toUpperCase());
    },
    [watchlistSymbols]
  );

  const addSymbol = useCallback(
    (symbol: string) => {
      const sym = symbol.toUpperCase().trim();
      if (!sym) return false;
      if (!stocks[sym] && !INITIAL_STOCKS[sym]) return false;
      if (watchlistSymbols.includes(sym)) return false;

      setWatchlistSymbols((prev) => [...prev, sym]);
      return true;
    },
    [watchlistSymbols, stocks]
  );

  const removeSymbol = useCallback((symbol: string) => {
    const sym = symbol.toUpperCase().trim();
    setWatchlistSymbols((prev) => prev.filter((s) => s !== sym));
  }, []);

  const resetWatchlist = useCallback(() => {
    setWatchlistSymbols(DEFAULT_WATCHLIST_SYMBOLS);
  }, []);

  const handleSort = useCallback((field: SortField) => {
    setSortField((prevField) => {
      if (prevField === field) {
        setSortOrder((prevOrder) => (prevOrder === 'asc' ? 'desc' : 'asc'));
        return field;
      } else {
        setSortOrder('desc');
        return field;
      }
    });
  }, []);

  // Filtered and sorted watchlist stocks
  const filteredWatchlistStocks = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    // Map symbols to current stock objects
    const list = watchlistSymbols
      .map((sym) => stocks[sym])
      .filter((s): s is Stock => Boolean(s));

    // Filter by search query if any
    const filtered = query
      ? list.filter(
          (s) =>
            s.symbol.toLowerCase().includes(query) ||
            s.name.toLowerCase().includes(query)
        )
      : list;

    // Sort
    return [...filtered].sort((a, b) => {
      let comp = 0;
      switch (sortField) {
        case 'symbol':
          comp = a.symbol.localeCompare(b.symbol);
          break;
        case 'price':
          comp = a.currentPrice - b.currentPrice;
          break;
        case 'changePercent':
          comp = a.changePercent - b.changePercent;
          break;
        case 'volume':
          comp = a.volume - b.volume;
          break;
      }
      return sortOrder === 'asc' ? comp : -comp;
    });
  }, [watchlistSymbols, stocks, searchQuery, sortField, sortOrder]);

  // Global search results among all available stocks
  const searchResultStocks = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];

    const allStocks = Object.values(stocks);
    return allStocks
      .filter(
        (s) =>
          s.symbol.toLowerCase().includes(query) ||
          s.name.toLowerCase().includes(query) ||
          s.sector.toLowerCase().includes(query)
      )
      .slice(0, 8);
  }, [stocks, searchQuery]);

  return {
    watchlistSymbols,
    allAvailableSymbols,
    searchQuery,
    setSearchQuery,
    sortField,
    sortOrder,
    handleSort,
    addSymbol,
    removeSymbol,
    resetWatchlist,
    isInWatchlist,
    filteredWatchlistStocks,
    searchResultStocks,
  };
}
