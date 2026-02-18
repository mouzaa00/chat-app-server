import "dotenv/config";
import { defineConfig } from "drizzle-kit";

const isProduction = process.env.NODE_ENV!;

export default defineConfig({
  out: "./src/db/migrations",
  schema: "./src/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: isProduction
    ? {
        url: process.env.DATABASE_URL!,
      }
    : {
        user: process.env.DB_USER!,
        host: process.env.DB_HOST!,
        database: process.env.DB_NAME!,
        password: process.env.DB_PASSWORD!,
        port: parseInt(process.env.DB_PORT!),
        ssl: false,
      },
});
