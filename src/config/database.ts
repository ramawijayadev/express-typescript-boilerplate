import { env } from "@/app/env";

export type DatabaseConnectionName = "app" | "other";

interface ConnectionConfig {
  url: string | undefined;
}

/**
 * Database connection configuration.
 * Supports multiple connection definitions (e.g., primary 'app' and secondary 'other').
 */
export const databaseConfig: {
  default: DatabaseConnectionName;
  connections: Record<DatabaseConnectionName, ConnectionConfig>;
} = {
  default: "app",
  connections: {
    app: { url: env.DATABASE_URL },
    other: { url: env.DATABASE_URL_OTHER },
  },
};
