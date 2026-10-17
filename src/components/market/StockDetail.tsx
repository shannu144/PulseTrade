import React from 'react';
import { Stock } from '../../types/market';
import { formatCurrency, formatCurrencyWithSign } from '../../utils/formatCurrency';
import { formatPercentage } from '../../utils/formatPercentage';
import { formatCompactNumber, formatNumberWithCommas } from '../../utils/formatNumber';
import { TrendingUp, TrendingDown, Star, Clock } from 'lucide-react';
import { Skeleton } from '../ui/Skeleton';

interface StockDetailProps {
  stock: Stock | null;
  flashState: 'up' | 'down' | null;
  isInWatchlist: boolean;
  onToggleWatchlist: (symbol: string) => void;
  isLoading: boolean;
}

export const StockDetail: React.FC<StockDetailProps> = ({
  stock,
  flashState,
  isInWatchlist,
  onToggleWatchlist,
  isLoading,
}) => {
  if (isLoading || !stock) {
    return (
      <div className="stock-detail-card skeleton-card">
        <Skeleton width="50%" height="28px" />
        <Skeleton width="30%" height="40px" className="mt-3" />
        <div className="detail-metrics-grid mt-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} height="48px" />
          ))}
        </div>
      </div>
    );
  }

  const isPositive = stock.change >= 0;
  const lastUpdatedTime = new Date(stock.lastUpdated).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <div className="stock-detail-card">
      {/* Top Banner / Identity */}
      <div className="detail-header">
        <div className="detail-identity">
          <div className="detail-symbol-row">
            <h1 className="detail-symbol">{stock.symbol}</h1>
            <span className="detail-exchange">{stock.exchange}</span>
            <span className="detail-sector">{stock.sector}</span>
            <span className="sim-badge" title="Simulated quotes for portfolio display">
              Simulated
            </span>
          </div>
          <h2 className="detail-name">{stock.name}</h2>
        </div>

        <div className="detail-header-actions">
          <button
            onClick={() => onToggleWatchlist(stock.symbol)}
            className={`detail-star-btn ${isInWatchlist ? 'star-active' : ''}`}
            title={isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
            aria-label="Toggle Watchlist"
          >
            <Star size={16} fill={isInWatchlist ? '#eab308' : 'none'} />
            <span>{isInWatchlist ? 'Watched' : 'Watch'}</span>
          </button>
        </div>
      </div>

      {/* Hero Price & Change Section */}
      <div className="detail-price-hero">
        <div className="detail-price-group">
          <div
            className={`detail-current-price ${
              flashState ? `price-flash-${flashState}` : ''
            }`}
          >
            {formatCurrency(stock.currentPrice)}
          </div>
          <div
            className={`detail-change-pill ${
              isPositive ? 'pill-positive' : 'pill-negative'
            }`}
          >
            {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            <span className="detail-change-text">
              {formatCurrencyWithSign(stock.change)} ({formatPercentage(stock.changePercent)})
            </span>
          </div>
        </div>

        <div className="detail-timestamp-box">
          <Clock size={12} className="text-slate-500" />
          <span>Last Tick: {lastUpdatedTime}</span>
        </div>
      </div>

      {/* Key Market Metrics Grid */}
      <div className="detail-metrics-grid">
        <div className="metric-cell">
          <span className="metric-label">Day High</span>
          <span className="metric-value">{formatCurrency(stock.high)}</span>
        </div>
        <div className="metric-cell">
          <span className="metric-label">Day Low</span>
          <span className="metric-value">{formatCurrency(stock.low)}</span>
        </div>
        <div className="metric-cell">
          <span className="metric-label">Open Price</span>
          <span className="metric-value">{formatCurrency(stock.open)}</span>
        </div>
        <div className="metric-cell">
          <span className="metric-label">Prev. Close</span>
          <span className="metric-value">{formatCurrency(stock.previousClose)}</span>
        </div>
        <div className="metric-cell">
          <span className="metric-label">Volume</span>
          <span className="metric-value">{formatNumberWithCommas(stock.volume)}</span>
        </div>
        <div className="metric-cell">
          <span className="metric-label">Market Cap</span>
          <span className="metric-value">{formatCompactNumber(stock.marketCap)}</span>
        </div>
        <div className="metric-cell">
          <span className="metric-label">P/E Ratio</span>
          <span className="metric-value">{stock.peRatio ? stock.peRatio.toFixed(1) : 'N/A'}</span>
        </div>
        <div className="metric-cell">
          <span className="metric-label">52W Range</span>
          <span className="metric-value text-xs">
            {formatCurrency(stock.fiftyTwoWeekLow)} - {formatCurrency(stock.fiftyTwoWeekHigh)}
          </span>
        </div>
      </div>
    </div>
  );
};
