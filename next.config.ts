import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // The demos are a reference integration: nothing here should ever leak a Geena token to the
  // browser, and nothing external is embedded — all assets are local.
  poweredByHeader: false,
  // Self-contained server bundle for the Docker image (see Dockerfile).
  output: 'standalone',
};

export default nextConfig;
