// server/prisma.config.ts

import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  datasource: {
    url: env("DATABASE_URL"),
  },
  // We must define the seed command here for Prisma 7
  migrations: {
    seed: "ts-node prisma/seed.ts",
  },
});