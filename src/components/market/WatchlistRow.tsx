import React from 'react';
import { Stock } from '../../types/market';
import { Sparkline } from './Sparkline';
import { formatCurrency, formatCurrencyWithSign } from '../../utils/formatCurrency';
import { formatPercentage } from '../../utils/formatPercentage';
import { Trash2, TrendingUp, TrendingDown } from 'lucide-react';

interface WatchlistRowProps {
  stock: Stock;
  isSelected: boolean;
  flashState: 'up' | 'down' | null;
  onSelect: (symbol: string) => void;
  onRemove: (symbol: string) => void;
}

export const WatchlistRow: React.FC<WatchlistRowProps> = ({
  stock,
  isSelected,
  flashState,
  onSelect,
  onRemove,
}) => {
  const isPositive = stock.change >= 0;

  let flashClass = '';
  if (flashState === 'up') flashClass = 'row-flash-up';
  if (flashState === 'down') flashClass = 'row-flash-down';

  return (
    <tr
      className={`watchlist-row ${isSelected ? 'row-selected' : ''} ${flashClass}`}
      onClick={() => onSelect(stock.symbol)}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(stock.symbol);
        }
      }}
      role="row"
      aria-selected={isSelected}
    >
      {/* Symbol & Name */}
      <td className="col-symbol">
        <div className="symbol-cell">
          <div className="symbol-primary">
            <span className="ticker-code">{stock.symbol}</span>
            <span className="exchange-tag">{stock.exchange}</span>
          </div>
          <span className="company-name" title={stock.name}>
            {stock.name}
          </span>
        </div>
      </td>

      {/* Live Price */}
      <td className="col-price">
        <div className="price-cell">
          <span className={`live-price ${flashState ? `price-flash-${flashState}` : ''}`}>
            {formatCurrency(stock.currentPrice)}
          </span>
          <span className="prev-close-text">Prev: {formatCurrency(stock.previousClose)}</span>
        </div>
      </td>

      {/* Change & Percent */}
      <td className="col-change">
        <div className={`change-badge ${isPositive ? 'badge-bullish' : 'badge-bearish'}`}>
          {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          <span>{formatPercentage(stock.changePercent)}</span>
          <span className="change-abs">({formatCurrencyWithSign(stock.change)})</span>
        </div>
      </td>

      {/* Sparkline Trend */}
      <td className="col-sparkline">
        <div className="sparkline-cell">
          <Sparkline data={stock.sparkline} width={76} height={22} isPositive={isPositive} />
        </div>
      </td>

      {/* Actions */}
      <td className="col-actions" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => onRemove(stock.symbol)}
          className="watchlist-remove-btn"
          title={`Remove ${stock.symbol} from watchlist`}
          aria-label={`Remove ${stock.symbol} from watchlist`}
        >
          <Trash2 size={14} />
        </button>
      </td>
    </tr>
  );
};
