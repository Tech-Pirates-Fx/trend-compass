function resolveBackendUrl(raw) {
  let url = (raw || "http://127.0.0.1:8000").trim();
  // Strip enclosing quotes if accidentally pasted
  url = url.replace(/^["']|["']$/g, "").trim();
  // Strip "PY_API_URL=" prefix if accidentally pasted whole line
  url = url.replace(/^PY_API_URL\s*=\s*/i, "").trim();
  if (!url) {
    url = "http://127.0.0.1:8000";
  } else if (!url.startsWith("http://") && !url.startsWith("https://") && !url.startsWith("/")) {
    url = `https://${url}`;
  }
  return url.replace(/\/+$/, "");
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Keep a preview and a verification build from sharing generated files.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  async rewrites() {
    // Note: All `/api/py/*` requests are handled natively by App Router at `app/api/py/[...path]/route.ts`.
    // This proxies to PY_API_URL when an external backend is configured, and provides genuine precomputed
    // NASA GISTEMP v4 / GPCP v2.3 data when offline, completely preventing Vercel 502 errors.
    return [];
  },
  async redirects() {
    return [
      {
        source: "/play",
        destination: "/",
        permanent: false,
      },
      {
        source: "/members",
        destination: "/about#crew",
        permanent: false,
      },
      {
        source: "/crew",
        destination: "/about#crew",
        permanent: false,
      },
      {
        source: "/mission",
        destination: "/about#mission",
        permanent: false,
      },
      {
        source: "/summary",
        destination: "/about#summary",
        permanent: false,
      },
      {
        source: "/project-summary",
        destination: "/about#summary",
        permanent: false,
      },
      {
        source: "/judge",
        destination: "/about#approach",
        permanent: false,
      },
      {
        source: "/sources",
        destination: "/data#sources",
        permanent: false,
      },
      {
        source: "/demo",
        destination: "/about#links",
        permanent: false,
      },
      {
        source: "/investigate",
        destination: "/",
        permanent: false,
      },
      {
        source: "/results",
        destination: "/?step=5",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;


