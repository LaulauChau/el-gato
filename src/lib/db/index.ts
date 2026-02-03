import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import { env } from "@/config/env";

import * as schema from "./schemas";

// oxlint-disable-next-line no-unsafe-type-assertion
const globalForDb = globalThis as unknown as {
  client: NeonQueryFunction<false, false> | undefined;
};

const client = globalForDb.client ?? neon(env.DATABASE_URL);

if (env.NODE_ENV !== "production") {
  globalForDb.client = client;
}

export const db = drizzle({ client, schema });
