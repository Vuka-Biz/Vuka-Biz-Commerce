import type { IconName } from '@/components/ui/Icon';

export class ProductRecall {
  constructor(
    readonly batch: string,
    readonly title: string,
    readonly detail: string,
  ) {}
}

export class ComplianceReport {
  constructor(
    readonly tracedProducts: number,
    readonly totalProducts: number,
    readonly sealStatus: string,
  ) {}

  get isFullyCompliant(): boolean {
    return this.tracedProducts === this.totalProducts;
  }

  get percent(): number {
    return Math.round((this.tracedProducts / this.totalProducts) * 100);
  }
}

export class ExpiringItem {
  constructor(
    readonly name: string,
    readonly supplier: string,
    readonly unitsLeft: string,
    readonly daysLeft: number,
    readonly icon: IconName,
  ) {}
}

export class SafetyTip {
  constructor(
    readonly title: string,
    readonly body: string,
    readonly icon: IconName,
  ) {}
}

export class Hotline {
  constructor(
    readonly name: string,
    readonly number: string,
    readonly icon: IconName,
  ) {}

  get telUrl(): string {
    return `tel:${this.number.replace(/\s/g, '')}`;
  }
}
