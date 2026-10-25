import {
  type ApiOrder,
  CargoBatch,
  Cart,
  ComplianceReport,
  CreditScore,
  DeliveryDrop,
  DeliveryOption,
  Driver,
  DriverShift,
  ExpiringItem,
  FundingReadiness,
  FundingStep,
  Hotline,
  LedgerSummary,
  Milestone,
  Money,
  Order,
  PaymentMethod,
  Product,
  ProductCategory,
  ProductRecall,
  RouteOffer,
  RouteStop,
  SafetyTip,
  Shop,
  User,
  Vehicle,
  WeeklyFlow,
} from '@/models';

/**
 * Dummy data for the whole app. Swap this class for a real API client later:
 * screens only depend on the model classes, never on where they come from.
 */
export class MockDatabase {
  /* ---------- People ---------- */

  static readonly shop = new Shop("Thandi's Spaza", 'Soweto Zone 4', 'March 2025');

  /** Demo accounts. Any of these phone numbers + PIN 1234 will log in. */
  static readonly users: readonly User[] = [
    new User('u-owner', 'Thandi Mokoena', '0712345678', 'owner', MockDatabase.shop),
    new User('u-driver', 'Sipho Mahlangu', '0823456789', 'driver', MockDatabase.shop),
    new User('u-admin', 'Vuka Support', '0601234567', 'admin', new Shop('Vuka Biz HQ', 'Johannesburg', 'October 2026')),
  ];

  static readonly demoPin = '1234';

  static readonly vehicle = new Vehicle('Toyota Hilux', 'CA 123-456', 'Bakkie', 'White', 1000);

  static readonly driver = new Driver('Sipho Mahlangu', '+27823456789', 4.8, 184, MockDatabase.vehicle);

  /* ---------- Marketplace ---------- */

  static readonly categories: readonly ProductCategory[] = [
    new ProductCategory('produce', 'Fresh Produce', 'nutrition'),
    new ProductCategory('bakery', 'Bread & Dairy', 'bakery_dining'),
    new ProductCategory('groceries', 'Groceries', 'inventory_2'),
    new ProductCategory('drinks', 'Drinks', 'local_drink'),
  ];

  static readonly products: readonly Product[] = [
    new Product({
      id: 'p-tomatoes',
      name: 'Tomatoes 10kg Bag',
      supplier: 'Sizwe Agri Co-op',
      category: 'produce',
      packLabel: '10kg Bag',
      unitNote: 'R14.50/kg',
      price: 145,
      weightKg: 10,
      sourceTag: { label: 'Local Farmer', tone: 'accent' },
      highlight: { label: '32% Margin', tone: 'amber' },
      footnote: { label: 'Fresh picked', icon: 'verified', tone: 'accent' },
      icon: 'nutrition',
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuD-8vIEQyUt8VZCoD_MbaxqqNkYJ7lJmDDONcVLpzcmZGu5qJcHgxxTWqCZz3rFSCokiwLUA5R-WwXyvyg-nNVolbz2RfIp5eLWMSz0DTpy5B8IUiunxEFUJapulQkbC9_ks4GH8wc7DyQfNjt5X9sw9IEcGI-OYB_Sll-MKTXqLXMyNdsfv_Ti72kT3yu3h7wn-oesT_2-qEDBHk3lp2a1CgpNtwgwZl1u140l_HmEyQ6f1QhYQrpJ',
    }),
    new Product({
      id: 'p-potatoes',
      name: 'Potatoes 7kg Pocket',
      supplier: 'Limpopo Roots',
      category: 'produce',
      packLabel: '7kg Pocket',
      unitNote: 'R12.70/kg',
      price: 89,
      weightKg: 7,
      sourceTag: { label: 'Local Farmer', tone: 'accent' },
      highlight: { label: 'Grade 1', tone: 'neutral' },
      footnote: { label: 'In stock: 45 sacks', tone: 'neutral' },
      icon: 'nutrition',
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCqh1alX6HukanBkuyHErWUidyNCLhQEiU4hVcTY2eIlalpGdYpT8Md2yH8L5WqDIC35CVlikKtN9H-9Mm_nu2EnxXa3bJkaEPdLIJ0GoKsj7gRIV3_ZCQj8UMLUKSnxQdSbyC0wAYXeKua8UQFOgxP47Nd2LXVInzUC1s_e9hjgZPp1jFmamquNHQXfgPqW_VvQvRKkfDBWzdTAXlza1WbAWzpI37zyGXoWvjeLB7bX8y0eH75ne6A',
    }),
    new Product({
      id: 'p-cabbage',
      name: 'Fresh Cabbage (Bale of 6)',
      supplier: 'Mamelodi Growers',
      category: 'produce',
      packLabel: 'Bale of 6',
      unitNote: 'R12.50 per head',
      price: 75,
      weightKg: 9,
      sourceTag: { label: 'Local Farmer', tone: 'accent' },
      highlight: { label: '38% Margin', tone: 'amber' },
      footnote: { label: 'Harvested yesterday', icon: 'eco', tone: 'accent' },
      icon: 'eco',
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCVvlieb4AzN0REgjkeYKo4zlkuJcHN9GKaHBJHJ_WMv0fw4DWMXwtFh8Ei6_c46Gk7EAMcKlllQ_oW--LQiK6DMAgrt8W4UYg3y1qsXVsZQt3ZJ2uqeDvh_xrqVnFnUJ7U9HbzBNZtnPGdzDUhR473mKQBSZM131MZJOQWX_jopSPhopUVARHEPRFooZL5wuOiD6vOFc0ac0xQXH6-lXYLkU-acowb0E1lCRqMC0UnBRpTGWsUfg-H',
    }),
    new Product({
      id: 'p-bread',
      name: 'Albany Superior White',
      supplier: 'Orlando Bakery',
      category: 'bakery',
      packLabel: 'Crate of 10',
      unitNote: 'R16.80/loaf bulk',
      price: 168,
      weightKg: 7,
      sourceTag: { label: 'Fast Mover', tone: 'neutral' },
      highlight: { label: 'Daily delivery', tone: 'neutral' },
      footnote: { label: '05:30 Drop', icon: 'schedule', tone: 'neutral' },
      icon: 'bakery_dining',
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBCUeBR_gE6rgIupuAZ-h4Bmp_A5teVmy8INt4IHjnP_IY7TAEoRsoN8Q_MC-3ScWKZpz32cVO0qkT4Kbd-7zldKPom1eJskU4rOw3h-dundPohLlt8T4wgi0FO2BgtZkdPnJbnRqyEt1msKTGtlI6MdPbNxKvOg053HXknl_AFCEc3-XmzncM5kY0p1rgHoY5T9U4HRlwjbYgPY82A02KMk0ZXV3p_tb29HqY22z1nxhZvqNRV6bFS',
    }),
    new Product({
      id: 'p-amasi',
      name: 'Amasi 2L (Case of 6)',
      supplier: 'Midlands Dairies',
      category: 'bakery',
      packLabel: 'Case of 6',
      unitNote: 'R31.50 per bottle',
      price: 189,
      weightKg: 12,
      sourceTag: { label: 'Cold Chain', tone: 'neutral' },
      highlight: { label: '22% Margin', tone: 'amber' },
      footnote: { label: 'Keep refrigerated', icon: 'schedule', tone: 'neutral' },
      icon: 'local_drink',
    }),
    new Product({
      id: 'p-oil',
      name: 'Golden Sun Cooking Oil 5L',
      supplier: 'Bophelong Wholesale',
      category: 'groceries',
      packLabel: '5L Jug',
      unitNote: 'Pure Sunflower',
      price: 165,
      weightKg: 4.6,
      sourceTag: { label: 'Bulk Staple', tone: 'neutral' },
      highlight: { label: '24% Margin', tone: 'amber' },
      footnote: { label: 'Standard pallet', tone: 'neutral' },
      icon: 'inventory_2',
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuDcKIVU5aAMY8T90k1q1NrGLnY_Habxj8qUjfBUnv2Z_5R7jpkeCVZ_OOliEJf3XKtZqMPwcENBbyh6tNGBwEYPp2efXZOVLuhOWra23FZpjMpF81-8SmWXh9gd1eWNMYHLeCwNuk8mvPDa5MMZj9I8HqPln71_-K3TzZQpC0YP7LTiltMBHp1QKlhvgqNSm00i-MC5MCsw1COtLcGT6oBabmYT1Ag3uMm8QF_gDHvLkBSnIfRbhNa6',
    }),
    new Product({
      id: 'p-maize',
      name: 'White Star Maize Meal 10kg',
      supplier: 'Gauteng Grain Hub',
      category: 'groceries',
      packLabel: '10kg Sack',
      unitNote: 'Super Maize Staple',
      price: 119,
      weightKg: 10,
      sourceTag: { label: 'Township Core', tone: 'neutral' },
      highlight: { label: 'High volume', tone: 'neutral' },
      footnote: { label: 'Bestseller', icon: 'star', tone: 'amber' },
      icon: 'inventory_2',
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCQUR5HeaFcd3mNtOB2Bd4s9kcbp7OHjrJyC2P_3HHFsosYVIrHAgQsp6CXcuSCLq3c-rJk5FEXLF2m_8312j1atrMn3Y1A7Lpw-mNBrKTZVq3j-lGK9-W7YF94Lafwwp3NgmcHhoRkzncpb6spC85V2UHaFuF82wfVcoXu0CfIgX3G0_uOH56LmS2kU6NeolXRw1gC3p254vOO-WCE8bvk3m6psZIOskUaopem9V_U7aZI8--Ae_16',
    }),
    new Product({
      id: 'p-cooldrink',
      name: 'Cool Drink 2L (Case of 6)',
      supplier: 'Jozi Beverages',
      category: 'drinks',
      packLabel: 'Case of 6',
      unitNote: 'R18.30 per bottle',
      price: 110,
      weightKg: 12.5,
      sourceTag: { label: 'Fast Mover', tone: 'neutral' },
      highlight: { label: '28% Margin', tone: 'amber' },
      footnote: { label: 'Weekend favourite', icon: 'star', tone: 'amber' },
      icon: 'local_drink',
    }),
    new Product({
      id: 'p-water',
      name: 'Still Water 500ml (24 Pack)',
      supplier: 'Drakensberg Springs',
      category: 'drinks',
      packLabel: '24 Pack',
      unitNote: 'R4.10 per bottle',
      price: 98,
      weightKg: 12,
      sourceTag: { label: 'Bulk Staple', tone: 'neutral' },
      highlight: { label: '35% Margin', tone: 'amber' },
      footnote: { label: 'In stock: 80 packs', tone: 'neutral' },
      icon: 'local_drink',
    }),
  ];

  static product(id: string): Product {
    const product = MockDatabase.products.find((p) => p.id === id);
    if (!product) throw new Error(`Unknown product ${id}`);
    return product;
  }

  /** The crate Thandi already started filling (matches the checkout mockup). */
  static starterCart(): Cart {
    return new Cart()
      .add(MockDatabase.product('p-tomatoes'), 2)
      .add(MockDatabase.product('p-potatoes'), 3)
      .add(MockDatabase.product('p-oil'), 2)
      .add(MockDatabase.product('p-bread'), 2);
  }

  /* ---------- Checkout ---------- */

  static readonly deliveryOptions: readonly DeliveryOption[] = [
    new DeliveryOption(
      'pooled',
      'Pooled delivery',
      'Most Popular • Eco Saver (Saves R85)',
      'Tomorrow 10:00–12:00 • 3 shops on route',
      Money.of(69),
      'Pooled',
    ),
    new DeliveryOption(
      'collect',
      'Collect at Vuka Point',
      'Zero Fee',
      "Mama Zodwa's Spaza, 1.2 km away • Ready by 08:30 AM",
      Money.zero,
      'Pickup Point',
    ),
  ];

  static readonly paymentMethods: readonly PaymentMethod[] = [
    new PaymentMethod('card', 'Bank Card', 'credit_card'),
    new PaymentMethod('eft', 'Instant EFT', 'flash_on'),
    new PaymentMethod('qr', 'Capitec / QR', 'qr_code_scanner'),
    new PaymentMethod('voucher', 'Cash Voucher', 'receipt_long'),
  ];

  /* ---------- Orders ---------- */

  static readonly activeOrder = new Order(
    'VB-8841',
    'Soweto Corridor',
    '11:20',
    12,
    2.4,
    'Klipspruit Valley Rd',
    [
      new RouteStop('Mokoena Supermarket', 'done'),
      new RouteStop("Thandi's Spaza", 'active', true),
      new RouteStop('Kasi Corner', 'pending'),
    ],
    MockDatabase.driver,
    '4827',
    [
      new Milestone('Order Placed', '08:30 AM', 'Confirmed by Mpumi Farm Co-op', 'done', 'check'),
      new Milestone(
        'Picked up from Mpumi Farm',
        '09:45 AM',
        '12 Crates • 240 kg verified at depot',
        'done',
        'inventory_2',
        'Manifest photo: Loading Bay 3',
      ),
      new Milestone('On the Way (Next Stop)', '10:10 AM', 'Approaching your location • Soweto Link', 'active', 'local_shipping'),
      new Milestone(
        'Delivered & Confirmed',
        'Pending',
        'Your handover PIN releases payment to the supplier',
        'pending',
        'payments',
      ),
    ],
    Money.of(1309),
    'Mpumi Farm',
  );

  /** Seconds between the simulated dispatch steps (loading → en route) after an order is placed. */
  static readonly DISPATCH_STEP_MS = 8000;

  /**
   * Tracking view of an API order. Placement, escrow total, PIN and delivery are
   * real; pickup and en-route steps are simulated from the order time until
   * live driver GPS is connected.
   */
  static orderFromApi(api: ApiOrder, now = Date.now()): Order {
    const known = api.lines.filter((l) => MockDatabase.products.some((p) => p.id === l.productId));
    const cart = known.reduce((c, l) => c.add(MockDatabase.product(l.productId), l.quantity), new Cart());
    const delivery = MockDatabase.deliveryOptions.find((d) => d.id === api.deliveryId) ?? MockDatabase.deliveryOptions[0];
    const supplier = cart.lines[0]?.product.supplier ?? 'Mpumi Farm';
    const placedAt = Date.parse(api.createdAt);
    const time = (ms: number) => {
      const d = new Date(ms);
      return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    };

    let order = new Order(
      api.id,
      'Soweto Corridor',
      time(placedAt + 25 * 60_000),
      25,
      6.8,
      'Klipspruit Valley Rd',
      [
        new RouteStop('Mokoena Supermarket', 'pending'),
        new RouteStop(MockDatabase.shop.name, 'pending', true),
        new RouteStop('Kasi Corner', 'pending'),
      ],
      MockDatabase.driver,
      api.handoverPin ?? '----',
      [
        new Milestone('Order Placed', time(placedAt), `${delivery.title} • ${Money.of(api.total).format()} paid into escrow`, 'done', 'check'),
        new Milestone(
          `Picked up from ${supplier}`,
          'Pending',
          `${cart.unitCount} crates • ${cart.weightKg} kg to verify at depot`,
          'pending',
          'inventory_2',
        ),
        new Milestone('On the Way (Next Stop)', 'Pending', 'Driver heading to your shop', 'pending', 'local_shipping'),
        new Milestone('Delivered & Confirmed', 'Pending', 'Your handover PIN releases payment to the supplier', 'pending', 'payments'),
      ],
      Money.of(api.total),
      supplier,
    );

    if (api.status === 'delivered') return order.markDelivered(time(Date.parse(api.deliveredAt ?? api.createdAt)));
    const steps = Math.min(3, Math.floor((now - placedAt) / MockDatabase.DISPATCH_STEP_MS));
    for (let i = 1; i <= steps; i++) order = order.advance(time(placedAt + i * MockDatabase.DISPATCH_STEP_MS));
    return order;
  }

  /* ---------- Driver ---------- */

  static driverShift(): DriverShift {
    return new DriverShift(MockDatabase.driver, 78, Money.of(312), 3, Money.of(1840), 'Tues.');
  }

  static readonly routeOffer = new RouteOffer(
    4,
    20,
    'Medium Freight (140 kg Bulk)',
    'Sacks, cartons & vegetable crates loaded & palletised',
    'Mpumi Farm Co-op (Zone 4)',
    'Soweto Zone 4 & 5 (4 Spaza Shops)',
    38,
    'Optimal paved surface',
    Money.of(153),
    Money.of(48),
  );

  /** Driver's manifest: drops finished this shift, then open orders in route order. */
  static cargoBatch(delivered: readonly ApiOrder[], open: readonly ApiOrder[]): CargoBatch {
    const drop = (o: ApiOrder, status: DeliveryDrop['status']) =>
      new DeliveryDrop(
        o.id,
        `${o.ownerName.split(' ')[0]}'s Spaza`,
        o.ownerName.split(' ')[0],
        o.lines.map((l) => `${l.quantity}× ${l.name}`).join(' • '),
        status,
        // Driver earns 60% of the delivery fee, R35 minimum for Vuka Point drops.
        Money.of(Math.max(35, Math.round(o.deliveryFee * 0.6))),
      );
    return new CargoBatch('VK-882', 'Mpumi Central Farm Depot', [
      ...delivered.map((o) => drop(o, 'done')),
      ...open.map((o, i) => drop(o, i === 0 ? 'arrived' : i === 1 ? 'locked' : 'queued')),
    ]);
  }

  /* ---------- Books ---------- */

  static readonly ledger = new LedgerSummary(
    'October 2026',
    'Today, 08:30',
    Money.of(4450),
    34.5,
    Money.of(2110),
    Money.of(8450),
    4,
    14,
    Money.of(12900),
    [
      new WeeklyFlow('W1', 2800, 2100),
      new WeeklyFlow('W2', 3400, 2300),
      new WeeklyFlow('W3', 3100, 1900),
      new WeeklyFlow('W4', 3600, 2150),
    ],
    'Saturday 19 Oct',
    Money.of(3420),
  );

  static readonly creditScore = new CreditScore(640, 850, 'Tier 2 Spaza', 'Good Standing', 23, Money.of(15000));

  static readonly funding = new FundingReadiness(
    [
      new FundingStep('Trading History: 6+ months', '23 trades verified via bulk orders', 'verified'),
      new FundingStep('Digital Payments: Cashless Till', 'Impelo Pay reader linked & collecting', 'active'),
      new FundingStep('Verified Physical Address', 'GPS pinned & driver drop confirmed', 'verified'),
      new FundingStep('CIPC Registration', 'Formal Pty Ltd spaza entity setup', 'todo', 'R175'),
      new FundingStep('SARS Tax Clearance PIN', 'Business income tax profile', 'todo', 'FREE'),
    ],
    'R50k',
  );

  /* ---------- Vuka Safe ---------- */

  static readonly recall = new ProductRecall(
    '#A4471',
    'Maize Meal 5kg – remove from shelf',
    "Manufacturer voluntary recall due to a packaging seal defect. Hand it to your Vuka driver during tomorrow morning's drop for an instant 100% escrow refund.",
  );

  static readonly compliance = new ComplianceReport(23, 23, 'Lab Verified');

  static readonly expiringItems: readonly ExpiringItem[] = [
    new ExpiringItem('Bread 700g', 'Golden Hearth Mills', '8 loaves left', 3, 'bakery_dining'),
    new ExpiringItem('Amasi 2L', 'Midlands Dairies', '3 bottles left', 3, 'local_drink'),
  ];

  static readonly safetyTips: readonly SafetyTip[] = [
    new SafetyTip(
      'Check the expiry date',
      'Look for rubbed-out, reprinted or smudged dates. Real producers print uniform stamps that don’t rub off.',
      'calendar_today',
    ),
    new SafetyTip(
      'Damaged or swollen packaging',
      'Never accept puffed tins, bloated dairy pouches or ripped seals. Swelling signals bacteria and broken seals.',
      'package_2',
    ),
    new SafetyTip(
      'Spelling and logo errors',
      'Inspect brand names, mismatched fonts or fuzzy printing. Copycats often change a single letter.',
      'spellcheck',
    ),
    new SafetyTip(
      'Strange colour or smell',
      'Reject greyish maize, discoloured oil, damp flour lumps or sharp chemical smells.',
      'science',
    ),
    new SafetyTip(
      'Price too good to be true',
      'Unmarked vans offering 50% below wholesale are almost always selling expired or counterfeit stock.',
      'price_check',
    ),
  ];

  static readonly hotlines: readonly Hotline[] = [
    new Hotline('National Consumer Commission', '012 065 1940', 'phone_in_talk'),
    new Hotline('CoJ Health Inspectorate', '0800 002 587', 'emergency'),
  ];

  static readonly supportHotline = '0800 8852 249';
}
