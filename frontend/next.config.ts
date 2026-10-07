import type { NextConfig } from "next";

const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline';
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' blob: data: https:;
  font-src 'self' https://fonts.gstatic.com data:;
  connect-src 'self' ${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"};
  frame-ancestors 'none';
  form-action 'self';
  base-uri 'self';
`.replace(/\s{2,}/g, " ").trim();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  // Compressão gzip de HTML/JS/CSS no `next start` (brotli, se desejado, deve
  // ser feito no proxy/CDN à frente do Next, com `compress: false`)
  compress: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  experimental: {
    // Importa apenas os módulos usados (lucide-react já é otimizado por padrão)
    optimizePackageImports: ["framer-motion", "gsap"],
  },
  images: {
    // AVIF preferido, WebP como fallback
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 2678400, // 31 dias para as imagens otimizadas
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async headers() {
    return [
      {
        // Fontes e imagens estáticas de /public: cache longo no navegador/CDN
        source: "/:dir(fonts|images)/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=2592000, stale-while-revalidate=86400",
          },
        ],
      },
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: cspHeader,
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

export default nextConfig;

