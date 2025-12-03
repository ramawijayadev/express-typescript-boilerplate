import type { FieldError, StatusCode } from "@/shared/http/api-response";

export class AppError extends Error {
  public readonly statusCode: StatusCode;
  public readonly details?: FieldError[] | unknown;

  constructor(statusCode: StatusCode, message: string, details?: FieldError[] | unknown) {
    super(message);

    this.statusCode = statusCode;
    this.details = details;

    Object.setPrototypeOf(this, new.target.prototype);
  }
}
