/** Immutable South African Rand amount. */
export class Money {
  static readonly zero = new Money(0);

  constructor(readonly amount: number) {}

  static of(amount: number): Money {
    return new Money(amount);
  }

  add(other: Money): Money {
    return new Money(this.amount + other.amount);
  }

  subtract(other: Money): Money {
    return new Money(this.amount - other.amount);
  }

  multiply(factor: number): Money {
    return new Money(this.amount * factor);
  }

  get isZero(): boolean {
    return this.amount === 0;
  }

  /** "R1,309" or, with cents, "R1,309.00". Negative values render as "-R17". */
  format(options: { cents?: boolean } = {}): string {
    const abs = Math.abs(this.amount);
    const fixed = options.cents ? abs.toFixed(2) : Math.round(abs).toString();
    const [whole, fraction] = fixed.split('.');
    const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    const sign = this.amount < 0 ? '-' : '';
    return `${sign}R${grouped}${fraction ? `.${fraction}` : ''}`;
  }

  toString(): string {
    return this.format();
  }
}
