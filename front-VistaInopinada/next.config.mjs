/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // <-- ¡Añade esta línea obligatoria para Render!
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig