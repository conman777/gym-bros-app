import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    // Ignore LICENSE and other non-JS files in node_modules
    config.module.rules.push({
      test: /\/(LICENSE|README|CHANGELOG)(\.\w+)?$/,
      type: "asset/source",
    });

    // Externalize libsql packages on the server to avoid bundling issues
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        "@libsql/client": "commonjs @libsql/client",
        "@prisma/adapter-libsql": "commonjs @prisma/adapter-libsql",
      });
    }

    return config;
  },
};

export default nextConfig;
