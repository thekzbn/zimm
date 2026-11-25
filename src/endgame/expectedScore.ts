/**
 * Calculates standard Elo expected scores:
 * E_A = 1 / (1 + 10 ^ ((R_B - R_A) / 400))
 * E_B = 1 - E_A
 */
export function calculateExpectedScore(ratingA: number, ratingB: number): {
  expectedA: number;
  expectedB: number;
} {
  const diff = (ratingB - ratingA) / 400;
  const expectedA = 1 / (1 + Math.pow(10, diff));
  const expectedB = 1 - expectedA;

  return { expectedA, expectedB };
}
