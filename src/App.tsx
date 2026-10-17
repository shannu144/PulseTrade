import { useState, useEffect } from 'react';
import './App.css';
import { useMarketData } from './hooks/useMarketData';
import { useWatchlist } from './hooks/useWatchlist';
import { usePortfolio } from './hooks/usePortfolio';
import { AppHeader } from './components/layout/AppHeader';
import { MarketOverview } from './components/market/MarketOverview';
import { Watchlist } from './components/market/Watchlist';
import { StockDetail } from './components/market/StockDetail';
import { PriceChart } from './components/charts/PriceChart';
import { OrderTicket } from './components/trading/OrderTicket';
import { PortfolioModal } from './components/trading/PortfolioModal';
import { WifiOff, AlertTriangle } from 'lucide-react';

export function App() {
  const [isPortfolioModalOpen, setIsPortfolioModalOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  // 1. Core Market Data Feed Hook
  const {
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
  } = useMarketData('AAPL');

  // 2. Watchlist Hook
  const {
    filteredWatchlistStocks,
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
    searchResultStocks,
  } = useWatchlist(stocks);

  // 3. Simulated Paper Portfolio Hook
  const {
    cash,
    holdings,
    orderHistory,
    summary,
    executeOrder,
    resetAccount,
  } = usePortfolio(stocks);

  // 4. Online/Offline Browser State
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const sharesOwnedForSelectedStock = selectedStock
    ? holdings[selectedStock.symbol]?.quantity || 0
    : 0;

  const handleToggleWatchlist = (symbol: string) => {
    if (isInWatchlist(symbol)) {
      removeSymbol(symbol);
    } else {
      addSymbol(symbol);
    }
  };

  return (
    <div className="app-root">
      {/* Offline Alert Banner */}
      {!isOnline && (
        <div className="system-warning-banner" role="alert">
          <div className="warning-banner-left">
            <WifiOff size={16} />
            <span>
              <strong>Browser is Offline:</strong> Market data stream paused. Reconnecting
              automatically once network restores.
            </span>
          </div>
        </div>
      )}

      {/* Header */}
      <AppHeader
        connectionStatus={isOnline ? connectionStatus : 'disconnected'}
        connectionSource={connectionSource}
        latency={latency}
        onReconnect={reconnect}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchResults={searchResultStocks}
        onSelectStock={setSelectedSymbol}
        portfolioSummary={summary}
        onOpenPortfolioModal={() => setIsPortfolioModalOpen(true)}
      />

      {/* Main Trading Terminal */}
      <main className="dashboard-main">
        {/* Top Market Overview Statistics */}
        <MarketOverview
          stats={marketStats}
          isLoading={isInitialLoading}
          onSelectStock={setSelectedSymbol}
        />

        {/* 3-Column Trading Workspace */}
        <div className="trading-workspace-grid">
          {/* Left: Watchlist Panel */}
          <aside aria-label="Watchlist">
            <Watchlist
              stocks={filteredWatchlistStocks}
              selectedSymbol={selectedSymbol}
              flashStates={flashStates}
              onSelectStock={setSelectedSymbol}
              onRemoveStock={removeSymbol}
              onAddStock={addSymbol}
              onResetWatchlist={resetWatchlist}
              sortField={sortField}
              sortOrder={sortOrder}
              onSort={handleSort}
              allAvailableSymbols={allAvailableSymbols}
              isInWatchlist={isInWatchlist}
              isLoading={isInitialLoading}
            />
          </aside>

          {/* Center: Selected Stock Details & Interactive Lightweight Chart */}
          <section className="center-trading-column" aria-label="Market Analysis">
            <StockDetail
              stock={selectedStock}
              flashState={flashStates[selectedSymbol] || null}
              isInWatchlist={isInWatchlist(selectedSymbol)}
              onToggleWatchlist={handleToggleWatchlist}
              isLoading={isInitialLoading}
            />

            <PriceChart stock={selectedStock} isLoading={isInitialLoading} />
          </section>

          {/* Right: Order Entry Ticket */}
          <aside aria-label="Order Entry Ticket">
            <OrderTicket
              stock={selectedStock}
              availableCash={cash}
              sharesOwned={sharesOwnedForSelectedStock}
              onExecuteOrder={executeOrder}
            />
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-left">
          <span>PulseTrade v1.0.0</span>
          <span className="footer-bullet">•</span>
          <span>Engineered for High-Frequency Frontend Performance</span>
          <span className="footer-bullet">•</span>
          <span className="flex items-center gap-1">
            <span className="status-indicator-dot" />
            Feed: {connectionSource === 'standalone_ws' ? 'Standalone WebSocket' : 'Internal Engine'}
          </span>
        </div>
        <div className="footer-right">
          <span className="text-amber-400 flex items-center gap-1 text-xs">
            <AlertTriangle size={12} /> Simulated market data & paper execution. Not financial advice.
          </span>
        </div>
      </footer>

      {/* Simulated Portfolio & Order History Modal */}
      <PortfolioModal
        isOpen={isPortfolioModalOpen}
        onClose={() => setIsPortfolioModalOpen(false)}
        cash={cash}
        holdings={holdings}
        orderHistory={orderHistory}
        summary={summary}
        onResetAccount={resetAccount}
        onSelectStock={setSelectedSymbol}
      />
    </div>
  );
}

export default App;
