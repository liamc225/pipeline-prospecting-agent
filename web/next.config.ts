import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@trigger.dev/sdk"],
  outputFileTracingRoot: path.join(process.cwd(), ".."),
};

export default nextConfig;
