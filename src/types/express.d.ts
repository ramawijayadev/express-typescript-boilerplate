/** Extends Express Request with observability context. */
declare global {
  namespace Express {
    interface Request {
      requestId: string;
      startTime: number;
    }
  }
}

export {};
