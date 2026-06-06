import type { NextConfig } from "next";

const normalizeTarget = (value: string) => {
  let output = String(value || "").trim();
  if (!output) return "";
  // Fixes potential typos in environment variables
  output = output.replace(/\.railiway\.app/gi, ".railway.app");
  if (!/^https?:\/\//i.test(output)) {
    output = `https://${output}`;
  }
  return output.replace(/\/$/, "");
};

/**
 * Server-side proxy target configuration
 */
const resolvedProxy =
  process.env.BACKEND_PROXY_TARGET?.trim() ||
  (process.env.NODE_ENV === "production"
    ? process.env.NEXT_PUBLIC_BACKEND_URL?.trim() || ""
    : "") ||
  (process.env.NODE_ENV !== "production" ? "http://localhost:8080" : "");

if (process.env.NODE_ENV === "production" && !resolvedProxy) {
  console.warn(
    "[next.config] Set BACKEND_PROXY_TARGET or NEXT_PUBLIC_BACKEND_URL to your Jaggery backend URL. Rewrites may not work until set."
  );
}

const backendProxyTarget = normalizeTarget(resolvedProxy || "http://localhost:8080");

const nextConfig: NextConfig = {
  experimental: {
    // Allow larger multipart uploads through the App Router proxy route (`/api/backend/*`).
    // Default is ~10MB which can be exceeded when uploading multiple images.
    proxyClientMaxBodySize: "50mb",
  },
  images: {
    // Adding Cloudinary here fixes the "Invalid src prop" error
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "fonts.gstatic.com" },
      { 
        protocol: "https", 
        hostname: "res.cloudinary.com", 
        pathname: "/**" 
      },
    ],
  },
  async rewrites() {
    return [
      // Admin routes: /api/backend/admin/* -> backend/api/backend/admin/*
      {
        source: "/api/backend/admin/:path*",
        destination: `${backendProxyTarget}/api/backend/admin/:path*`,
      },
      // User routes: /api/backend/user/* -> backend/user/*
      {
        source: "/api/backend/user/:path*",
        destination: `${backendProxyTarget}/user/:path*`,
      },
      // Auth routes: /api/backend/api/auth/* -> backend/api/auth/*
      {
        source: "/api/backend/api/auth/:path*",
        destination: `${backendProxyTarget}/api/auth/:path*`,
      },
    ];
  },
  async headers() {
    const isProd = process.env.NODE_ENV === "production";
    const csp = [
      "default-src 'self'",
      "base-uri 'self'",
      "frame-ancestors 'none'",
      "object-src 'none'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' https://fonts.gstatic.com data:",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      isProd
        ? "script-src 'self' 'unsafe-inline' https://checkout.razorpay.com https://connect.facebook.net"
        : "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com https://connect.facebook.net",
      "connect-src 'self' https: wss:",
      "frame-src 'self' https://api.razorpay.com https://checkout.razorpay.com",
      "form-action 'self'",
      "upgrade-insecure-requests",
    ].join("; ");

    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" },
          { key: "Content-Security-Policy", value: csp },
        ],
      },
    ];
  },
};

export default nextConfig;
