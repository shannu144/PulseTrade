import React, { useState } from 'react';
import { Stock } from '../../types/market';
import { WatchlistRow } from './WatchlistRow';
import { SortField, SortOrder } from '../../hooks/useWatchlist';
import { ArrowUpDown, Plus, RotateCcw, Search, BookmarkCheck } from 'lucide-react';
import { Skeleton } from '../ui/Skeleton';
import { Button } from '../ui/Button';

interface WatchlistProps {
  stocks: Stock[];
  selectedSymbol: string;
  flashStates: Record<string, 'up' | 'down' | null>;
  onSelectStock: (symbol: string) => void;
  onRemoveStock: (symbol: string) => void;
  onAddStock: (symbol: string) => boolean;
  onResetWatchlist: () => void;
  sortField: SortField;
  sortOrder: SortOrder;
  onSort: (field: SortField) => void;
  allAvailableSymbols: string[];
  isInWatchlist: (symbol: string) => boolean;
  isLoading: boolean;
}

export const Watchlist: React.FC<WatchlistProps> = ({
  stocks,
  selectedSymbol,
  flashStates,
  onSelectStock,
  onRemoveStock,
  onAddStock,
  onResetWatchlist,
  sortField,
  sortOrder,
  onSort,
  allAvailableSymbols,
  isInWatchlist,
  isLoading,
}) => {
  const [filterText, setFilterText] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Filter stocks by internal search box
  const displayedStocks = stocks.filter((stock) => {
    if (!filterText.trim()) return true;
    const query = filterText.toLowerCase();
    return (
      stock.symbol.toLowerCase().includes(query) ||
      stock.name.toLowerCase().includes(query)
    );
  });

  const availableToAdd = allAvailableSymbols.filter((sym) => !isInWatchlist(sym));

  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown size={12} className="text-slate-600 ml-1 inline opacity-40" />;
    }
    return (
      <span className="sort-arrow-active ml-1">
        {sortOrder === 'asc' ? '▲' : '▼'}
      </span>
    );
  };

  return (
    <div className="watchlist-card">
      {/* Watchlist Header */}
      <div className="watchlist-card-header">
        <div className="watchlist-title-wrapper">
          <BookmarkCheck size={16} className="text-blue-400" />
          <h3 className="watchlist-title">Watchlist</h3>
          <span className="watchlist-counter">{stocks.length}</span>
        </div>

        <div className="watchlist-header-actions">
          {/* Add Stock Quick Dropdown */}
          <div className="relative-container">
            <button
              onClick={() => setIsAddOpen((prev) => !prev)}
              className="watchlist-icon-btn"
              title="Add stock to watchlist"
              aria-label="Add stock to watchlist"
            >
              <Plus size={15} />
              <span className="btn-text-sm">Add</span>
            </button>

            {isAddOpen && (
              <div className="quick-add-dropdown">
                <div className="quick-add-title">Add Symbol</div>
                {availableToAdd.length > 0 ? (
                  <div className="quick-add-list">
                    {availableToAdd.map((sym) => (
                      <button
                        key={sym}
                        className="quick-add-item"
                        onClick={() => {
                          onAddStock(sym);
                          setIsAddOpen(false);
                        }}
                      >
                        <span className="quick-add-symbol">{sym}</span>
                        <span className="quick-add-plus">+ Add</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="quick-add-empty">All available symbols are in your watchlist.</div>
                )}
              </div>
            )}
          </div>

          <button
            onClick={onResetWatchlist}
            className="watchlist-icon-btn"
            title="Reset to default watchlist"
            aria-label="Reset watchlist"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* Internal Filter Input */}
      <div className="watchlist-filter-box">
        <Search size={13} className="filter-search-icon" />
        <input
          type="text"
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          placeholder="Filter watchlist..."
          className="watchlist-filter-input"
          aria-label="Filter watchlist items"
        />
        {filterText && (
          <button
            onClick={() => setFilterText('')}
            className="watchlist-filter-clear"
            aria-label="Clear filter"
          >
            ×
          </button>
        )}
      </div>

      {/* Table Content */}
      <div className="watchlist-table-wrapper">
        <table className="watchlist-table" role="table">
          <thead>
            <tr>
              <th
                className="col-symbol cursor-pointer select-none"
                onClick={() => onSort('symbol')}
              >
                <span>Symbol</span>
                {renderSortIndicator('symbol')}
              </th>
              <th
                className="col-price cursor-pointer select-none text-right"
                onClick={() => onSort('price')}
              >
                <span>Price</span>
                {renderSortIndicator('price')}
              </th>
              <th
                className="col-change cursor-pointer select-none text-right"
                onClick={() => onSort('changePercent')}
              >
                <span>24h Change</span>
                {renderSortIndicator('changePercent')}
              </th>
              <th className="col-sparkline text-center">
                <span>Trend</span>
              </th>
              <th className="col-actions text-center" aria-label="Actions">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx} className="skeleton-row">
                  <td colSpan={5}>
                    <Skeleton height="36px" width="100%" />
                  </td>
                </tr>
              ))
            ) : displayedStocks.length > 0 ? (
              displayedStocks.map((stock) => (
                <WatchlistRow
                  key={stock.symbol}
                  stock={stock}
                  isSelected={stock.symbol === selectedSymbol}
                  flashState={flashStates[stock.symbol] || null}
                  onSelect={onSelectStock}
                  onRemove={onRemoveStock}
                />
              ))
            ) : stocks.length === 0 ? (
              <tr>
                <td colSpan={5} className="watchlist-empty-state">
                  <div className="empty-message-box">
                    <p>Your watchlist is empty</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onResetWatchlist}
                      className="mt-2"
                    >
                      Restore Default Symbols
                    </Button>
                  </div>
                </td>
              </tr>
            ) : (
              <tr>
                <td colSpan={5} className="watchlist-empty-state">
                  <div className="empty-message-box">
                    <p>No symbols match "{filterText}"</p>
                    <button
                      onClick={() => setFilterText('')}
                      className="btn-text-link mt-1"
                    >
                      Clear search filter
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
