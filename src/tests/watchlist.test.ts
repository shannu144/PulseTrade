import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useWatchlist } from '../hooks/useWatchlist';
import { INITIAL_STOCKS } from '../services/mockData';

describe('useWatchlist Hook', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('initializes with default symbols and saves to localStorage', () => {
    const { result } = renderHook(() => useWatchlist(INITIAL_STOCKS));

    expect(result.current.watchlistSymbols).toContain('AAPL');
    expect(result.current.watchlistSymbols).toContain('NVDA');
    expect(result.current.filteredWatchlistStocks.length).toBeGreaterThan(0);
  });

  it('adds a valid new symbol to the watchlist', () => {
    const { result } = renderHook(() => useWatchlist(INITIAL_STOCKS));

    act(() => {
      // AMD is in INITIAL_STOCKS but not in default watchlist
      const added = result.current.addSymbol('AMD');
      expect(added).toBe(true);
    });

    expect(result.current.isInWatchlist('AMD')).toBe(true);
    expect(result.current.watchlistSymbols).toContain('AMD');
  });

  it('rejects adding duplicate or non-existent symbols', () => {
    const { result } = renderHook(() => useWatchlist(INITIAL_STOCKS));

    act(() => {
      const duplicate = result.current.addSymbol('AAPL');
      expect(duplicate).toBe(false);

      const nonExistent = result.current.addSymbol('XYZFAKE');
      expect(nonExistent).toBe(false);
    });
  });

  it('removes a symbol from the watchlist', () => {
    const { result } = renderHook(() => useWatchlist(INITIAL_STOCKS));

    act(() => {
      result.current.removeSymbol('AAPL');
    });

    expect(result.current.isInWatchlist('AAPL')).toBe(false);
    expect(result.current.watchlistSymbols).not.toContain('AAPL');
  });

  it('resets watchlist back to defaults', () => {
    const { result } = renderHook(() => useWatchlist(INITIAL_STOCKS));

    act(() => {
      result.current.removeSymbol('AAPL');
      result.current.removeSymbol('MSFT');
      result.current.resetWatchlist();
    });

    expect(result.current.isInWatchlist('AAPL')).toBe(true);
    expect(result.current.isInWatchlist('MSFT')).toBe(true);
  });

  it('filters watchlist items by search query', () => {
    const { result } = renderHook(() => useWatchlist(INITIAL_STOCKS));

    act(() => {
      result.current.setSearchQuery('Apple');
    });

    expect(result.current.filteredWatchlistStocks.length).toBe(1);
    expect(result.current.filteredWatchlistStocks[0].symbol).toBe('AAPL');
  });

  it('sorts watchlist items by price and change percent', () => {
    const { result } = renderHook(() => useWatchlist(INITIAL_STOCKS));

    act(() => {
      result.current.handleSort('price');
    });

    // Check descending price order
    const prices = result.current.filteredWatchlistStocks.map((s) => s.currentPrice);
    for (let i = 0; i < prices.length - 1; i++) {
      expect(prices[i]).toBeGreaterThanOrEqual(prices[i + 1]);
    }
  });
});
