import { dbConfig } from "@/config/database";
import { PrismaClient } from "@/generated/prisma";

class DatabaseConnection {
  private static instance: DatabaseConnection;
  public readonly primary: PrismaClient;

  private constructor() {
    this.primary = new PrismaClient({
      datasourceUrl: dbConfig.primary.url,
    });
  }

  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  public async connect(): Promise<void> {
    try {
      await this.primary.$connect();
      console.log("✅ [Database] Primary connection established");
    } catch (error) {
      console.error("❌ [Database] Failed to connect to primary:", error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    await this.primary.$disconnect();
    console.log("⚠️ [Database] Primary connection closed");
  }
}

export const db = DatabaseConnection.getInstance();
