// server/prisma.config.ts
import "dotenv/config";
import { defineConfig, env } from "@prisma/config";

export default defineConfig({
  // 1. Routes the database connection explicitly for the Prisma 7 CLI
  datasource: {
    url: env("DATABASE_URL"),
  },
  
  // 2. Preserves your critical database seeding functionality
  migrations: {
    seed: "ts-node prisma/seed.ts",
  },
});