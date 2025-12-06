/**
 * Custom Error class for Operational Errors (e.g., 404, 400).
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
