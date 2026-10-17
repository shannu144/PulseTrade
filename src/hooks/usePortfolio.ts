import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  OrderSide,
  OrderType,
  PortfolioHolding,
  SimulatedOrder,
  UserPortfolio,
} from '../types/orders';
import { Stock } from '../types/market';

const PORTFOLIO_STORAGE_KEY = 'pulsetrade_simulated_portfolio';
const DEFAULT_INITIAL_CASH = 100000;

const INITIAL_PORTFOLIO_STATE: UserPortfolio = {
  cash: DEFAULT_INITIAL_CASH,
  initialBalance: DEFAULT_INITIAL_CASH,
  holdings: {
    AAPL: {
      symbol: 'AAPL',
      quantity: 50,
      averageBuyPrice: 220.0,
      totalCost: 11000.0,
      currentPrice: 228.52,
      currentValue: 11426.0,
      unrealizedPnL: 426.0,
      unrealizedPnLPercent: 3.87,
    },
    NVDA: {
      symbol: 'NVDA',
      quantity: 100,
      averageBuyPrice: 125.0,
      totalCost: 12500.0,
      currentPrice: 138.45,
      currentValue: 13845.0,
      unrealizedPnL: 1345.0,
      unrealizedPnLPercent: 10.76,
    },
  },
  orderHistory: [
    {
      id: 'ord_init_1',
      timestamp: Date.now() - 86400000 * 3,
      symbol: 'AAPL',
      side: 'BUY',
      type: 'MARKET',
      quantity: 50,
      executedPrice: 220.0,
      totalValue: 11000.0,
      status: 'FILLED',
      note: 'Initial Seed Position',
    },
    {
      id: 'ord_init_2',
      timestamp: Date.now() - 86400000 * 2,
      symbol: 'NVDA',
      side: 'BUY',
      type: 'MARKET',
      quantity: 100,
      executedPrice: 125.0,
      totalValue: 12500.0,
      status: 'FILLED',
      note: 'Initial Seed Position',
    },
  ],
};

export interface PlaceOrderParams {
  symbol: string;
  side: OrderSide;
  type: OrderType;
  quantity: number;
  limitPrice?: number;
  currentPrice: number;
}

export function usePortfolio(stocks: Record<string, Stock>) {
  const [portfolio, setPortfolio] = useState<UserPortfolio>(() => {
    try {
      const saved = localStorage.getItem(PORTFOLIO_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Ignore parse error
    }
    return INITIAL_PORTFOLIO_STATE;
  });

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(PORTFOLIO_STORAGE_KEY, JSON.stringify(portfolio));
    } catch {
      // Ignore quota errors
    }
  }, [portfolio]);

  // Execute a simulated order
  const executeOrder = useCallback(
    (params: PlaceOrderParams): SimulatedOrder => {
      const { symbol, side, type, quantity, limitPrice, currentPrice } = params;

      // Realistic slippage model: +- 0.05% for market orders
      let executedPrice = currentPrice;
      if (type === 'MARKET') {
        const slippagePercent = (Math.random() * 0.001 - 0.0005);
        executedPrice = Number((currentPrice * (1 + slippagePercent)).toFixed(2));
      } else if (limitPrice) {
        executedPrice = limitPrice;
      }

      const totalValue = Number((quantity * executedPrice).toFixed(2));

      const newOrder: SimulatedOrder = {
        id: `ord_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        timestamp: Date.now(),
        symbol: symbol.toUpperCase(),
        side,
        type,
        quantity,
        limitPrice,
        executedPrice,
        totalValue,
        status: 'FILLED',
      };

      setPortfolio((prev) => {
        const nextCash =
          side === 'BUY'
            ? Number((prev.cash - totalValue).toFixed(2))
            : Number((prev.cash + totalValue).toFixed(2));

        const existingHolding = prev.holdings[symbol.toUpperCase()];
        const nextHoldings = { ...prev.holdings };

        if (side === 'BUY') {
          if (existingHolding) {
            const nextQty = existingHolding.quantity + quantity;
            const nextTotalCost = existingHolding.totalCost + totalValue;
            const nextAvgPrice = Number((nextTotalCost / nextQty).toFixed(2));

            nextHoldings[symbol.toUpperCase()] = {
              ...existingHolding,
              quantity: nextQty,
              averageBuyPrice: nextAvgPrice,
              totalCost: nextTotalCost,
            };
          } else {
            nextHoldings[symbol.toUpperCase()] = {
              symbol: symbol.toUpperCase(),
              quantity,
              averageBuyPrice: executedPrice,
              totalCost: totalValue,
              currentPrice: executedPrice,
              currentValue: totalValue,
              unrealizedPnL: 0,
              unrealizedPnLPercent: 0,
            };
          }
        } else {
          // SELL
          if (existingHolding) {
            const nextQty = existingHolding.quantity - quantity;
            if (nextQty <= 0) {
              delete nextHoldings[symbol.toUpperCase()];
            } else {
              const proportion = nextQty / existingHolding.quantity;
              const nextTotalCost = Number((existingHolding.totalCost * proportion).toFixed(2));
              nextHoldings[symbol.toUpperCase()] = {
                ...existingHolding,
                quantity: nextQty,
                totalCost: nextTotalCost,
              };
            }
          }
        }

        return {
          ...prev,
          cash: nextCash,
          holdings: nextHoldings,
          orderHistory: [newOrder, ...prev.orderHistory],
        };
      });

      return newOrder;
    },
    []
  );

  const resetAccount = useCallback(() => {
    setPortfolio({
      cash: DEFAULT_INITIAL_CASH,
      initialBalance: DEFAULT_INITIAL_CASH,
      holdings: {},
      orderHistory: [],
    });
  }, []);

  // Compute live portfolio holdings and totals reflecting live stock prices
  const liveHoldings = useMemo<Record<string, PortfolioHolding>>(() => {
    const updated: Record<string, PortfolioHolding> = {};

    Object.values(portfolio.holdings).forEach((holding) => {
      const liveStock = stocks[holding.symbol];
      const livePrice = liveStock ? liveStock.currentPrice : holding.averageBuyPrice;
      const currentValue = Number((holding.quantity * livePrice).toFixed(2));
      const unrealizedPnL = Number((currentValue - holding.totalCost).toFixed(2));
      const unrealizedPnLPercent =
        holding.totalCost > 0
          ? Number(((unrealizedPnL / holding.totalCost) * 100).toFixed(2))
          : 0;

      updated[holding.symbol] = {
        ...holding,
        currentPrice: livePrice,
        currentValue,
        unrealizedPnL,
        unrealizedPnLPercent,
      };
    });

    return updated;
  }, [portfolio.holdings, stocks]);

  const summary = useMemo(() => {
    let totalHoldingsValue = 0;
    let totalCost = 0;

    Object.values(liveHoldings).forEach((h) => {
      totalHoldingsValue += h.currentValue;
      totalCost += h.totalCost;
    });

    const totalEquity = Number((portfolio.cash + totalHoldingsValue).toFixed(2));
    const totalUnrealizedPnL = Number((totalHoldingsValue - totalCost).toFixed(2));
    const totalReturn = Number((totalEquity - portfolio.initialBalance).toFixed(2));
    const totalReturnPercent = Number(
      ((totalReturn / portfolio.initialBalance) * 100).toFixed(2)
    );

    return {
      cash: portfolio.cash,
      totalHoldingsValue,
      totalEquity,
      totalUnrealizedPnL,
      totalReturn,
      totalReturnPercent,
      initialBalance: portfolio.initialBalance,
      orderCount: portfolio.orderHistory.length,
      positionsCount: Object.keys(liveHoldings).length,
    };
  }, [portfolio.cash, portfolio.initialBalance, portfolio.orderHistory.length, liveHoldings]);

  return {
    cash: portfolio.cash,
    holdings: liveHoldings,
    orderHistory: portfolio.orderHistory,
    summary,
    executeOrder,
    resetAccount,
  };
}
