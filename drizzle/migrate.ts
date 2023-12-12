import "dotenv/config";
import { db } from "../src/db/drizzle";
import { migrate } from "drizzle-orm/node-postgres/migrator";

console.log("🚀 Running migrations...");

migrate(db, {
  migrationsFolder: "./drizzle/migrations",
})
  .then(() => {
    console.log("✅ Migrations complete!");
    process.exit(0);
  })
  .catch((e) => {
    console.log("🚨 Migrations failed!");
    console.error(e);
    process.exit(1);
  });
