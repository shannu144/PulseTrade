import { MarketOverviewStats } from '../../types/market';
import { TrendingUp, TrendingDown, Layers, BarChart3, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatPercentage } from '../../utils/formatPercentage';
import { formatCompactNumber } from '../../utils/formatNumber';
import { Skeleton } from '../ui/Skeleton';

interface MarketOverviewProps {
  stats: MarketOverviewStats;
  isLoading: boolean;
  onSelectStock: (symbol: string) => void;
}

export const MarketOverview: React.FC<MarketOverviewProps> = ({
  stats,
  isLoading,
  onSelectStock,
}) => {
  if (isLoading) {
    return (
      <div className="market-overview-grid">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="overview-card skeleton-card">
            <Skeleton width="40%" height="14px" />
            <Skeleton width="60%" height="24px" className="mt-2" />
            <Skeleton width="80%" height="12px" className="mt-2" />
          </div>
        ))}
      </div>
    );
  }

  const {
    totalTracked,
    gainersCount,
    losersCount,
    topGainer,
    topLoser,
    totalMarketVolume,
    marketTrendPercent,
  } = stats;

  const isMarketBullish = marketTrendPercent >= 0;

  return (
    <section className="market-overview-container" aria-label="Market Overview">
      <div className="market-overview-header">
        <div className="overview-title-box">
          <BarChart3 size={16} className="text-blue-400" />
          <h2 className="overview-title">Market Pulse Overview</h2>
          <span className="sim-tag">Simulated Data</span>
        </div>
        <div className="market-trend-pill">
          <span className="trend-label">Market Index Trend:</span>
          <span className={`trend-value ${isMarketBullish ? 'text-up' : 'text-down'}`}>
            {isMarketBullish ? '+' : ''}
            {marketTrendPercent}%
          </span>
        </div>
      </div>

      <div className="market-overview-grid">
        {/* Card 1: Tracked Stocks & Breadth */}
        <div className="overview-card">
          <div className="card-top">
            <span className="card-label">Tracked Securities</span>
            <Layers size={16} className="card-icon text-slate-400" />
          </div>
          <div className="card-primary-val">{totalTracked} Stocks</div>
          <div className="card-sub-stats">
            <span className="breadth-pill breadth-up">
              <TrendingUp size={12} /> {gainersCount} Advancing
            </span>
            <span className="breadth-pill breadth-down">
              <TrendingDown size={12} /> {losersCount} Declining
            </span>
          </div>
        </div>

        {/* Card 2: Top Performing Stock */}
        <div
          className="overview-card card-interactive"
          onClick={() => topGainer && onSelectStock(topGainer.symbol)}
          title="Click to view stock chart and details"
        >
          <div className="card-top">
            <span className="card-label">Top Performer</span>
            <span className="badge-gainer">
              <ArrowUpRight size={13} /> Gainer
            </span>
          </div>
          {topGainer ? (
            <>
              <div className="card-primary-row">
                <span className="card-ticker">{topGainer.symbol}</span>
                <span className="card-price">{formatCurrency(topGainer.currentPrice)}</span>
              </div>
              <div className="card-footer-metric text-up">
                <span>{topGainer.name}</span>
                <span className="metric-bold">{formatPercentage(topGainer.changePercent)}</span>
              </div>
            </>
          ) : (
            <div className="card-muted">No data available</div>
          )}
        </div>

        {/* Card 3: Worst Performing Stock */}
        <div
          className="overview-card card-interactive"
          onClick={() => topLoser && onSelectStock(topLoser.symbol)}
          title="Click to view stock chart and details"
        >
          <div className="card-top">
            <span className="card-label">Top Decliner</span>
            <span className="badge-loser">
              <ArrowDownRight size={13} /> Decliner
            </span>
          </div>
          {topLoser ? (
            <>
              <div className="card-primary-row">
                <span className="card-ticker">{topLoser.symbol}</span>
                <span className="card-price">{formatCurrency(topLoser.currentPrice)}</span>
              </div>
              <div className="card-footer-metric text-down">
                <span>{topLoser.name}</span>
                <span className="metric-bold">{formatPercentage(topLoser.changePercent)}</span>
              </div>
            </>
          ) : (
            <div className="card-muted">No data available</div>
          )}
        </div>

        {/* Card 4: Aggregate Volume */}
        <div className="overview-card">
          <div className="card-top">
            <span className="card-label">Aggregate 24h Volume</span>
            <BarChart3 size={16} className="card-icon text-slate-400" />
          </div>
          <div className="card-primary-val">{formatCompactNumber(totalMarketVolume)} Shares</div>
          <div className="card-footer-metric text-slate-400">
            <span>Market Activity</span>
            <span className="status-indicator-live">Live Feed Active</span>
          </div>
        </div>
      </div>
    </section>
  );
};
