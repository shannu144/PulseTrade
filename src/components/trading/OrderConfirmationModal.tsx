import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { OrderSide, OrderType } from '../../types/orders';
import { formatCurrency } from '../../utils/formatCurrency';
import { ShieldAlert, ArrowRight } from 'lucide-react';

interface OrderConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  symbol: string;
  side: OrderSide;
  orderType: OrderType;
  quantity: number;
  price: number;
  totalValue: number;
  isExecuting?: boolean;
}

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  symbol,
  side,
  orderType,
  quantity,
  price,
  totalValue,
  isExecuting = false,
}) => {
  const isBuy = side === 'BUY';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirm Simulated Order"
      description="Review order details prior to simulated execution"
    >
      <div className="order-confirm-container">
        {/* Order Summary Header */}
        <div className={`order-summary-badge ${isBuy ? 'summary-buy' : 'summary-sell'}`}>
          <span className="summary-side">{side}</span>
          <span className="summary-qty">{quantity} Shares</span>
          <span className="summary-sym">{symbol}</span>
          <span className="summary-type">@{orderType}</span>
        </div>

        {/* Detailed Breakdown Table */}
        <div className="confirm-breakdown-list">
          <div className="confirm-row">
            <span className="confirm-label">Order Type</span>
            <span className="confirm-val">{orderType} ORDER</span>
          </div>
          <div className="confirm-row">
            <span className="confirm-label">{orderType === 'LIMIT' ? 'Limit Price' : 'Reference Price'}</span>
            <span className="confirm-val">{formatCurrency(price)}</span>
          </div>
          <div className="confirm-row">
            <span className="confirm-label">Quantity</span>
            <span className="confirm-val">{quantity} units</span>
          </div>
          <div className="confirm-row">
            <span className="confirm-label">Estimated Commission / Fees</span>
            <span className="confirm-val text-emerald-400">$0.00 (Simulated Zero Fee)</span>
          </div>
          <div className="confirm-row confirm-total-row">
            <span className="confirm-label font-bold">Estimated Total Consideration</span>
            <span className="confirm-val font-bold text-lg text-cyan-300">
              {formatCurrency(totalValue)}
            </span>
          </div>
        </div>

        {/* Disclaimer Warning */}
        <div className="confirm-disclaimer-box">
          <ShieldAlert size={16} className="text-amber-400 shrink-0" />
          <p>
            <strong>Simulated Paper Execution:</strong> This simulated transaction will immediately
            update your paper account portfolio with simulated execution pricing.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="confirm-actions-row">
          <Button variant="ghost" onClick={onClose} disabled={isExecuting}>
            Cancel
          </Button>
          <Button
            variant={isBuy ? 'success' : 'danger'}
            onClick={onConfirm}
            isLoading={isExecuting}
            rightIcon={<ArrowRight size={15} />}
          >
            Confirm {side} Order
          </Button>
        </div>
      </div>
    </Modal>
  );
};
