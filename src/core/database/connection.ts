import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

import { type DatabaseConnectionName, databaseConfig } from "@/config/database";
import { PrismaClient } from "@/generated/prisma";

const clients: Partial<Record<DatabaseConnectionName, PrismaClient>> = {};

function createClient(name: DatabaseConnectionName): PrismaClient {
  const config = databaseConfig.connections[name];

  if (!config) {
    throw new Error(`Database connection "${name}" is not defined`);
  }

  if (!config.url) {
    throw new Error(`Missing connection string for "${name}"`);
  }

  const pool = new Pool({ connectionString: config.url });
  const adapter = new PrismaPg(pool);

  return new PrismaClient({ adapter });
}

export function connection(name?: DatabaseConnectionName): PrismaClient {
  const resolvedName = name ?? databaseConfig.default;

  if (!clients[resolvedName]) {
    clients[resolvedName] = createClient(resolvedName);
  }

  return clients[resolvedName] as PrismaClient;
}

export function db(name?: DatabaseConnectionName): PrismaClient {
  return connection(name);
}

export async function disconnectAll(): Promise<void> {
  const activeConnections = Object.keys(clients) as DatabaseConnectionName[];

  const promises = activeConnections.map(async (key) => {
    const client = clients[key];
    if (client) {
      await client.$disconnect();
      delete clients[key];
    }
  });

  await Promise.all(promises);
}
