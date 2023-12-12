import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  driver: "pg",
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
  schema: "./src/db/schemas",
  out: "./drizzle/migrations",
  strict: true,
  verbose: true,
});
