import { randomBytes } from "node:crypto";

/**
 * Generates a unique order identifier, e.g. `ROJIN-8F31C2`.
 * Uses crypto-grade randomness so IDs are not guessable or repeatable.
 */
export function generateOrderId(): string {
  return `ROJIN-${randomBytes(3).toString("hex").toUpperCase()}`;
}
