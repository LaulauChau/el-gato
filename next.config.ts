import "./src/config/env";

import type { NextConfig } from "next";

const config: NextConfig = {
  cacheComponents: true,
  reactCompiler: true,
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default config;
