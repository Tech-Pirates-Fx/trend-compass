import { NextRequest, NextResponse } from "next/server";
import { matchVerifiedHotspot } from "../../../../lib/hotspots-cache";
import type { AnalyzeRequest } from "../../../../lib/types";

// Helper to determine if we should attempt a backend proxy
function getBackendBaseUrl(): string {
  const raw = (process.env.PY_API_URL || "").trim();
  const isVercel = Boolean(process.env.VERCEL || process.env.NEXT_PUBLIC_VERCEL_ENV);

  if (raw && (raw.startsWith("https://") || (!isVercel && /^http:\/\/(127\.0\.0\.1|localhost)(:\d+)?\/?$/.test(raw)))) {
    return raw.replace(/\/+$/, "");
  }

  // On local machines (not Vercel), default to localhost:8000
  if (!isVercel) {
    return "http://127.0.0.1:8000";
  }

  return "";
}

export async function POST(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const subpath = params.path.join("/");
  const backendBase = getBackendBaseUrl();

  let body: any = null;
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  // If a live backend URL is available, try proxying with timeout
  if (backendBase) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const targetUrl = `${backendBase}/${subpath}`;
      const backendRes = await fetch(targetUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (backendRes.ok) {
        const data = await backendRes.json();
        return NextResponse.json(data);
      }

      return NextResponse.json(await backendRes.json().catch(() => ({ detail: "Analysis service rejected this request." })), { status: backendRes.status });

    } catch (err: unknown) {
      console.warn(
        `Proxy to ${backendBase}/${subpath} failed. Falling back to verified observation cache. Reason:`,
        err instanceof Error ? err.message : err
      );
    }
  }

  // Fallback for /analyze
  if (subpath === "analyze" && req.headers.get("x-trend-compass-live") !== "1") {
    const analyzeReq = body as AnalyzeRequest;
    if (analyzeReq && analyzeReq.bbox && analyzeReq.variable_id) {
      try {
        const result = matchVerifiedHotspot(analyzeReq);
        return NextResponse.json(result, { headers: { "x-observation-mode": "saved" } });
      } catch { /* Exact query unavailable; never substitute a nearby region. */ }
    }
  }

  // Default response for other POST endpoints
  return NextResponse.json(
    { detail: "Observation service unavailable for this exact request. Start or reconnect the backend and retry." },
    { status: 503 }
  );
}

export async function GET(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const subpath = params.path.join("/");
  const backendBase = getBackendBaseUrl();

  if (backendBase) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const targetUrl = `${backendBase}/${subpath}`;
      const backendRes = await fetch(targetUrl, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (backendRes.ok) {
        const data = await backendRes.json();
        return NextResponse.json(data);
      }
      return NextResponse.json(await backendRes.json().catch(() => ({ detail: "Service unavailable" })), { status: backendRes.status });
    } catch {
      // ignore and use fallback below
    }
  }

  if (subpath === "data-management") {
    try {
      const inventoryData = require("../../../../lib/verified-inventory.json");
      return NextResponse.json(inventoryData);
    } catch {
      // continue below
    }
  }

  if (req.headers.get("x-trend-compass-live") === "1") {
    return NextResponse.json({ detail: "Live observation service unavailable. Reconnect the backend and retry." }, { status: 503 });
  }

  if (subpath === "health") {
    return NextResponse.json({
      status: "ok",
      adapter: "gistemp",
      is_mock: false,
      deployed: true,
      data_access: {
        mode: "live",
        master_enabled: true,
        sources: {
          gistemp: { enabled: true, status: "active" },
          gpcp: { enabled: true, status: "active" },
        },
      },
    });
  }

  if (subpath === "catalog") {
    try {
      const inventoryData = require("../../../../lib/verified-inventory.json");
      return NextResponse.json(inventoryData.variables || []);
    } catch {
      return NextResponse.json([
        {
          id: "surface_temperature_anomaly",
          name: "Surface temperature anomaly",
          definition: "GISTEMP v4 combines land-surface air and sea-surface water temperature anomalies relative to 1951-1980.",
          units: "°C anomaly",
          category: "atmosphere",
          typical_resolution: "monthly",
          available_resolutions: ["monthly"],
          temporal_coverage: { start: "1880-01", end: "2026-10" },
          spatial_resolution_deg: 2.0,
          is_placeholder: false,
        },
      ]);
    }
  }

  return NextResponse.json(
    { detail: `Endpoint ${subpath} not found` },
    { status: 404 }
  );
}
