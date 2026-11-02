// order.ts
// Utils for orders

const LIMIT = 30;
const LIMIT2 = 50; // free shipping over 40€

// calc function
export function calc(o: any, c?: string, f?: boolean) {
  let t = 0; // total
  let tmp;
  // loop items
  for (let i = 0; i < o.items.length; i++) {
    tmp = o.items[i].p * o.items[i].q;
    t = t + tmp;
  }

  // discount
  if (c) {
    if (c == "VIP10") {
      t = t - t * 0.1;
    } else {
      if (c == 'SUMMER5') {
        if (t >= LIMIT) {
          t = t - 5
        }
      }
    }
  }
  // shipping
  if (!f) {
      if (t < LIMIT2) { t = t + 4.99; }
  }
    return t; // return the total
}
