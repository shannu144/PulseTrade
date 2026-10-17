import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { PortfolioHolding, SimulatedOrder } from '../../types/orders';
import { formatCurrency, formatCurrencyWithSign } from '../../utils/formatCurrency';
import { formatPercentage } from '../../utils/formatPercentage';
import { Briefcase, History, RotateCcw, TrendingUp, TrendingDown, Wallet, Layers } from 'lucide-react';

interface PortfolioModalProps {
  isOpen: boolean;
  onClose: () => void;
  cash: number;
  holdings: Record<string, PortfolioHolding>;
  orderHistory: SimulatedOrder[];
  summary: {
    cash: number;
    totalHoldingsValue: number;
    totalEquity: number;
    totalUnrealizedPnL: number;
    totalReturn: number;
    totalReturnPercent: number;
  };
  onResetAccount: () => void;
  onSelectStock: (symbol: string) => void;
}

export const PortfolioModal: React.FC<PortfolioModalProps> = ({
  isOpen,
  onClose,
  cash,
  holdings,
  orderHistory,
  summary,
  onResetAccount,
  onSelectStock,
}) => {
  const [activeTab, setActiveTab] = useState<'holdings' | 'history'>('holdings');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const holdingsList = Object.values(holdings);

  const handleStockClick = (symbol: string) => {
    onSelectStock(symbol);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Paper Trading Account"
      description="Simulated positions, cash balance, and execution history"
      maxWidth="760px"
    >
      <div className="portfolio-modal-content">
        {/* Account Top Summary Metrics */}
        <div className="portfolio-summary-bar">
          <div className="summary-stat-cell">
            <span className="stat-label">
              <Wallet size={12} className="inline mr-1 text-slate-400" />
              Available Cash
            </span>
            <span className="stat-value">{formatCurrency(cash)}</span>
          </div>

          <div className="summary-stat-cell">
            <span className="stat-label">
              <Layers size={12} className="inline mr-1 text-slate-400" />
              Holdings Value
            </span>
            <span className="stat-value">{formatCurrency(summary.totalHoldingsValue)}</span>
          </div>

          <div className="summary-stat-cell">
            <span className="stat-label">Total Equity</span>
            <span className="stat-value font-bold text-cyan-300">
              {formatCurrency(summary.totalEquity)}
            </span>
          </div>

          <div className="summary-stat-cell">
            <span className="stat-label">Total P&L</span>
            <span
              className={`stat-value font-bold flex items-center gap-1 ${
                summary.totalUnrealizedPnL >= 0 ? 'text-up' : 'text-down'
              }`}
            >
              {summary.totalUnrealizedPnL >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
              {formatCurrencyWithSign(summary.totalUnrealizedPnL)} (
              {formatPercentage(summary.totalReturnPercent)})
            </span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="portfolio-tabs-row">
          <div className="tab-group">
            <button
              onClick={() => setActiveTab('holdings')}
              className={`tab-btn ${activeTab === 'holdings' ? 'active' : ''}`}
            >
              <Briefcase size={14} />
              <span>Positions ({holdingsList.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
            >
              <History size={14} />
              <span>Trade History ({orderHistory.length})</span>
            </button>
          </div>

          <div className="tab-actions">
            {!showResetConfirm ? (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="btn-danger-link text-xs flex items-center gap-1"
                title="Reset paper balance to $100,000"
              >
                <RotateCcw size={12} />
                <span>Reset Account</span>
              </button>
            ) : (
              <div className="reset-confirm-box">
                <span className="text-xs text-rose-400">Reset to $100K?</span>
                <button
                  onClick={() => {
                    onResetAccount();
                    setShowResetConfirm(false);
                  }}
                  className="btn-confirm-yes"
                >
                  Yes
                </button>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="btn-confirm-no"
                >
                  No
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tab 1: Current Holdings Table */}
        {activeTab === 'holdings' && (
          <div className="portfolio-table-wrapper">
            {holdingsList.length > 0 ? (
              <table className="portfolio-table">
                <thead>
                  <tr>
                    <th>Security</th>
                    <th className="text-right">Shares</th>
                    <th className="text-right">Avg Price</th>
                    <th className="text-right">Current Price</th>
                    <th className="text-right">Market Value</th>
                    <th className="text-right">Unrealized P&L</th>
                  </tr>
                </thead>
                <tbody>
                  {holdingsList.map((h) => {
                    const isProfit = h.unrealizedPnL >= 0;
                    return (
                      <tr
                        key={h.symbol}
                        className="clickable-row"
                        onClick={() => handleStockClick(h.symbol)}
                        title="Click to view chart"
                      >
                        <td>
                          <div className="flex items-center gap-2">
                            <span className="ticker-badge">{h.symbol}</span>
                          </div>
                        </td>
                        <td className="text-right">{h.quantity}</td>
                        <td className="text-right">{formatCurrency(h.averageBuyPrice)}</td>
                        <td className="text-right">{formatCurrency(h.currentPrice)}</td>
                        <td className="text-right font-medium">{formatCurrency(h.currentValue)}</td>
                        <td className="text-right">
                          <span className={`pnl-pill ${isProfit ? 'pill-positive' : 'pill-negative'}`}>
                            {formatCurrencyWithSign(h.unrealizedPnL)} ({formatPercentage(h.unrealizedPnLPercent)})
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="portfolio-empty-state">
                <Briefcase size={32} className="text-slate-500 mb-2" />
                <p>No open positions</p>
                <span className="text-xs text-slate-400">
                  Submit a BUY order using the Order Ticket to add holdings to your paper portfolio.
                </span>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Simulated Order History Table */}
        {activeTab === 'history' && (
          <div className="portfolio-table-wrapper">
            {orderHistory.length > 0 ? (
              <table className="portfolio-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Side</th>
                    <th>Security</th>
                    <th>Type</th>
                    <th className="text-right">Shares</th>
                    <th className="text-right">Exec Price</th>
                    <th className="text-right">Total Value</th>
                    <th className="text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orderHistory.map((order) => {
                    const isBuy = order.side === 'BUY';
                    const timeStr = new Date(order.timestamp).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    });
                    return (
                      <tr
                        key={order.id}
                        className="clickable-row"
                        onClick={() => handleStockClick(order.symbol)}
                        title="Click to view chart"
                      >
                        <td className="text-xs text-slate-400">{timeStr}</td>
                        <td>
                          <span
                            className={`side-chip ${
                              isBuy ? 'chip-buy' : 'chip-sell'
                            }`}
                          >
                            {order.side}
                          </span>
                        </td>
                        <td className="font-semibold">{order.symbol}</td>
                        <td className="text-xs text-slate-400">{order.type}</td>
                        <td className="text-right">{order.quantity}</td>
                        <td className="text-right">{formatCurrency(order.executedPrice)}</td>
                        <td className="text-right font-medium">
                          {formatCurrency(order.totalValue)}
                        </td>
                        <td className="text-center">
                          <span className="status-badge-filled">FILLED</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="portfolio-empty-state">
                <History size={32} className="text-slate-500 mb-2" />
                <p>No orders executed yet</p>
                <span className="text-xs text-slate-400">
                  Orders submitted through the order ticket will appear here with execution timestamps.
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
