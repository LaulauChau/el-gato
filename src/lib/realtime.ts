import { Realtime, type InferSchema } from "@upstash/realtime";
import { Redis } from "@upstash/redis";
import { z } from "zod";

import { env } from "@/config/env";

const redis = new Redis({
  url: env.UPSTASH_REDIS_REST_URL,
  token: env.UPSTASH_REDIS_REST_TOKEN,
});

const realtimeEventSchema = {
  ai: {
    chunk: z.object({ content: z.string() }),
    done: z.object({ messageId: z.string() }),
    error: z.object({ error: z.string() }),
  },
};

export const realtime = new Realtime({ schema: realtimeEventSchema, redis });

export type RealtimeEvents = InferSchema<typeof realtimeEventSchema>;
