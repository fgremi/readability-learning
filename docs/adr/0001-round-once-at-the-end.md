# ADR 0001: Round to cents once, at the end

- **Status:** accepted
- **Date:** 2026-11-02

## Context

Prices are JavaScript numbers (floats), which can't represent most cents exactly:
`59.97 * 0.9` is `53.973`, and `25 + 4.99` is `29.990000000000002`.
Customers and the payment provider only see whole cents.

## Decision

`calculateOrderTotal` works with floats internally and rounds **once**, right before returning.

## Consequences

- Totals always have at most two decimals, so tests can use exact `toBe` assertions.
- Intermediate values (subtotal, discount) are not rounded. If we ever need to show
  rounded per-line amounts (e.g. per-item invoices), switch to integer cents instead.
