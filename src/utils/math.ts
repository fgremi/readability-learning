export function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

export function roundToCents(amount: number): number {
  return Math.round(amount * 100) / 100;
}
