export type OrderSide = 'BUY' | 'SELL';
export type OrderType = 'MARKET' | 'LIMIT';
export type OrderStatus = 'FILLED' | 'CANCELLED' | 'REJECTED';

export interface SimulatedOrder {
  id: string;
  timestamp: number;
  symbol: string;
  side: OrderSide;
  type: OrderType;
  quantity: number;
  limitPrice?: number;
  executedPrice: number;
  totalValue: number;
  status: OrderStatus;
  note?: string;
}

export interface PortfolioHolding {
  symbol: string;
  quantity: number;
  averageBuyPrice: number;
  totalCost: number;
  currentPrice: number;
  currentValue: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
}

export interface UserPortfolio {
  cash: number;
  holdings: Record<string, PortfolioHolding>;
  orderHistory: SimulatedOrder[];
  initialBalance: number;
}

export interface OrderTicketFormState {
  side: OrderSide;
  orderType: OrderType;
  quantity: string;
  limitPrice: string;
}

export interface OrderValidationError {
  quantity?: string;
  limitPrice?: string;
  general?: string;
}
