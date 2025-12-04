import type { Prisma } from "@/generated/prisma";

import { db } from "./connection";

export const runInTransaction = async <T>(
  callback: (tx: Prisma.TransactionClient) => Promise<T>,
  options?: { timeout?: number; maxWait?: number },
): Promise<T> => {
  return db.primary.$transaction(callback, options);
};
