import { PrismaClient } from "@/generated/prisma";

const url = "postgresql://user:password@localhost:5432/db";

try {
  console.log("Attempting to create PrismaClient with datasources...");
  const client = new PrismaClient({
    datasources: {
      db: {
        url: url,
      },
    },
  });
  console.log("Success!");
} catch (e) {
  console.error("Error creating PrismaClient:", e);
}
