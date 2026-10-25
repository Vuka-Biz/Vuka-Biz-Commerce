import type { Money } from './Money';

export class WeeklyFlow {
  constructor(
    readonly label: string,
    readonly sales: number,
    readonly stock: number,
  ) {}

  get salesLabel(): string {
    return `${(this.sales / 1000).toFixed(1)}k`;
  }
}

export class LedgerSummary {
  constructor(
    readonly month: string,
    readonly updatedAt: string,
    readonly grossProfit: Money,
    readonly growthPercent: number,
    readonly cashFloat: Money,
    readonly stockBought: Money,
    readonly poolSavingsPercent: number,
    readonly supplierOrders: number,
    readonly salesLogged: Money,
    readonly weeks: readonly WeeklyFlow[],
    readonly peakDay: string,
    readonly peakTakings: Money,
  ) {}

  get maxWeeklyValue(): number {
    return Math.max(...this.weeks.flatMap((w) => [w.sales, w.stock]));
  }

  /** Books a supplier order paid through Vuka escrow. */
  recordPurchase(amount: Money): LedgerSummary {
    return new LedgerSummary(
      this.month,
      'Just now',
      this.grossProfit,
      this.growthPercent,
      this.cashFloat,
      this.stockBought.add(amount),
      this.poolSavingsPercent,
      this.supplierOrders + 1,
      this.salesLogged,
      this.weeks,
      this.peakDay,
      this.peakTakings,
    );
  }
}

export class CreditScore {
  constructor(
    readonly score: number,
    readonly max: number,
    readonly tier: string,
    readonly standing: string,
    readonly verifiedTrades: number,
    readonly facility: Money,
  ) {}

  /** Points earned for each escrow trade confirmed with a handover PIN. */
  static readonly POINTS_PER_TRADE = 6;

  get ratio(): number {
    return this.score / this.max;
  }

  recordVerifiedTrade(): CreditScore {
    return new CreditScore(
      Math.min(this.max, this.score + CreditScore.POINTS_PER_TRADE),
      this.max,
      this.tier,
      this.standing,
      this.verifiedTrades + 1,
      this.facility,
    );
  }
}

export type FundingStepStatus = 'verified' | 'active' | 'todo';

export class FundingStep {
  constructor(
    readonly title: string,
    readonly detail: string,
    readonly status: FundingStepStatus,
    readonly cost?: string,
  ) {}

  get isComplete(): boolean {
    return this.status !== 'todo';
  }
}

export class FundingReadiness {
  constructor(
    readonly steps: readonly FundingStep[],
    readonly unlockAmount: string,
  ) {}

  get completed(): number {
    return this.steps.filter((s) => s.isComplete).length;
  }

  get remaining(): number {
    return this.steps.length - this.completed;
  }
}
