import { test, expect } from "vitest";
import { calculateOrderTotal } from "../src/order";

test("test1", () => {
  expect(calculateOrderTotal({ items: [{ unitPriceEur: 15, quantity: 2 }] })).toBe(34.99);
});

test("test2", () => {
  let r = calculateOrderTotal(
    { items: [{ unitPriceEur: 30, quantity: 2 }] },
    { couponCode: "VIP10" },
  );
  expect(r).toBe(54);
});

test("test3", () => {
  expect(
    calculateOrderTotal({ items: [{ unitPriceEur: 40, quantity: 1 }] }, { couponCode: "SUMMER5" }),
  ).toBe(39.99);
});

test("test4", () => {
  expect(
    calculateOrderTotal({ items: [{ unitPriceEur: 10, quantity: 1 }] }, { isPremiumMember: true }),
  ).toBe(10);
});

test("SUMMER5 applies when the subtotal is exactly the 30 EUR minimum", () => {
  expect(
    calculateOrderTotal({ items: [{ unitPriceEur: 30, quantity: 1 }] }, { couponCode: "SUMMER5" }),
  ).toBeCloseTo(29.99);
});

test("WELCOME15 takes 15% off the subtotal", () => {
  expect(
    calculateOrderTotal(
      { items: [{ unitPriceEur: 100, quantity: 1 }] },
      { couponCode: "WELCOME15" },
    ),
  ).toBe(85);
});

test("rejects an order without items", () => {
  expect(() => calculateOrderTotal({ items: [] })).toThrow("Order has no items");
});

test("rejects items with a quantity below 1", () => {
  expect(() => calculateOrderTotal({ items: [{ unitPriceEur: 10, quantity: 0 }] })).toThrow(
    "Invalid quantity: 0",
  );
});

test("shipping cost depends on the destination country", () => {
  expect(
    calculateOrderTotal({ items: [{ unitPriceEur: 30, quantity: 1 }] }, { country: "PT" }),
  ).toBe(36.99);
  expect(
    calculateOrderTotal({ items: [{ unitPriceEur: 30, quantity: 1 }] }, { country: "FR" }),
  ).toBe(39.99);
});
