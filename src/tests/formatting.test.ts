import { describe, it, expect } from 'vitest';
import { formatCurrency, formatCurrencyWithSign } from '../utils/formatCurrency';
import { formatPercentage } from '../utils/formatPercentage';
import { formatCompactNumber, formatNumberWithCommas } from '../utils/formatNumber';

describe('Formatting Utilities', () => {
  describe('formatCurrency', () => {
    it('formats positive numbers as standard USD currency', () => {
      expect(formatCurrency(1234.56)).toBe('$1,234.56');
      expect(formatCurrency(0.5)).toBe('$0.50');
      expect(formatCurrency(100)).toBe('$100.00');
    });

    it('formats zero correctly', () => {
      expect(formatCurrency(0)).toBe('$0.00');
    });

    it('formats negative numbers correctly', () => {
      expect(formatCurrency(-45.2)).toBe('-$45.20');
    });

    it('gracefully handles null, undefined, NaN, and Infinity without crashing or rendering NaN', () => {
      expect(formatCurrency(null)).toBe('$0.00');
      expect(formatCurrency(undefined)).toBe('$0.00');
      expect(formatCurrency(NaN)).toBe('$0.00');
      expect(formatCurrency(Infinity)).toBe('$0.00');
      expect(formatCurrency(-Infinity)).toBe('$0.00');
    });
  });

  describe('formatCurrencyWithSign', () => {
    it('adds a + sign to positive currency values', () => {
      expect(formatCurrencyWithSign(15.2)).toBe('+$15.20');
    });

    it('retains minus sign on negative values', () => {
      expect(formatCurrencyWithSign(-8.75)).toBe('-$8.75');
    });

    it('handles zero without sign', () => {
      expect(formatCurrencyWithSign(0)).toBe('$0.00');
    });
  });

  describe('formatPercentage', () => {
    it('formats positive percentages with + sign and % symbol', () => {
      expect(formatPercentage(2.456)).toBe('+2.46%');
      expect(formatPercentage(0.5)).toBe('+0.50%');
    });

    it('formats negative percentages with minus sign', () => {
      expect(formatPercentage(-1.25)).toBe('-1.25%');
    });

    it('handles zero percentage', () => {
      expect(formatPercentage(0)).toBe('0.00%');
    });

    it('handles null and undefined gracefully', () => {
      expect(formatPercentage(null)).toBe('0.00%');
      expect(formatPercentage(undefined)).toBe('0.00%');
      expect(formatPercentage(NaN)).toBe('0.00%');
    });
  });

  describe('formatCompactNumber', () => {
    it('formats thousands, millions, billions, and trillions', () => {
      expect(formatCompactNumber(450)).toBe('450');
      expect(formatCompactNumber(1500)).toBe('1.5K');
      expect(formatCompactNumber(2500000)).toBe('2.50M');
      expect(formatCompactNumber(3400000000)).toBe('3.40B');
      expect(formatCompactNumber(1200000000000)).toBe('1.20T');
    });

    it('handles null and NaN safely', () => {
      expect(formatCompactNumber(null)).toBe('0');
      expect(formatCompactNumber(NaN)).toBe('0');
    });
  });

  describe('formatNumberWithCommas', () => {
    it('formats large integers with thousand commas', () => {
      expect(formatNumberWithCommas(1234567)).toBe('1,234,567');
      expect(formatNumberWithCommas(null)).toBe('0');
    });
  });
});
