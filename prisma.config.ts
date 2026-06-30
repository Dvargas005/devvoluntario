import dotenv from "dotenv";
import { defineConfig } from "prisma/config";

// Load .env.local instead of .env (Vercel env pull writes to .env.local)
dotenv.config({ path: ".env.local" });

export default defineConfig({
  earlyAccess: true,
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // CLI operations (db push, migrate) use the direct/unpooled connection
    url: process.env["DATABASE_URL_UNPOOLED"]!,
  },
});
