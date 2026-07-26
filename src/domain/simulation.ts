export interface ScenarioInput {
  initialNetWorthMinor: number;
  monthlyContributionMinor: number;
  annualReturnRatePercent: number; // e.g. 8 for 8%/year
  annualInflationRatePercent?: number; // e.g. 3.5 for 3.5%/year
  horizonYears: number; // e.g. 5, 10, 20
  targetGoalMinor?: number; // e.g. 5,000,000,000 VND
}

export interface ScenarioPoint {
  month: number;
  year: number;
  yearLabel: string;
  totalAssetsMinor: number;
  totalContributionsMinor: number;
  totalInterestEarnedMinor: number;
  realPurchasingPowerMinor: number;
}

export interface ScenarioResult {
  currency: string;
  input: ScenarioInput;
  points: ScenarioPoint[];
  finalAssetsMinor: number;
  totalDepositedMinor: number;
  totalInterestEarnedMinor: number;
  targetGoalAchieved: boolean;
  monthsToTargetGoal: number | null;
  yearsToTargetGoal: number | null;
}

/**
 * Calculates deterministic compound monthly interest projection points.
 * Uses exact monthly compounding: r_monthly = annualReturnRate / 12 / 100
 */
export function calculateScenarioProjection(input: ScenarioInput): ScenarioResult {
  const {
    initialNetWorthMinor,
    monthlyContributionMinor,
    annualReturnRatePercent,
    annualInflationRatePercent = 3.0,
    horizonYears,
    targetGoalMinor = 0,
  } = input;

  const totalMonths = Math.max(1, horizonYears * 12);
  const rMonthly = annualReturnRatePercent / 12 / 100;
  const iMonthly = annualInflationRatePercent / 12 / 100;

  let currentBalance = initialNetWorthMinor;
  let totalDeposited = initialNetWorthMinor;
  let totalInterest = 0;
  let monthsToGoal: number | null = null;

  const points: ScenarioPoint[] = [
    {
      month: 0,
      year: 0,
      yearLabel: 'Hiện tại',
      totalAssetsMinor: Math.round(initialNetWorthMinor),
      totalContributionsMinor: Math.round(initialNetWorthMinor),
      totalInterestEarnedMinor: 0,
      realPurchasingPowerMinor: Math.round(initialNetWorthMinor),
    },
  ];

  if (targetGoalMinor > 0 && initialNetWorthMinor >= targetGoalMinor) {
    monthsToGoal = 0;
  }

  for (let m = 1; m <= totalMonths; m++) {
    // Monthly interest earned on current balance
    const monthlyInterest = currentBalance * rMonthly;
    currentBalance += monthlyInterest + monthlyContributionMinor;
    totalDeposited += monthlyContributionMinor;
    totalInterest += monthlyInterest;

    // Inflation discount factor
    const discountFactor = Math.pow(1 + iMonthly, m);
    const realPower = currentBalance / discountFactor;

    // Check goal achievement month
    if (targetGoalMinor > 0 && monthsToGoal === null && currentBalance >= targetGoalMinor) {
      monthsToGoal = m;
    }

    // Capture point at end of each year or final month
    if (m % 12 === 0 || m === totalMonths) {
      const yearIndex = Math.ceil(m / 12);
      points.push({
        month: m,
        year: yearIndex,
        yearLabel: `Năm ${yearIndex}`,
        totalAssetsMinor: Math.round(currentBalance),
        totalContributionsMinor: Math.round(totalDeposited),
        totalInterestEarnedMinor: Math.round(totalInterest),
        realPurchasingPowerMinor: Math.round(realPower),
      });
    }
  }

  const targetGoalAchieved = monthsToGoal !== null;
  const yearsToTargetGoal = monthsToGoal !== null ? Math.round((monthsToGoal / 12) * 10) / 10 : null;

  return {
    currency: 'VND',
    input,
    points,
    finalAssetsMinor: Math.round(currentBalance),
    totalDepositedMinor: Math.round(totalDeposited),
    totalInterestEarnedMinor: Math.round(totalInterest),
    targetGoalAchieved,
    monthsToTargetGoal: monthsToGoal,
    yearsToTargetGoal,
  };
}
