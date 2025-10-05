import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ... other config options
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'api.qrserver.com', // Adicione esta linha
      }
    ]
  }
};

export default nextConfig;