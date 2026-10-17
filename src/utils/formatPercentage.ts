/**
 * Formats a percentage change safely.
 * e.g., 2.345 -> "+2.35%", -1.2 -> "-1.20%"
 */
export function formatPercentage(
  value: number | null | undefined,
  includeSign: boolean = true,
  decimals: number = 2
): string {
  if (value === null || value === undefined || isNaN(value) || !isFinite(value)) {
    return '0.00%';
  }

  const sign = includeSign && value > 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)}%`;
}
