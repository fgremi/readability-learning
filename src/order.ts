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
  let totalEur = 0;
  let lineTotalEur;
  // loop items
  for (let i = 0; i < order.items.length; i++) {
    lineTotalEur = order.items[i].unitPriceEur * order.items[i].quantity;
    totalEur = totalEur + lineTotalEur;
  }

  // discount
  const coupon = options.couponCode ? COUPONS[options.couponCode] : undefined;
  if (coupon) {
    if (coupon.kind === "percentOff") {
      totalEur = totalEur - (totalEur * coupon.percent) / 100;
    } else {
      if (totalEur >= coupon.minSubtotalEur) {
        totalEur = totalEur - coupon.amountEur;
      }
    }
  }

  // shipping
  if (!options.isPremiumMember) {
    if (totalEur < FREE_SHIPPING_MIN_SUBTOTAL_EUR) {
      totalEur = totalEur + SHIPPING_COST_EUR;
    }
  }

  return totalEur; // return the total
}
