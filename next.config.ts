import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@mui/material", "@mui/system", "@mui/icons-material"],
  // Keep heavy native-ish deps out of split server chunks (reduces bad webpack-runtime chunk refs in API routes).
  serverExternalPackages: ["bcryptjs", "@prisma/client"],
};

export default nextConfig;
