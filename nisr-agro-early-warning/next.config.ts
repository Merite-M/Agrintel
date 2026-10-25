import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The root URL sends visitors to the default English welcome page.
  async redirects() {
    return [
      {
        source: "/",
        destination: "/en",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
