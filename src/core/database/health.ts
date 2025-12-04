import { type DatabaseConnectionName, databaseConfig } from "@/config/database";

import { db } from "./connection";

async function checkConnection(name: DatabaseConnectionName): Promise<boolean> {
  try {
    if (!databaseConfig.connections[name]?.url) return true;

    await db(name).$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

export async function checkAllDbs() {
  const connectionNames = Object.keys(databaseConfig.connections) as DatabaseConnectionName[];

  const results: Record<string, boolean> = {};
  let allHealthy = true;

  await Promise.all(
    connectionNames.map(async (name) => {
      const isHealthy = await checkConnection(name);
      results[name] = isHealthy;
      if (!isHealthy) allHealthy = false;
    }),
  );

  return {
    ...results,
    healthy: allHealthy,
  };
}
