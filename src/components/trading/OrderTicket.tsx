import React, { useState, useId } from 'react';
import { Stock } from '../../types/market';
import { OrderSide, OrderType, SimulatedOrder } from '../../types/orders';
import { validateOrderTicket } from '../../utils/validation';
import { formatCurrency } from '../../utils/formatCurrency';
import { Button } from '../ui/Button';
import { OrderConfirmationModal } from './OrderConfirmationModal';
import { ArrowDownCircle, ArrowUpCircle, CheckCircle2, Wallet } from 'lucide-react';

interface OrderTicketProps {
  stock: Stock | null;
  availableCash: number;
  sharesOwned: number;
  onExecuteOrder: (params: {
    symbol: string;
    side: OrderSide;
    type: OrderType;
    quantity: number;
    limitPrice?: number;
    currentPrice: number;
  }) => SimulatedOrder;
}

export const OrderTicket: React.FC<OrderTicketProps> = ({
  stock,
  availableCash,
  sharesOwned,
  onExecuteOrder,
}) => {
  const quantityInputId = useId();
  const limitPriceInputId = useId();

  const [side, setSide] = useState<OrderSide>('BUY');
  const [orderType, setOrderType] = useState<OrderType>('MARKET');
  const [quantity, setQuantity] = useState<string>('10');
  const [limitPrice, setLimitPrice] = useState<string>('');
  const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [executionToast, setExecutionToast] = useState<SimulatedOrder | null>(null);

  if (!stock) {
    return (
      <div className="order-ticket-card">
        <div className="ticket-placeholder">Select a stock to open the order ticket</div>
      </div>
    );
  }

  const currentPrice = stock.currentPrice;

  // Real-time validation
  const validation = validateOrderTicket({
    side,
    orderType,
    quantityStr: quantity,
    limitPriceStr: limitPrice || currentPrice.toString(),
    currentPrice,
    availableCash,
    sharesOwned,
  });

  const handleQuickQty = (amount: number) => {
    setQuantity(amount.toString());
  };

  const handleMaxQty = () => {
    if (side === 'BUY') {
      const effPrice = orderType === 'LIMIT' && Number(limitPrice) > 0 ? Number(limitPrice) : currentPrice;
      const maxShares = Math.floor(availableCash / effPrice);
      setQuantity(Math.max(1, maxShares).toString());
    } else {
      setQuantity(sharesOwned.toString());
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validation.isValid) return;
    setIsConfirmOpen(true);
  };

  const handleConfirmOrder = () => {
    setIsExecuting(true);
    setTimeout(() => {
      const order = onExecuteOrder({
        symbol: stock.symbol,
        side,
        type: orderType,
        quantity: validation.quantity,
        limitPrice: orderType === 'LIMIT' ? validation.effectivePrice : undefined,
        currentPrice,
      });

      setIsExecuting(false);
      setIsConfirmOpen(false);
      setExecutionToast(order);

      // Auto dismiss execution notification
      setTimeout(() => {
        setExecutionToast(null);
      }, 5000);
    }, 400);
  };

  const isBuy = side === 'BUY';

  return (
    <div className="order-ticket-card">
      {/* Ticket Header */}
      <div className="ticket-header">
        <div className="ticket-title-group">
          <h3 className="ticket-title">Order Entry</h3>
          <span className="ticket-sim-badge">Paper Ticket</span>
        </div>
        <div className="ticket-symbol-pill">
          <span>{stock.symbol}</span>
          <span className="text-slate-400">•</span>
          <span>{formatCurrency(currentPrice)}</span>
        </div>
      </div>

      {/* Execution Toast / Alert */}
      {executionToast && (
        <div className="execution-toast-banner" role="status" aria-live="polite">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <div className="toast-content">
            <span className="toast-headline">
              {executionToast.side} Order Executed!
            </span>
            <span className="toast-detail">
              {executionToast.quantity} {executionToast.symbol} @ {formatCurrency(executionToast.executedPrice)} ({formatCurrency(executionToast.totalValue)})
            </span>
          </div>
          <button
            onClick={() => setExecutionToast(null)}
            className="toast-close-btn"
            aria-label="Dismiss toast"
          >
            ×
          </button>
        </div>
      )}

      {/* Buy / Sell Toggle Tabs */}
      <div className="ticket-side-tabs" role="tablist" aria-label="Trade Side">
        <button
          type="button"
          onClick={() => setSide('BUY')}
          className={`side-tab side-tab-buy ${isBuy ? 'active' : ''}`}
          role="tab"
          aria-selected={isBuy}
        >
          <ArrowUpCircle size={15} />
          <span>BUY</span>
        </button>
        <button
          type="button"
          onClick={() => setSide('SELL')}
          className={`side-tab side-tab-sell ${!isBuy ? 'active' : ''}`}
          role="tab"
          aria-selected={!isBuy}
        >
          <ArrowDownCircle size={15} />
          <span>SELL</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="ticket-form" noValidate>
        {/* Order Type Toggle */}
        <div className="form-group">
          <label className="form-label">Order Type</label>
          <div className="order-type-switch">
            <button
              type="button"
              className={`type-btn ${orderType === 'MARKET' ? 'active' : ''}`}
              onClick={() => setOrderType('MARKET')}
            >
              Market
            </button>
            <button
              type="button"
              className={`type-btn ${orderType === 'LIMIT' ? 'active' : ''}`}
              onClick={() => setOrderType('LIMIT')}
            >
              Limit
            </button>
          </div>
        </div>

        {/* Limit Price Input if Limit Type */}
        {orderType === 'LIMIT' && (
          <div className="form-group">
            <label htmlFor={limitPriceInputId} className="form-label">
              Limit Price ($)
            </label>
            <input
              id={limitPriceInputId}
              type="number"
              step="0.01"
              min="0.01"
              value={limitPrice}
              onChange={(e) => setLimitPrice(e.target.value)}
              placeholder={currentPrice.toFixed(2)}
              className={`form-input ${validation.errors.limitPrice ? 'input-error' : ''}`}
            />
            {validation.errors.limitPrice && (
              <span className="form-error-msg">{validation.errors.limitPrice}</span>
            )}
          </div>
        )}

        {/* Quantity Input */}
        <div className="form-group">
          <div className="label-with-balance">
            <label htmlFor={quantityInputId} className="form-label">
              Quantity (Shares)
            </label>
            <span className="balance-hint">
              {isBuy ? (
                <>
                  <Wallet size={11} className="inline mr-1" />
                  Cash: {formatCurrency(availableCash)}
                </>
              ) : (
                <>Owned: {sharesOwned} shares</>
              )}
            </span>
          </div>

          <input
            id={quantityInputId}
            type="number"
            min="1"
            step="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className={`form-input ${validation.errors.quantity ? 'input-error' : ''}`}
            placeholder="0"
          />

          {validation.errors.quantity && (
            <span className="form-error-msg">{validation.errors.quantity}</span>
          )}

          {/* Quick Quantity Chips */}
          <div className="quick-qty-chips">
            {[10, 25, 50, 100].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleQuickQty(num)}
                className="chip-btn"
              >
                +{num}
              </button>
            ))}
            <button
              type="button"
              onClick={handleMaxQty}
              className="chip-btn chip-max"
              title="Calculate max affordable / owned shares"
            >
              MAX
            </button>
          </div>
        </div>

        {/* Estimated Consideration Box */}
        <div className="ticket-estimate-box">
          <div className="estimate-row">
            <span className="estimate-label">Est. Price:</span>
            <span className="estimate-val">{formatCurrency(validation.effectivePrice)}</span>
          </div>
          <div className="estimate-row">
            <span className="estimate-label">Simulated Fees:</span>
            <span className="estimate-val text-emerald-400">$0.00</span>
          </div>
          <div className="estimate-row estimate-total-row">
            <span className="estimate-label">Estimated Total:</span>
            <span className="estimate-total-val">
              {formatCurrency(validation.estimatedTotal)}
            </span>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant={isBuy ? 'success' : 'danger'}
          size="lg"
          disabled={!validation.isValid}
          className="ticket-submit-btn"
        >
          {isBuy ? `BUY ${validation.quantity || 0} ${stock.symbol}` : `SELL ${validation.quantity || 0} ${stock.symbol}`}
        </Button>
      </form>

      {/* Confirmation Modal */}
      <OrderConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmOrder}
        symbol={stock.symbol}
        side={side}
        orderType={orderType}
        quantity={validation.quantity}
        price={validation.effectivePrice}
        totalValue={validation.estimatedTotal}
        isExecuting={isExecuting}
      />
    </div>
  );
};
