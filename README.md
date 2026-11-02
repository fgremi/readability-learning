# order-pricing

Calculates what a customer pays for a shop order: items, coupon and shipping.
All amounts are in EUR with VAT included.

## Quick start

```ts
import { calculateOrderTotal } from "order-pricing";

const smallOrder = { items: [{ unitPriceEur: 12, quantity: 2 }] };
const bigOrder = { items: [{ unitPriceEur: 19.99, quantity: 3 }] };

console.log(calculateOrderTotal(smallOrder)); // => 28.99
console.log(calculateOrderTotal(smallOrder, { country: "FR" })); // => 33.99
console.log(calculateOrderTotal(bigOrder, { couponCode: "VIP10" })); // => 53.97
```

> This example is executed by `tests/readme.test.ts`. If you change it, run `npm test`.

## Pricing rules

| Step        | Rule                                                                                            |
| ----------- | ----------------------------------------------------------------------------------------------- |
| 1. Subtotal | Sum of `unitPriceEur × quantity`                                                                |
| 2. Coupon   | `VIP10` −10% · `WELCOME15` −15% · `SUMMER5` −5 € from 30 € (inclusive)                          |
| 3. Shipping | Free from 50 € (after the coupon) or for premium members. Otherwise ES 4.99 · PT 6.99 · FR 9.99 |
| 4. Rounding | Once, at the end, to cents ([ADR 0001](docs/adr/0001-round-once-at-the-end.md))                 |

## Errors

| Message                 | When                         |
| ----------------------- | ---------------------------- |
| `Order has no items`    | `items` is empty             |
| `Invalid quantity: <n>` | Some item has `quantity < 1` |

## Development

```bash
npm install
npm run test:watch   # TDD loop: red -> green -> refactor
npm run format       # Prettier, so nobody argues about style in reviews
```

## Questions

Open an issue in this repository.
