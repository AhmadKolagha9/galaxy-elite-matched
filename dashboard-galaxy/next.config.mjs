/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  experimental: { cpus: 1 },
  typescript: { ignoreBuildErrors: true }
}

export default nextConfig
