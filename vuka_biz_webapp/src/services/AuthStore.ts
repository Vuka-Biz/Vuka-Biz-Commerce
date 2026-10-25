import { MockDatabase } from '@/data/MockDatabase';
import { User, type UserRole } from '@/models';

import { FirebaseIdentity } from './FirebaseIdentity';
import { ObservableStore } from './ObservableStore';

type AuthState = { user: User | null };

export type LoginResult = { ok: true; user: User } | { ok: false; error: string };

/** Signs in with Firebase Auth. The account's role claim, not the screen toggle, decides access. */
export class AuthStore extends ObservableStore<AuthState> {
  static readonly instance = new AuthStore();

  private constructor() {
    super({ user: null });
  }

  static normalisePhone(raw: string): string {
    const digits = raw.replace(/\D/g, '');
    // Accept +27 82 ... as well as 082 ...
    return digits.startsWith('27') ? `0${digits.slice(2)}` : digits;
  }

  static isValidPhone(raw: string): boolean {
    return /^0[6-8]\d{8}$/.test(AuthStore.normalisePhone(raw));
  }

  async login(phone: string, pin: string, role: UserRole): Promise<LoginResult> {
    if (!AuthStore.isValidPhone(phone)) {
      return { ok: false, error: 'Enter a valid SA cellphone number, e.g. 071 234 5678.' };
    }
    if (!/^\d{4}$/.test(pin)) return { ok: false, error: 'Your Vuka PIN is 4 digits.' };

    const result = await FirebaseIdentity.signIn(AuthStore.normalisePhone(phone), pin);
    if (!result.ok) return result;
    if (result.role !== role) {
      FirebaseIdentity.signOut();
      return { ok: false, error: `This number is registered as a ${result.role === 'driver' ? 'driver' : 'spaza owner'}. Switch the toggle above.` };
    }

    // Shop and vehicle profiles are still demo data; identity and role come from Firebase.
    const profile = MockDatabase.users.find((u) => u.role === result.role)!;
    const user = new User(result.uid, result.name ?? profile.fullName, AuthStore.normalisePhone(phone), result.role, profile.shop);
    this.setState({ user });
    return { ok: true, user };
  }

  logout(): void {
    FirebaseIdentity.signOut();
    this.setState({ user: null });
  }
}
