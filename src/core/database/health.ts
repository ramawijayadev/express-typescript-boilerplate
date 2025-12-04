import { db } from "./connection";

export const checkDatabaseHealth = async (): Promise<boolean> => {
  try {
    await db.primary.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error("❌ [Database Health] Check failed:", error);
    return false;
  }
};
