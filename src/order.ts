// Prices an order in four steps: subtotal -> coupon -> shipping -> rounding.
// All amounts are EUR with VAT already included, so there is no tax step.

import { roundToCents, sum } from "./utils/math";

export type Country = "ES" | "PT" | "FR";

export interface OrderItem {
  unitPriceEur: number;
  quantity: number;
}

export interface Order {
  items: OrderItem[];
}

export interface PricingOptions {
  /** Unknown codes are ignored, so the customer simply pays full price. */
  couponCode?: string;
  /** Premium members never pay shipping. */
  isPremiumMember?: boolean;
  /** Destination country. Defaults to "ES". */
  country?: Country;
}

type Coupon =
  | { kind: "percentOff"; percent: number }
  | { kind: "amountOff"; amountEur: number; minSubtotalEur: number };

// Codes are case-insensitive: "vip10" and "VIP10" are the same coupon.
const COUPONS: Record<string, Coupon> = {
  VIP10: { kind: "percentOff", percent: 10 },
  SUMMER5: { kind: "amountOff", amountEur: 5, minSubtotalEur: 30 },
  WELCOME15: { kind: "percentOff", percent: 15 },
};

// Inclusive: an order of exactly 50 EUR already ships for free.
// Compared against the subtotal AFTER the coupon, so a coupon can make you lose free shipping.
const FREE_SHIPPING_MIN_SUBTOTAL_EUR = 50;

const SHIPPING_COST_BY_COUNTRY_EUR: Record<Country, number> = {
  ES: 4.99,
  PT: 6.99,
  FR: 9.99,
};

/**
 * Calculates what the customer pays for an order, in EUR, rounded to cents.
 *
 * Steps: subtotal -> coupon -> shipping -> rounding. See the README for the full rules.
 *
 * @example
 * calculateOrderTotal({ items: [{ unitPriceEur: 12, quantity: 2 }] }); // 28.99 (24 + 4.99 shipping)
 * calculateOrderTotal(order, { couponCode: "SUMMER5", country: "PT" });
 *
 * @throws {Error} "Order has no items" when `order.items` is empty.
 * @throws {Error} "Invalid quantity: <n>" when an item has `quantity < 1`.
 */
export function calculateOrderTotal(order: Order, options: PricingOptions = {}) {
  assertValidOrder(order);

  const subtotalEur = calculateSubtotal(order.items);
  const discountedSubtotalEur = applyCoupon(subtotalEur, options.couponCode);
  const shippingEur = calculateShipping(discountedSubtotalEur, options);

  // Round once, at the very end. Floats can't hold most cents exactly (59.97 * 0.9 = 53.973),
  // and rounding every step would drift a cent away from what the payment provider charges.
  // TODO: switch to integer cents if we ever need per-line rounding (e.g. invoices per item).
  return roundToCents(discountedSubtotalEur + shippingEur);
}

function assertValidOrder(order: Order) {
  if (order.items.length === 0) {
    throw new Error("Order has no items");
  }
  const invalidItem = order.items.find((item) => item.quantity < 1);
  if (invalidItem) {
    throw new Error(`Invalid quantity: ${invalidItem.quantity}`);
  }
}

function calculateSubtotal(items: OrderItem[]) {
  return sum(items.map((item) => item.unitPriceEur * item.quantity));
}

function applyCoupon(subtotalEur: number, couponCode?: string) {
  const coupon = couponCode ? COUPONS[couponCode.toUpperCase()] : undefined;
  if (coupon?.kind === "percentOff") {
    return subtotalEur - (subtotalEur * coupon.percent) / 100;
  }
  if (coupon?.kind === "amountOff" && subtotalEur >= coupon.minSubtotalEur) {
    return subtotalEur - coupon.amountEur;
  }
  return subtotalEur;
}

function calculateShipping(
  discountedSubtotalEur: number,
  { isPremiumMember, country = "ES" }: PricingOptions,
) {
  const qualifiesForFreeShipping =
    isPremiumMember || discountedSubtotalEur >= FREE_SHIPPING_MIN_SUBTOTAL_EUR;
  return qualifiesForFreeShipping ? 0 : SHIPPING_COST_BY_COUNTRY_EUR[country];
}
