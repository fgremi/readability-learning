import type { Order, OrderItem } from "../src/order";

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
