import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use standalone output only on self-hosted platforms (Railway, Render, VPS)
  // Vercel and Netlify handle bundling themselves
  output: (process.env.VERCEL || process.env.NETLIFY) ? undefined : "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'ik.imagekit.io' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
  },
};

export default nextConfig;
