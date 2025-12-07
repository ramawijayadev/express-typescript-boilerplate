import { env } from "@/config/env";

export type DatabaseConnectionName = "app" | "other";

interface ConnectionConfig {
  url: string | undefined;
}

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
