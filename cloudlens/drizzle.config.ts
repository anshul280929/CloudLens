import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

export default defineConfig({
  // Path to the database schema definition
  schema: "./src/db/schema.ts",

  // Output directory for generated migrations
  out: "./src/db/migrations",

  // Database dialect
  dialect: "postgresql",
  
  // Database connection configuration
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },

  // Verbose logging during migrations
  verbose: true,

  // Strict mode for safer migrations
  strict: true,
});
