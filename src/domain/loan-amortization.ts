import { majorToMinor, minorToMajor } from '@/domain/money';

export interface AmortizationMonth {
  month: number;
  principalPaymentMajor: number;
  interestPaymentMajor: number;
  totalMonthlyPaymentMajor: number;
  remainingPrincipalMajor: number;
}

export interface AmortizationScheduleResult {
  loanAmountMajor: number;
  annualInterestRatePercent: number;
  tenureMonths: number;
  totalInterestPaidMajor: number;
  totalPaymentMajor: number;
  schedule: AmortizationMonth[];
}

/**
 * Calculates loan amortization schedule with decreasing principal payments (Gốc đều, lãi giảm dần).
 */
export function calculateDecreasingLoanAmortization(
  principalVNDMajor: number,
  annualInterestRatePercent: number,
  tenureMonths: number
): AmortizationScheduleResult {
  const monthlyPrincipal = principalVNDMajor / tenureMonths;
  const monthlyInterestRate = (annualInterestRatePercent / 100) / 12;

  let remainingPrincipal = principalVNDMajor;
  let totalInterestPaid = 0;
  const schedule: AmortizationMonth[] = [];

  for (let m = 1; m <= tenureMonths; m++) {
    const interestPayment = remainingPrincipal * monthlyInterestRate;
    const totalPayment = monthlyPrincipal + interestPayment;
    remainingPrincipal -= monthlyPrincipal;
    totalInterestPaid += interestPayment;

    schedule.push({
      month: m,
      principalPaymentMajor: Math.round(monthlyPrincipal),
      interestPaymentMajor: Math.round(interestPayment),
      totalMonthlyPaymentMajor: Math.round(totalPayment),
      remainingPrincipalMajor: Math.max(0, Math.round(remainingPrincipal)),
    });
  }

  return {
    loanAmountMajor: Math.round(principalVNDMajor),
    annualInterestRatePercent,
    tenureMonths,
    totalInterestPaidMajor: Math.round(totalInterestPaid),
    totalPaymentMajor: Math.round(principalVNDMajor + totalInterestPaid),
    schedule,
  };
}
