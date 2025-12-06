/**
 * Custom Error class for Operational Errors.
 * Use this to throw known errors that should be handled gracefully (e.g., 404, 400).
 * These errors will be formatted nicely by the global error handler.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(statusCode: number, message: string, details?: unknown) {
    super(message);

    this.statusCode = statusCode;
    this.details = details;

    Object.setPrototypeOf(this, new.target.prototype);
  }
}
