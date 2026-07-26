import { majorToMinor, minorToMajor } from '@/domain/money';

export interface StockHolding {
  symbol: string;
  sharesCount: number;
  purchasePriceVNDMajor: number;
}

export interface StockQuote {
  symbol: string;
  name: string;
  priceVND: number;
  changePercent: string;
  exchange: string;
}

export interface ValuationResult {
  symbol: string;
  sharesCount: number;
  totalMarketValueMinor: number;
  unrealizedProfitLossMinor: number;
  profitMarginPercent: number;
}

/**
 * Calculates current market value & unrealized PnL for stock holdings.
 */
export function calculateStockValuation(
  holding: StockHolding,
  currentQuote: StockQuote
): ValuationResult {
  const currentPriceVND = currentQuote.priceVND;
  const totalMarketValueMajor = holding.sharesCount * currentPriceVND;
  const totalCostMajor = holding.sharesCount * holding.purchasePriceVNDMajor;

  const unrealizedPnLMajor = totalMarketValueMajor - totalCostMajor;
  const profitMarginPercent = totalCostMajor > 0 
    ? ((unrealizedPnLMajor / totalCostMajor) * 100) 
    : 0;

  return {
    symbol: holding.symbol,
    sharesCount: holding.sharesCount,
    totalMarketValueMinor: majorToMinor(totalMarketValueMajor, 'VND'),
    unrealizedProfitLossMinor: majorToMinor(unrealizedPnLMajor, 'VND'),
    profitMarginPercent: parseFloat(profitMarginPercent.toFixed(2)),
  };
}
