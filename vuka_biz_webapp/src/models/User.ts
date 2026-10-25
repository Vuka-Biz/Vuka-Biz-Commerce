export type UserRole = 'owner' | 'driver' | 'admin';

export class Shop {
  constructor(
    readonly name: string,
    readonly zone: string,
    readonly memberSince: string,
  ) {}
}

export class User {
  constructor(
    readonly id: string,
    readonly fullName: string,
    readonly phone: string,
    readonly role: UserRole,
    readonly shop: Shop,
  ) {}

  get firstName(): string {
    return this.fullName.split(' ')[0];
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
