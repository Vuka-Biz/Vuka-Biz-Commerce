import type { IconName } from '@/components/ui/Icon';

import { Money } from './Money';

export class Vehicle {
  constructor(
    readonly model: string,
    readonly plate: string,
    readonly type: string,
    readonly colour: string,
    readonly payloadKg: number,
  ) {}

  get description(): string {
    return `${this.colour} ${this.type.toLowerCase()} • ${this.model}`;
  }
}

export class Driver {
  constructor(
    readonly fullName: string,
    readonly phone: string,
    readonly rating: number,
    readonly safeDrops: number,
    readonly vehicle: Vehicle,
    readonly verified = true,
  ) {}

  get firstName(): string {
    return this.fullName.split(' ')[0];
  }

  /** "Sipho M." */
  get displayName(): string {
    const [first, last] = this.fullName.split(' ');
    return last ? `${first} ${last[0]}.` : first;
  }

  get initials(): string {
    return this.fullName
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }
}

export type StepStatus = 'done' | 'active' | 'pending';

export class RouteStop {
  constructor(
    readonly name: string,
    readonly status: StepStatus,
    readonly isYou = false,
  ) {}

  withStatus(status: StepStatus): RouteStop {
    return new RouteStop(this.name, status, this.isYou);
  }
}

export class Milestone {
  constructor(
    readonly title: string,
    readonly time: string,
    readonly detail: string,
    readonly status: StepStatus,
    readonly icon: IconName,
    readonly proof?: string,
  ) {}

  withStatus(status: StepStatus, time = this.time): Milestone {
    return new Milestone(this.title, time, this.detail, status, this.icon, this.proof);
  }
}

/** A spaza owner's live incoming order. */
export class Order {
  constructor(
    readonly id: string,
    readonly corridor: string,
    readonly etaTime: string,
    readonly etaMinutes: number,
    readonly distanceKm: number,
    readonly nearestLandmark: string,
    readonly stops: readonly RouteStop[],
    readonly driver: Driver,
    readonly handoverPin: string,
    readonly milestones: readonly Milestone[],
    readonly escrowAmount: Money,
    readonly supplier: string,
  ) {}

  get pinDigits(): string[] {
    return this.handoverPin.split('');
  }

  get completedMilestones(): number {
    return this.milestones.filter((m) => m.status === 'done').length;
  }

  get progress(): number {
    // Active milestones count as half-way there.
    const active = this.milestones.filter((m) => m.status === 'active').length;
    return (this.completedMilestones + active * 0.5) / this.milestones.length;
  }

  get yourStopNumber(): number {
    return this.stops.findIndex((s) => s.isYou) + 1;
  }

  get isDelivered(): boolean {
    return this.milestones.every((m) => m.status === 'done');
  }

  /** One-line status for the live tracking pill. */
  get statusLabel(): string {
    if (this.isDelivered) return `Delivered • ${this.escrowAmount.format()} released to ${this.supplier}`;
    const next = this.milestones.find((m) => m.status !== 'done');
    // Milestones run: placed → picked up → on the way → delivered.
    if (next === this.milestones[this.milestones.length - 2]) return `En route • arriving in ~${this.etaMinutes} mins`;
    return `Loading at ${this.supplier}`;
  }

  /** Completes the active milestone and starts the next one. Never completes the final handover. */
  advance(time: string): Order {
    const last = this.milestones.length - 1;
    const index = this.milestones.findIndex((m) => m.status !== 'done');
    if (index < 0 || index >= last) return this;
    const current = this.milestones[index];
    // Stay en route until the driver enters the PIN.
    if (current.status === 'active' && index + 1 === last) return this;
    const milestones = this.milestones.map((m, i) => {
      if (i === index) return current.status === 'active' ? m.withStatus('done', time) : m.withStatus('active', time);
      if (i === index + 1 && current.status === 'active') return m.withStatus('active', time);
      return m;
    });
    return this.with({ milestones });
  }

  /** The owner's PIN was accepted by the driver: escrow pays the supplier. */
  markDelivered(time: string): Order {
    const milestones = this.milestones.map((m) => (m.status === 'done' ? m : m.withStatus('done', time)));
    const you = this.stops.findIndex((s) => s.isYou);
    const stops = this.stops.map((s, i) => (i <= you ? s.withStatus('done') : i === you + 1 ? s.withStatus('active') : s));
    return this.with({ milestones, stops, etaMinutes: 0, distanceKm: 0, etaTime: time });
  }

  private with(patch: Partial<Pick<Order, 'milestones' | 'stops' | 'etaMinutes' | 'distanceKm' | 'etaTime'>>): Order {
    const o = { ...this.fields, ...patch };
    return new Order(
      o.id,
      o.corridor,
      o.etaTime,
      o.etaMinutes,
      o.distanceKm,
      o.nearestLandmark,
      o.stops,
      o.driver,
      o.handoverPin,
      o.milestones,
      o.escrowAmount,
      o.supplier,
    );
  }

  private get fields() {
    const { id, corridor, etaTime, etaMinutes, distanceKm, nearestLandmark, stops, driver, handoverPin, milestones, escrowAmount, supplier } = this;
    return { id, corridor, etaTime, etaMinutes, distanceKm, nearestLandmark, stops, driver, handoverPin, milestones, escrowAmount, supplier };
  }
}

/* ---------- Driver side ---------- */

export class RouteOffer {
  constructor(
    readonly drops: number,
    readonly distanceKm: number,
    readonly freightTitle: string,
    readonly freightDetail: string,
    readonly pickup: string,
    readonly dropZone: string,
    readonly estMinutes: number,
    readonly roadNote: string,
    readonly grossPayout: Money,
    readonly fuelCost: Money,
  ) {}

  get netProfit(): Money {
    return this.grossPayout.subtract(this.fuelCost);
  }
}

export type DropStatus = 'done' | 'arrived' | 'locked' | 'queued';

export class DeliveryDrop {
  constructor(
    readonly orderId: string,
    readonly shopName: string,
    readonly contactName: string,
    readonly cargo: string,
    readonly status: DropStatus,
    readonly payout: Money,
  ) {}
}

/** The cargo on the driver's bakkie. PINs are checked by the API, never on the driver's phone. */
export class CargoBatch {
  constructor(
    readonly manifestId: string,
    readonly depot: string,
    readonly drops: readonly DeliveryDrop[],
  ) {}

  get currentIndex(): number {
    return this.drops.findIndex((d) => d.status === 'arrived');
  }

  get currentDrop(): DeliveryDrop | undefined {
    return this.drops[this.currentIndex];
  }

  get isEmpty(): boolean {
    return this.drops.length === 0;
  }

  get isComplete(): boolean {
    return this.drops.every((d) => d.status === 'done');
  }
}

export class DriverShift {
  constructor(
    readonly driver: Driver,
    readonly fuelPercent: number,
    readonly dailyNet: Money,
    readonly tripsToday: number,
    readonly weeklyPayout: Money,
    readonly payoutDay: string,
  ) {}

  credit(amount: Money): DriverShift {
    return new DriverShift(
      this.driver,
      this.fuelPercent,
      this.dailyNet.add(amount),
      this.tripsToday,
      this.weeklyPayout,
      this.payoutDay,
    );
  }
}
