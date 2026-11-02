// order.ts
// Utils for orders

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
  country?: "ES" | "PT" | "FR";
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
const SHIPPING_COST_EUR = 4.99;

export function calculateOrderTotal(order: Order, options: PricingOptions = {}) {
  if (order.items.length === 0) {
    throw new Error("Order has no items");
  }
  const invalidItem = order.items.find((item) => item.quantity < 1);
  if (invalidItem) {
    throw new Error(`Invalid quantity: ${invalidItem.quantity}`);
  }

  let totalEur = 0;
  let lineTotalEur;
  // loop items
  for (let i = 0; i < order.items.length; i++) {
    lineTotalEur = order.items[i].unitPriceEur * order.items[i].quantity;
    totalEur = totalEur + lineTotalEur;
  }

  // discount
  const coupon = options.couponCode ? COUPONS[options.couponCode] : undefined;
  if (coupon?.kind === "percentOff") {
    totalEur = totalEur - (totalEur * coupon.percent) / 100;
  } else if (coupon?.kind === "amountOff" && totalEur >= coupon.minSubtotalEur) {
    totalEur = totalEur - coupon.amountEur;
  }

  // shipping
  const qualifiesForFreeShipping =
    options.isPremiumMember || totalEur >= FREE_SHIPPING_MIN_SUBTOTAL_EUR;
  const shippingEur = qualifiesForFreeShipping
    ? 0
    : options.country === "PT"
      ? 6.99
      : options.country === "FR"
        ? 9.99
        : SHIPPING_COST_EUR;
  totalEur = totalEur + shippingEur;

  return totalEur; // return the total
}
