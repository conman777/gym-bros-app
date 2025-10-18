import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    // Ignore LICENSE and other non-JS files in node_modules
    config.module.rules.push({
      test: /\/(LICENSE|README|CHANGELOG)(\.\w+)?$/,
      type: "asset/source",
    });

    return config;
  },
};

export default nextConfig;
