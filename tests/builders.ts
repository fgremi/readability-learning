import type { Order, OrderItem } from "../src/order";

/** Builds an order step by step; any detail the test doesn't care about gets a default. */
export function anOrder() {
  const items: OrderItem[] = [];
  const builder = {
    withItem({ unitPriceEur = 10, quantity = 1 }: Partial<OrderItem> = {}) {
      items.push({ unitPriceEur, quantity });
      return builder;
    },
    build(): Order {
      return { items };
    },
  };
  return builder;
}

/** Shortcut for tests that only care about the subtotal, not the individual items. */
export function anOrderWorth(subtotalEur: number): Order {
  return anOrder().withItem({ unitPriceEur: subtotalEur }).build();
}
