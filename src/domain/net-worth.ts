import { AccountType } from '@/models/Account';

export interface AccountSummary {
  _id: string;
  name: string;
  type: AccountType;
  currency: string;
  currentBalanceMinor: number;
  lastValuationAt: Date;
  isStale: boolean;
  daysSinceLastValuation: number;
  costBasisMinor?: number;   // Tổng giá vốn đầu tư (chỉ STOCK/CRYPTO/FUND/GOLD)
  purchaseDate?: Date;       // Ngày mua tài sản
}

export interface NetWorthOverview {
  totalAssetsMinor: number;
  totalLiabilitiesMinor: number;
  netWorthMinor: number;
  currency: string;
  accounts: AccountSummary[];
  staleCount: number;
  oldestValuationDate: Date | null;
}

const STALE_THRESHOLD_DAYS = 14;

/**
 * Calculates days elapsed between a date and now.
 */
export function getDaysSince(date: Date): number {
  const now = new Date();
  const past = new Date(date);
  const diffTime = Math.abs(now.getTime() - past.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Checks if a valuation is stale (> 14 days old).
 */
export function isStaleValuation(lastValuationAt: Date, thresholdDays: number = STALE_THRESHOLD_DAYS): boolean {
  return getDaysSince(lastValuationAt) > thresholdDays;
}

/**
 * Computes net worth overview from an array of active account documents.
 */
export function computeNetWorth(rawAccounts: Array<{
  _id: string | object;
  name: string;
  type: AccountType;
  currency: string;
  currentBalanceMinor: number;
  lastValuationAt: Date | string;
  costBasisMinor?: number;
  purchaseDate?: Date | string;
}>): NetWorthOverview {
  let totalAssetsMinor = 0;
  let totalLiabilitiesMinor = 0;
  let staleCount = 0;
  let oldestDate: Date | null = null;

  const accounts: AccountSummary[] = rawAccounts.map((acc) => {
    const valuationDate = new Date(acc.lastValuationAt);
    const daysSince = getDaysSince(valuationDate);
    const isStale = daysSince > STALE_THRESHOLD_DAYS;

    if (isStale) staleCount++;
    if (!oldestDate || valuationDate < oldestDate) {
      oldestDate = valuationDate;
    }

    if (acc.type === 'LIABILITY') {
      totalLiabilitiesMinor += acc.currentBalanceMinor;
    } else {
      totalAssetsMinor += acc.currentBalanceMinor;
    }

    return {
      _id: acc._id.toString(),
      name: acc.name,
      type: acc.type,
      currency: acc.currency,
      currentBalanceMinor: acc.currentBalanceMinor,
      lastValuationAt: valuationDate,
      isStale,
      daysSinceLastValuation: daysSince,
      costBasisMinor: acc.costBasisMinor,
      purchaseDate: acc.purchaseDate ? new Date(acc.purchaseDate) : undefined,
    };
  });

  return {
    totalAssetsMinor,
    totalLiabilitiesMinor,
    netWorthMinor: totalAssetsMinor - totalLiabilitiesMinor,
    currency: 'VND',
    accounts,
    staleCount,
    oldestValuationDate: oldestDate,
  };
}
