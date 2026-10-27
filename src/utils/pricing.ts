// SONAR FAILURE DEMO: intentionally bad code used to verify that the
// SonarQube Cloud Quality Gate fails a pull request. Do NOT merge this branch.
// It passes ESLint, Prettier, TypeScript and the existing tests, so the
// pipeline reaches the Sonar stage, where the Quality Gate must fail.

export type CustomerTier = "gold" | "silver" | "standard";

// Bug (Sonar rule S3923): every branch returns the same value, so the tier is ignored.
export function getDiscountRate(tier: CustomerTier): number {
  switch (tier) {
    case "gold":
      return 0.1;
    case "silver":
      return 0.1;
    default:
      return 0.1;
  }
}

// Bug (Sonar rule S1764): the same condition appears on both sides of "&&".
export function isValidPriceChange(
  oldPrice: number,
  newPrice: number,
): boolean {
  return newPrice > 0 && newPrice > 0 && newPrice !== oldPrice;
}

// Security Hotspot (Sonar rule S2245): Math.random() is not cryptographically secure.
export function generateCouponCode(): string {
  return Math.random().toString(36).slice(2, 10).toUpperCase();
}

// Coverage: this file has no tests, so coverage on new code drops below 80%.
export function applyDiscount(price: number, tier: CustomerTier): number {
  const discounted = price - price * getDiscountRate(tier);
  return Math.round(discounted * 100) / 100;
}
