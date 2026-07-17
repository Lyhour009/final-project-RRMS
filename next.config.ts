import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";
const supabaseOrigin = "https://mubtpggtbsewhyawjmhu.supabase.co";
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""};
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data: ${supabaseOrigin};
  font-src 'self' data:;
  connect-src 'self' ${supabaseOrigin} wss://mubtpggtbsewhyawjmhu.supabase.co;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`
  .replace(/\s{2,}/g, " ")
  .trim();

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: cspHeader },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "mubtpggtbsewhyawjmhu.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
    // Default is 0s (no client-side cache for dynamic pages), so switching
    // between admin pages always re-fetches from Supabase even seconds
    // apart. 60s lets back-and-forth navigation between pages feel instant
    // by reusing what was already fetched. Mutations (create/edit/delete)
    // still show up immediately regardless — every action calls
    // revalidatePath(), which explicitly busts this cache for that path.
    staleTimes: {
      dynamic: 60,
    },
  },
};

export default nextConfig;
