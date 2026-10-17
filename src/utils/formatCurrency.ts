/**
 * Formats a number into a clean currency string.
 * Guarantees no 'NaN' or 'undefined' will ever be returned.
 */
export function formatCurrency(
  value: number | null | undefined,
  currency: string = 'USD',
  minimumFractionDigits: number = 2,
  maximumFractionDigits: number = 2
): string {
  if (value === null || value === undefined || isNaN(value) || !isFinite(value)) {
    return '$0.00';
  }

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits,
      maximumFractionDigits,
    }).format(value);
  } catch {
    return `$${value.toFixed(2)}`;
  }
}

/**
 * Formats a price with sign indicator (+ or -)
 */
export function formatCurrencyWithSign(
  value: number | null | undefined,
  currency: string = 'USD'
): string {
  if (value === null || value === undefined || isNaN(value) || !isFinite(value)) {
    return '$0.00';
  }

  const sign = value > 0 ? '+' : '';
  return `${sign}${formatCurrency(value, currency)}`;
}
