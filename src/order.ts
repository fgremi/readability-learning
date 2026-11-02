// order.ts
// Utils for orders

const SUMMER5_MIN_SUBTOTAL_EUR = 30;
const FREE_SHIPPING_MIN_SUBTOTAL_EUR = 50; // free shipping over 40€
const SHIPPING_COST_EUR = 4.99

export interface OrderItem {
  unitPriceEur: number;
  quantity: number;
}
export interface Order { items: OrderItem[] }
export interface PricingOptions {
  couponCode?: string;
  isPremiumMember?: boolean;
}

export function calculateOrderTotal(order: Order, options: PricingOptions = {}) {
  let totalEur = 0;
  let lineTotalEur;
  // loop items
  for (let i = 0; i < order.items.length; i++) {
    lineTotalEur = order.items[i].unitPriceEur * order.items[i].quantity;
    totalEur = totalEur + lineTotalEur;
  }

  // discount
  if (options.couponCode) {
    if (options.couponCode == "VIP10") {
      totalEur = totalEur - totalEur * 0.1;
    } else {
      if (options.couponCode == 'SUMMER5') {
        if (totalEur >= SUMMER5_MIN_SUBTOTAL_EUR) {
          totalEur = totalEur - 5
        }
      }
    }
  }
  // shipping
  if (!options.isPremiumMember) {
      if (totalEur < FREE_SHIPPING_MIN_SUBTOTAL_EUR) { totalEur = totalEur + SHIPPING_COST_EUR; }
  }
    return totalEur; // return the total
}
