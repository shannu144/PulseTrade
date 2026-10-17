import React, { useState, useRef, useEffect } from 'react';
import { Activity, Clock, ShieldAlert, Sparkles, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { ConnectionSource, ConnectionStatus, Stock } from '../../types/market';
import { StatusBadge } from '../ui/StatusBadge';
import { SearchInput } from '../ui/SearchInput';
import { formatCurrency, formatCurrencyWithSign } from '../../utils/formatCurrency';
import { formatPercentage } from '../../utils/formatPercentage';
import { Modal } from '../ui/Modal';

interface AppHeaderProps {
  connectionStatus: ConnectionStatus;
  connectionSource: ConnectionSource;
  latency: number;
  onReconnect: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: Stock[];
  onSelectStock: (symbol: string) => void;
  portfolioSummary: {
    cash: number;
    totalEquity: number;
    totalUnrealizedPnL: number;
    totalReturnPercent: number;
  };
  onOpenPortfolioModal: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  connectionStatus,
  connectionSource,
  latency,
  onReconnect,
  searchQuery,
  setSearchQuery,
  searchResults,
  onSelectStock,
  portfolioSummary,
  onOpenPortfolioModal,
}) => {
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Live clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectSearchResult = (symbol: string) => {
    onSelectStock(symbol);
    setSearchQuery('');
    setShowSearchResults(false);
  };

  const isPositivePnL = portfolioSummary.totalUnrealizedPnL >= 0;

  return (
    <>
      <header className="app-header">
        <div className="header-left">
          {/* Logo & Brand */}
          <div className="brand-logo-container">
            <div className="brand-icon-wrapper">
              <Activity size={20} className="brand-pulse-icon" />
              <span className="brand-pulse-ring" />
            </div>
            <div className="brand-text-wrapper">
              <div className="brand-title">
                <span className="brand-name">Pulse</span>
                <span className="brand-accent">Trade</span>
              </div>
              <span className="brand-tag">TERMINAL v1.0</span>
            </div>
          </div>

          {/* Market Status Pill */}
          <div className="market-session-pill">
            <span className="market-session-indicator" />
            <span className="market-session-text">US EQUITIES • CONTINUOUS SIM</span>
            <div className="market-clock">
              <Clock size={11} className="text-slate-400" />
              <span>{currentTime} EST</span>
            </div>
          </div>
        </div>

        {/* Global Stock Search with Dropdown */}
        <div className="header-center" ref={searchContainerRef}>
          <SearchInput
            value={searchQuery}
            onChange={(val) => {
              setSearchQuery(val);
              setShowSearchResults(Boolean(val.trim()));
            }}
            placeholder="Search symbol (e.g. AAPL, NVDA, MSFT)..."
            className="header-search-bar"
          />

          {showSearchResults && searchResults.length > 0 && (
            <div className="search-dropdown-menu">
              <div className="search-dropdown-header">Available Matching Stocks</div>
              {searchResults.map((stock) => (
                <button
                  key={stock.symbol}
                  className="search-result-item"
                  onClick={() => handleSelectSearchResult(stock.symbol)}
                >
                  <div className="result-symbol-box">
                    <span className="result-symbol">{stock.symbol}</span>
                    <span className="result-name">{stock.name}</span>
                  </div>
                  <div className="result-price-box">
                    <span className="result-price">{formatCurrency(stock.currentPrice)}</span>
                    <span
                      className={`result-change ${
                        stock.changePercent >= 0 ? 'text-up' : 'text-down'
                      }`}
                    >
                      {formatPercentage(stock.changePercent)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {showSearchResults && searchResults.length === 0 && searchQuery.trim() && (
            <div className="search-dropdown-menu search-no-results">
              <p>No securities found matching "{searchQuery}"</p>
              <span className="search-no-results-hint">
                Try AAPL, MSFT, NVDA, AMZN, TSLA, GOOGL, META, AMD, NFLX, JPM
              </span>
            </div>
          )}
        </div>

        {/* Header Right Actions */}
        <div className="header-right">
          {/* Connection Status Badge */}
          <StatusBadge
            status={connectionStatus}
            source={connectionSource}
            latency={latency}
            onReconnect={onReconnect}
          />

          {/* Paper Trading Account Badge */}
          <button
            onClick={onOpenPortfolioModal}
            className="account-summary-pill"
            title="Click to view simulated portfolio & history"
            aria-label="View paper portfolio account"
          >
            <div className="account-icon-box">
              <DollarSign size={13} className="text-emerald-400" />
            </div>
            <div className="account-data">
              <span className="account-title">Paper Equity</span>
              <span className="account-equity">
                {formatCurrency(portfolioSummary.totalEquity)}
              </span>
            </div>
            <div
              className={`account-pnl-chip ${
                isPositivePnL ? 'chip-positive' : 'chip-negative'
              }`}
            >
              {isPositivePnL ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
              <span>{formatCurrencyWithSign(portfolioSummary.totalUnrealizedPnL)}</span>
            </div>
          </button>

          {/* Disclaimer Info Button */}
          <button
            onClick={() => setIsDisclaimerOpen(true)}
            className="disclaimer-trigger-btn"
            title="System Architecture & Simulation Notice"
            aria-label="Open architecture disclaimer"
          >
            <ShieldAlert size={16} />
            <span className="disclaimer-label">Sim Notice</span>
          </button>
        </div>
      </header>

      {/* Architecture & Simulation Notice Modal */}
      <Modal
        isOpen={isDisclaimerOpen}
        onClose={() => setIsDisclaimerOpen(false)}
        title="PulseTrade Simulated Environment"
        description="Architecture and regulatory clarity for portfolio review"
      >
        <div className="disclaimer-modal-content">
          <div className="modal-banner-alert">
            <Sparkles size={18} className="text-cyan-400" />
            <div>
              <strong>Demonstration Portfolio Project</strong>
              <p>
                PulseTrade is engineered to showcase high-performance frontend trading
                interfaces, WebSocket streaming, TradingView Lightweight Charts, and
                order-flow simulation.
              </p>
            </div>
          </div>

          <div className="disclaimer-section">
            <h4>📡 Real-Time Market Feed Architecture</h4>
            <ul>
              <li>
                <strong>Standalone WebSocket Server:</strong> Node.js + <code>ws</code> on port 8080.
              </li>
              <li>
                <strong>Resilient Client Fallback:</strong> If the standalone server is stopped, an
                internal deterministic generator seamlessly keeps live ticks running without breaking.
              </li>
              <li>
                <strong>Exponential Backoff:</strong> Automatic reconnection algorithm with jitter and
                configurable retry caps.
              </li>
              <li>
                <strong>Sub-Millisecond Batching:</strong> Price events throttled via{' '}
                <code>requestAnimationFrame</code> for 60fps rendering without UI freezes.
              </li>
            </ul>
          </div>

          <div className="disclaimer-section">
            <h4>⚖️ Educational Disclaimer</h4>
            <p>
              All prices, quotes, order submissions, and balances are entirely simulated. No real
              funds or live exchange connections are utilized.
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
};
