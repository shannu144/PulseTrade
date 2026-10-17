import { describe, it, expect } from 'vitest';
import { validateOrderTicket } from '../utils/validation';

describe('Order Ticket Validation', () => {
  const baseParams = {
    side: 'BUY' as const,
    orderType: 'MARKET' as const,
    quantityStr: '10',
    limitPriceStr: '150.00',
    currentPrice: 150.0,
    availableCash: 5000.0,
    sharesOwned: 20,
  };

  it('validates a correct market buy order', () => {
    const result = validateOrderTicket(baseParams);
    expect(result.isValid).toBe(true);
    expect(result.quantity).toBe(10);
    expect(result.effectivePrice).toBe(150.0);
    expect(result.estimatedTotal).toBe(1500.0);
    expect(result.errors).toEqual({});
  });

  it('rejects empty or non-integer quantities', () => {
    const resEmpty = validateOrderTicket({ ...baseParams, quantityStr: '' });
    expect(resEmpty.isValid).toBe(false);
    expect(resEmpty.errors.quantity).toBe('Quantity is required');

    const resDecimal = validateOrderTicket({ ...baseParams, quantityStr: '10.5' });
    expect(resDecimal.isValid).toBe(false);
    expect(resDecimal.errors.quantity).toBe('Quantity must be a positive whole number');

    const resNegative = validateOrderTicket({ ...baseParams, quantityStr: '-5' });
    expect(resNegative.isValid).toBe(false);
    expect(resNegative.errors.quantity).toBe('Quantity must be a positive whole number');
  });

  it('enforces maximum order size', () => {
    const res = validateOrderTicket({ ...baseParams, quantityStr: '2000000' });
    expect(res.isValid).toBe(false);
    expect(res.errors.quantity).toBe('Maximum single order limit is 1,000,000 shares');
  });

  it('requires and validates limit price for limit orders', () => {
    const resLimitEmpty = validateOrderTicket({
      ...baseParams,
      orderType: 'LIMIT',
      limitPriceStr: '',
    });
    expect(resLimitEmpty.isValid).toBe(false);
    expect(resLimitEmpty.errors.limitPrice).toBe('Limit price is required for limit orders');

    const resLimitZero = validateOrderTicket({
      ...baseParams,
      orderType: 'LIMIT',
      limitPriceStr: '0',
    });
    expect(resLimitZero.isValid).toBe(false);
    expect(resLimitZero.errors.limitPrice).toBe('Limit price must be greater than $0.00');

    const resLimitValid = validateOrderTicket({
      ...baseParams,
      orderType: 'LIMIT',
      limitPriceStr: '148.50',
    });
    expect(resLimitValid.isValid).toBe(true);
    expect(resLimitValid.effectivePrice).toBe(148.5);
    expect(resLimitValid.estimatedTotal).toBe(1485.0);
  });

  it('prevents buy orders that exceed available cash', () => {
    const res = validateOrderTicket({
      ...baseParams,
      quantityStr: '50', // 50 * 150 = $7500 > $5000 cash
      availableCash: 5000,
    });
    expect(res.isValid).toBe(false);
    expect(res.errors.quantity).toContain('Insufficient cash');
  });

  it('prevents sell orders exceeding owned shares', () => {
    const res = validateOrderTicket({
      ...baseParams,
      side: 'SELL',
      quantityStr: '25', // owns 20
      sharesOwned: 20,
    });
    expect(res.isValid).toBe(false);
    expect(res.errors.quantity).toBe('Cannot sell 25 shares; you only own 20');
  });

  it('allows sell orders within owned share limits', () => {
    const res = validateOrderTicket({
      ...baseParams,
      side: 'SELL',
      quantityStr: '20',
      sharesOwned: 20,
    });
    expect(res.isValid).toBe(true);
    expect(res.errors).toEqual({});
  });
});
