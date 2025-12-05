import { createHash } from "node:crypto";

/**
 * Creates a SHA256 hash of the given token.
 * This is used to store refresh tokens securely in the database.
 * We use a fast hash (SHA256) instead of a slow one (Argon2/Bcrypt) because
 * these tokens are high-entropy random strings, not passwords.
 */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
