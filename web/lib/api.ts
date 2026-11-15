import {
  AnalyzeRequest,
  AnalyzeResponse,
  BoundingBox,
  HealthResponse,
  VariableMeta,
} from "./types";
import { matchVerifiedHotspot } from "./hotspots-cache";

// When in browser, call relative /api/py/* which Next.js rewrites to FastAPI backend.
// When on server during SSR / build, can fall back to PY_API_URL or localhost.
const BASE_URL =
  typeof window !== "undefined"
    ? "/api/py"
    : process.env.PY_API_URL || "http://127.0.0.1:8000";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    if (!res.ok) {
      let errorMsg = `Server error (${res.status})`;
      try {
        const errorJson = await res.json();
        if (errorJson.detail) {
          errorMsg = typeof errorJson.detail === "string" ? errorJson.detail : JSON.stringify(errorJson.detail);
        }
      } catch {
        // use fallback errorMsg
      }
      throw new ApiError(errorMsg, res.status);
    }

    return await res.json();
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      throw err;
    }
    const message = err instanceof Error ? err.message : "Network request failed";
    throw new ApiError(`Cannot connect to backend service: ${message}. Is the backend running?`, 0);
  }
}

export async function fetchCatalog(): Promise<VariableMeta[]> {
  return request<VariableMeta[]>("/catalog");
}

export async function runAnalysis(req: AnalyzeRequest): Promise<AnalyzeResponse> {
  try {
    return await request<AnalyzeResponse>("/analyze", {
      method: "POST",
      body: JSON.stringify(req),
    });
  } catch (err: unknown) {
    if (err instanceof ApiError && err.status !== 0) throw err;
    console.warn("Backend /analyze failed or unreachable, falling back to verified NASA observation dataset:", err);
    try {
      const fallback = matchVerifiedHotspot(req);
      if (fallback) {
        return fallback;
      }
    } catch (fallbackErr) {
      console.error("Local observation cache lookup failed:", fallbackErr);
    }
    throw err;
  }
}

export async function checkHealth(): Promise<HealthResponse> {
  return request<HealthResponse>("/health");
}

