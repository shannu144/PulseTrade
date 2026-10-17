import { OrderSide, OrderType, OrderValidationError } from '../types/orders';

export interface ValidationParams {
  side: OrderSide;
  orderType: OrderType;
  quantityStr: string;
  limitPriceStr: string;
  currentPrice: number;
  availableCash: number;
  sharesOwned: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: OrderValidationError;
  quantity: number;
  effectivePrice: number;
  estimatedTotal: number;
}

export function validateOrderTicket(params: ValidationParams): ValidationResult {
  const {
    side,
    orderType,
    quantityStr,
    limitPriceStr,
    currentPrice,
    availableCash,
    sharesOwned,
  } = params;

  const errors: OrderValidationError = {};

  // 1. Quantity validation
  const trimmedQty = quantityStr.trim();
  const quantity = Number(trimmedQty);

  if (!trimmedQty) {
    errors.quantity = 'Quantity is required';
  } else if (isNaN(quantity) || !Number.isInteger(quantity) || quantity <= 0) {
    errors.quantity = 'Quantity must be a positive whole number';
  } else if (quantity > 1_000_000) {
    errors.quantity = 'Maximum single order limit is 1,000,000 shares';
  }

  // 2. Price validation
  let effectivePrice = currentPrice;

  if (orderType === 'LIMIT') {
    const trimmedPrice = limitPriceStr.trim();
    const limitPrice = Number(trimmedPrice);

    if (!trimmedPrice) {
      errors.limitPrice = 'Limit price is required for limit orders';
    } else if (isNaN(limitPrice) || limitPrice <= 0) {
      errors.limitPrice = 'Limit price must be greater than $0.00';
    } else {
      effectivePrice = limitPrice;
    }
  }

  // 3. Estimated total
  const estimatedTotal = (Number.isFinite(quantity) && quantity > 0)
    ? quantity * effectivePrice
    : 0;

  // 4. Balance / Position constraints
  if (!errors.quantity && !errors.limitPrice) {
    if (side === 'BUY') {
      if (estimatedTotal > availableCash) {
        errors.quantity = `Insufficient cash ($${availableCash.toFixed(2)} available, $${estimatedTotal.toFixed(2)} required)`;
      }
    } else if (side === 'SELL') {
      if (quantity > sharesOwned) {
        errors.quantity = `Cannot sell ${quantity} shares; you only own ${sharesOwned}`;
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    quantity: isNaN(quantity) || quantity <= 0 ? 0 : quantity,
    effectivePrice,
    estimatedTotal,
  };
}
