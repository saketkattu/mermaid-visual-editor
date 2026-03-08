import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',       // generates out/ directory
  trailingSlash: true,    // each route → /route/index.html

  // NOTE: headers() only applies to `next dev` / `next start`.
  // The static out/ export is served by bin/cli.js (serve package) —
  // configure headers there or in your deployment platform separately.
  async headers() {
    return [{
      source: '/(.*)',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        { key: 'X-XSS-Protection', value: '1; mode=block' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      ],
    }];
  },
};

export default nextConfig;
