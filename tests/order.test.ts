import { describe, expect, it } from "vitest";
import { calculateOrderTotal } from "../src/order";
import { anOrder, anOrderWorth } from "./builders";

describe("calculateOrderTotal", () => {
  describe("subtotal", () => {
    it("adds unit price × quantity of every item", () => {
      const order = anOrder()
        .withItem({ unitPriceEur: 15, quantity: 2 })
        .withItem({ unitPriceEur: 5, quantity: 1 })
        .build();

      expect(calculateOrderTotal(order)).toBe(39.99); // 30 + 5 + 4.99 shipping
    });
  });

  describe("coupons", () => {
    it("VIP10 takes 10% off", () => {
      expect(calculateOrderTotal(anOrderWorth(60), { couponCode: "VIP10" })).toBe(54);
    });

    it("WELCOME15 takes 15% off", () => {
      expect(calculateOrderTotal(anOrderWorth(100), { couponCode: "WELCOME15" })).toBe(85);
    });

    it("SUMMER5 takes 5 EUR off from a subtotal of exactly 30 EUR", () => {
      expect(calculateOrderTotal(anOrderWorth(30), { couponCode: "SUMMER5" })).toBe(29.99); // 30 - 5 + 4.99 shipping
    });

    it("SUMMER5 does nothing below 30 EUR", () => {
      expect(calculateOrderTotal(anOrderWorth(29.99), { couponCode: "SUMMER5" })).toBe(34.98); // 29.99 + 4.99 shipping
    });

    it("matches codes case-insensitively", () => {
      expect(calculateOrderTotal(anOrderWorth(100), { couponCode: "vip10" })).toBe(90);
    });

    it("ignores unknown codes", () => {
      expect(calculateOrderTotal(anOrderWorth(100), { couponCode: "NOPE" })).toBe(100);
    });
  });

  describe("shipping", () => {
    it.each([
      { country: "ES", shippingEur: 4.99, totalEur: 34.99 },
      { country: "PT", shippingEur: 6.99, totalEur: 36.99 },
      { country: "FR", shippingEur: 9.99, totalEur: 39.99 },
    ] as const)("costs $shippingEur EUR to $country below 50 EUR", ({ country, totalEur }) => {
      expect(calculateOrderTotal(anOrderWorth(30), { country })).toBe(totalEur);
    });

    it("is free from a subtotal of exactly 50 EUR", () => {
      expect(calculateOrderTotal(anOrderWorth(50))).toBe(50);
    });

    it("is free for premium members whatever the subtotal", () => {
      expect(calculateOrderTotal(anOrderWorth(10), { isPremiumMember: true })).toBe(10);
    });

    it("is decided after the coupon, so a coupon can cost you free shipping", () => {
      expect(calculateOrderTotal(anOrderWorth(50), { couponCode: "VIP10" })).toBe(49.99); // 50 - 10% + 4.99 shipping
    });
  });

  describe("rounding", () => {
    it("returns whole cents even when floats can't represent them", () => {
      const order = anOrder().withItem({ unitPriceEur: 19.99, quantity: 3 }).build();

      expect(calculateOrderTotal(order, { couponCode: "VIP10" })).toBe(53.97);
    });
  });

  describe("validation", () => {
    it("rejects an order without items", () => {
      expect(() => calculateOrderTotal({ items: [] })).toThrow("Order has no items");
    });

    it("rejects items with a quantity below 1", () => {
      const order = anOrder().withItem({ quantity: 0 }).build();

      expect(() => calculateOrderTotal(order)).toThrow("Invalid quantity: 0");
    });
  });
});
