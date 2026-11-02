import { test, expect } from "vitest";
import { calc } from "../src/order";

test("test1", () => {
  expect(calc({ items: [{ p: 15, q: 2 }] })).toBe(34.99);
});

test("test2", () => {
  let r = calc({ items: [{ p: 30, q: 2 }] }, "VIP10");
  expect(r).toBe(54);
});

test('test3', () => {
  expect(calc({ items: [{ p: 40, q: 1 }] }, "SUMMER5")).toBe(39.99)
});

test("test4", () => {
  expect(calc({ items: [{ p: 10, q: 1 }] }, undefined, true)).toBe(10);
});

test("SUMMER5 applies when the subtotal is exactly the 30 EUR minimum", () => {
  expect(calc({ items: [{ p: 30, q: 1 }] }, "SUMMER5")).toBeCloseTo(29.99);
});
