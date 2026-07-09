import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
