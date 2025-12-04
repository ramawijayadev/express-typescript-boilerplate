import type { DatabaseConnectionName } from "@/config/database";
import type { Prisma } from "@/generated/prisma";

import { db } from "./connection";

export async function transaction<T>(fn: (trx: Prisma.TransactionClient) => Promise<T>): Promise<T>;

export async function transaction<T>(
  connectionName: DatabaseConnectionName,
  fn: (trx: Prisma.TransactionClient) => Promise<T>,
): Promise<T>;

export async function transaction<T>(
  arg1: DatabaseConnectionName | ((trx: Prisma.TransactionClient) => Promise<T>),
  arg2?: (trx: Prisma.TransactionClient) => Promise<T>,
): Promise<T> {
  const hasCustomConnection = typeof arg1 === "string";
  const connectionName = hasCustomConnection ? (arg1 as DatabaseConnectionName) : undefined;
  const fn = hasCustomConnection
    ? (arg2 as (trx: Prisma.TransactionClient) => Promise<T>)
    : (arg1 as (trx: Prisma.TransactionClient) => Promise<T>);

  const prisma = db(connectionName);

  return prisma.$transaction((trx) => fn(trx));
}
