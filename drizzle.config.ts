import { defineConfig } from "drizzle-kit";

import { env } from "./src/config/env";

const config = defineConfig({
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  dialect: "postgresql",
  out: "./migrations",
  schema: "./src/lib/db/schemas.ts",
  strict: true,
  verbose: true,
});

export default config;
