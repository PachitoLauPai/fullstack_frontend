/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Indica que se exportará como HTML/CSS/JS puros
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  images: { unoptimized: true },
}
export default nextConfig;