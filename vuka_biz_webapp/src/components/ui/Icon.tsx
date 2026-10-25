import { type AndroidSymbol, type SFSymbol, SymbolView } from 'expo-symbols';
import { PureComponent } from 'react';
import type { ColorValue, StyleProp, ViewStyle } from 'react-native';

import { Palette } from '@/theme/tokens';

/**
 * Material Symbol name (used on Android & web, same names as the mockups)
 * mapped to the closest SF Symbol for iOS.
 */
const SYMBOLS = {
  account_balance: 'building.columns',
  account_balance_wallet: 'wallet.pass',
  add: 'plus',
  alt_route: 'arrow.triangle.branch',
  arrow_back: 'chevron.left',
  arrow_forward: 'arrow.right',
  bakery_dining: 'birthday.cake',
  barcode_scanner: 'barcode.viewfinder',
  bolt: 'bolt.fill',
  calendar_today: 'calendar',
  call: 'phone.fill',
  chat: 'message.fill',
  check: 'checkmark',
  check_circle: 'checkmark.circle.fill',
  chevron_right: 'chevron.right',
  close: 'xmark',
  credit_card: 'creditcard',
  domain_add: 'building.2',
  eco: 'leaf',
  emergency: 'staroflife',
  event_busy: 'calendar.badge.exclamationmark',
  file_download: 'arrow.down.doc',
  flag: 'flag.fill',
  flash_on: 'bolt.fill',
  group: 'person.3.fill',
  help: 'questionmark.circle',
  history: 'clock.arrow.circlepath',
  inventory_2: 'shippingbox',
  key: 'key.fill',
  local_drink: 'cup.and.saucer',
  local_gas_station: 'fuelpump',
  local_shipping: 'truck.box',
  location_on: 'mappin.and.ellipse',
  lock: 'lock.fill',
  lock_open: 'lock.open.fill',
  logout: 'rectangle.portrait.and.arrow.right',
  menu_book: 'book',
  monitoring: 'chart.xyaxis.line',
  near_me: 'location.fill',
  notifications: 'bell',
  nutrition: 'carrot',
  package_2: 'shippingbox.fill',
  payments: 'banknote',
  person: 'person.fill',
  phone_in_talk: 'phone.fill',
  photo_camera: 'camera.fill',
  pin: 'number',
  point_of_sale: 'dollarsign.square',
  policy: 'doc.text.magnifyingglass',
  price_check: 'dollarsign.circle',
  qr_code_scanner: 'qrcode.viewfinder',
  radio_button_unchecked: 'circle',
  receipt_long: 'doc.text',
  remove: 'minus',
  report_problem: 'exclamationmark.bubble',
  savings: 'dollarsign.circle',
  schedule: 'clock',
  science: 'flask',
  search: 'magnifyingglass',
  sell: 'tag.fill',
  sensors: 'dot.radiowaves.left.and.right',
  shield: 'shield.fill',
  shopping_cart: 'cart.fill',
  smartphone: 'iphone',
  spellcheck: 'textformat.abc',
  star: 'star.fill',
  storefront: 'storefront',
  support_agent: 'headphones',
  sync: 'arrow.triangle.2.circlepath',
  task_alt: 'checkmark.circle',
  timer: 'timer',
  trending_up: 'chart.line.uptrend.xyaxis',
  verified: 'checkmark.seal.fill',
  verified_user: 'checkmark.shield',
  visibility: 'eye',
  visibility_off: 'eye.slash',
  warehouse: 'building.2',
  warning: 'exclamationmark.triangle.fill',
} as const satisfies Partial<Record<AndroidSymbol, SFSymbol>>;

export type IconName = keyof typeof SYMBOLS;

export type IconProps = {
  name: IconName;
  size?: number;
  color?: ColorValue;
  style?: StyleProp<ViewStyle>;
};

export class Icon extends PureComponent<IconProps> {
  static readonly symbols = SYMBOLS;

  render() {
    const { name, size = 24, color = Palette.text, style } = this.props;
    return (
      <SymbolView
        name={{ ios: Icon.symbols[name], android: name, web: name }}
        size={size}
        tintColor={color}
        style={style}
        accessibilityElementsHidden
        importantForAccessibility="no"
      />
    );
  }
}
