/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['unpkg.com', 'cdnjs.cloudflare.com'],
  },
}

module.exports = nextConfig