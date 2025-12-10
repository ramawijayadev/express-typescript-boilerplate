export {};

declare global {
  interface BigInt {
    /**
     * Serializes the BigInt to a string for JSON compatibility.
     * Patched in `src/core/database/connection.ts`.
     */
    toJSON(): string;
  }
}
