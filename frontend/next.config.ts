/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: 'http://localhost:3000', // Or your NestJS container hostname if Dockerized
  },
};

module.exports = nextConfig;
