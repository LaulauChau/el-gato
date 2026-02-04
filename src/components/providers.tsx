"use client";

import { RealtimeProvider } from "@upstash/realtime/client";
import type { PropsWithChildren } from "react";

export function Providers({ children }: PropsWithChildren) {
  return (
    <RealtimeProvider api={{ url: "/api/realtime", withCredentials: false }}>
      {children}
    </RealtimeProvider>
  );
}
