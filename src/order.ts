// order.ts
// Utils for orders

import { sum } from "./utils/math";

export type Country = "ES" | "PT" | "FR";

export interface OrderItem {
  unitPriceEur: number;
  quantity: number;
}

export interface Order {
  items: OrderItem[];
}

export interface PricingOptions {
  couponCode?: string;
  isPremiumMember?: boolean;
  country?: Country;
}

type Coupon =
  | { kind: "percentOff"; percent: number }
  | { kind: "amountOff"; amountEur: number; minSubtotalEur: number };

const COUPONS: Record<string, Coupon> = {
  VIP10: { kind: "percentOff", percent: 10 },
  SUMMER5: { kind: "amountOff", amountEur: 5, minSubtotalEur: 30 },
  WELCOME15: { kind: "percentOff", percent: 15 },
};

const FREE_SHIPPING_MIN_SUBTOTAL_EUR = 50; // free shipping over 40€

const SHIPPING_COST_BY_COUNTRY_EUR: Record<Country, number> = {
  ES: 4.99,
  PT: 6.99,
  FR: 9.99,
};

export function calculateOrderTotal(order: Order, options: PricingOptions = {}) {
  assertValidOrder(order);

  const subtotalEur = calculateSubtotal(order.items);
  const discountedSubtotalEur = applyCoupon(subtotalEur, options.couponCode);
  const shippingEur = calculateShipping(discountedSubtotalEur, options);

  return Math.round((discountedSubtotalEur + shippingEur) * 100) / 100; // return the total
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
  const coupon = couponCode ? COUPONS[couponCode] : undefined;
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
