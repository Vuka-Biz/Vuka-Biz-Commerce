import { Linking } from 'react-native';

/** Opens the phone dialer / WhatsApp. Resolves false when the device can't. */
export class ContactService {
  static async call(number: string): Promise<boolean> {
    return ContactService.open(`tel:${number.replace(/\s/g, '')}`);
  }

  static async whatsApp(number: string, message: string): Promise<boolean> {
    const digits = number.replace(/\D/g, '').replace(/^0/, '27');
    return ContactService.open(`https://wa.me/${digits}?text=${encodeURIComponent(message)}`);
  }

  private static async open(url: string): Promise<boolean> {
    try {
      await Linking.openURL(url);
      return true;
    } catch {
      return false;
    }
  }
}
