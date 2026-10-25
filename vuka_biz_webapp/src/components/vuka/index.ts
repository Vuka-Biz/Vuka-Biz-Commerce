import { AttentionCard, KpiRow, OrderDetail, OrdersTable, StatusBadge } from './admin';
import { CreditScoreCard, FundingChecklist, ProfileCard, StatTile, TradePulseCard, WeeklyFlowChart } from './books';
import { BrandMark } from './brand';
import {
  DeliveryOptionCard,
  EscrowBanner,
  LoadCard,
  OrderSummaryCard,
  PaymentMethodGrid,
  PriceBreakdown,
} from './checkout';
import { CargoBatchCard, RouteOfferCard, ShiftCard } from './driver';
import { DriverCard, HandoverPinCard, MilestoneTimeline, OrderHero, ReportProblemCard } from './orders';
import { ComplianceCard, ExpiryAlertCard, HotlineList, RecallBanner, SafetyTipList } from './safety';
import { CartBar, ProductCard, WelcomeBanner } from './shop';

/**
 * Vuka Biz feature components. Each one takes model objects as props:
 *   <Vuka.ProductCard product={product} quantity={2} onChangeQuantity={…} />
 */
export const Vuka = {
  // Brand
  BrandMark,
  // Shop
  WelcomeBanner,
  ProductCard,
  CartBar,
  // Checkout
  EscrowBanner,
  OrderSummaryCard,
  LoadCard,
  DeliveryOptionCard,
  PaymentMethodGrid,
  PriceBreakdown,
  // Orders
  OrderHero,
  DriverCard,
  HandoverPinCard,
  MilestoneTimeline,
  ReportProblemCard,
  // Books
  TradePulseCard,
  StatTile,
  WeeklyFlowChart,
  CreditScoreCard,
  FundingChecklist,
  ProfileCard,
  // Vuka Safe
  RecallBanner,
  ComplianceCard,
  ExpiryAlertCard,
  SafetyTipList,
  HotlineList,
  // Driver
  ShiftCard,
  RouteOfferCard,
  CargoBatchCard,
  // Support console
  KpiRow,
  AttentionCard,
  OrdersTable,
  OrderDetail,
  StatusBadge,
} as const;
