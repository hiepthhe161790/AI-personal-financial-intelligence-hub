export interface MoneyVO {
  amountMinor: number;
  currency: string;
}

/**
 * Gets the number of minor units per major unit for a currency (e.g. 1 for VND, 100 for USD).
 */
export function getMinorUnitFactor(currency: string = 'VND'): number {
  switch (currency.toUpperCase()) {
    case 'VND':
      return 1;
    case 'USD':
    case 'EUR':
    case 'SGD':
      return 100;
    default:
      return 1;
  }
}

/**
 * Converts major currency unit (e.g. 100,000 VND or 50.25 USD) to minor unit integer.
 */
export function majorToMinor(amountMajor: number, currency: string = 'VND'): number {
  const factor = getMinorUnitFactor(currency);
  return Math.round(amountMajor * factor);
}

/**
 * Converts minor currency integer to major float.
 */
export function minorToMajor(amountMinor: number, currency: string = 'VND'): number {
  const factor = getMinorUnitFactor(currency);
  return amountMinor / factor;
}

/**
 * Formats money for display in Vietnamese localized format.
 * Example: 150000000 VND -> "150.000.000 ₫"
 */
export function formatMoney(amountMinor: number, currency: string = 'VND'): string {
  const major = minorToMajor(amountMinor, currency);
  
  if (currency.toUpperCase() === 'VND') {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(major);
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    maximumFractionDigits: 2,
  }).format(major);
}

/**
 * Formats a raw numeric string with commas as thousands separators.
 * Handles decimals.
 */
export function formatNumericInput(value: string | number): string {
  if (value === undefined || value === null || value === '') return '';
  
  // Convert to string and remove all non-digits/non-dot characters
  let clean = String(value).replace(/[^0-9.]/g, '');
  
  // Keep only the first decimal point, remove others
  const dotIndex = clean.indexOf('.');
  if (dotIndex !== -1) {
    clean = clean.slice(0, dotIndex + 1) + clean.slice(dotIndex + 1).replace(/\./g, '');
  }
  
  const parts = clean.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
}

/**
 * Parses a comma-separated numeric string back to a float number.
 */
export function parseNumericInput(value: string): number {
  if (!value) return 0;
  const clean = value.replace(/,/g, '');
  return parseFloat(clean) || 0;
}
