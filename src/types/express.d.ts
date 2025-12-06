/**
 * Global Type Augmentation for Express.
 * Adds custom properties to the Request object.
 */
declare global {
  namespace Express {
    interface Request {
      requestId: string;
      startTime: number;
    }
  }
}

export {};
