import "dotenv/config";

export type DatabaseConnectionName = "app" | "reporting" | "audit";

interface ConnectionConfig {
  url: string | undefined;
}

export const databaseConfig: {
  default: DatabaseConnectionName;
  connections: Record<DatabaseConnectionName, ConnectionConfig>;
} = {
  default: "app",
  connections: {
    app: { url: process.env.DATABASE_URL_APP ?? process.env.DATABASE_URL },
    reporting: { url: process.env.DATABASE_URL_REPORTING },
    audit: { url: process.env.DATABASE_URL_AUDIT },
  },
};
