
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    // This is added to address the cross-origin warning in the development environment.
    allowedDevOrigins: [
        "http://localhost:3000",
        "http://localhost:9002",
        "https://*.cloudworkstations.dev",
    ],
  },
};

export default nextConfig;
