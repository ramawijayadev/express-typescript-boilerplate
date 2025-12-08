import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Start seeding...");

  const count = 103;
  const examples = [];

  for (let i = 1; i <= count; i++) {
    examples.push({
      name: `Example ${i}`,
      description: `This is the description for example ${i}`,
    });
  }

  await prisma.example.createMany({
    data: examples,
  });

  console.log(`Seeded ${count} examples.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
