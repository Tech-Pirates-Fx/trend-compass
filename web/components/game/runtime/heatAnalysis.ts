import type { AnalyzeRequest, AnalyzeResponse, VariableMeta } from "../../../lib/types";
import { matchesReceipt } from "../domain/heatCase";

async function liveJson<T>(path: string, signal: AbortSignal, body?: unknown): Promise<T> {
  const response = await fetch(`/api/py/${path}`, {
    method: body ? "POST" : "GET", signal, cache: "no-store",
    headers: { "Content-Type": "application/json", "x-trend-compass-live": "1" },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await response.json();
  if (!response.ok) throw Error(typeof data.detail === "string" ? data.detail : "Observation service unavailable. Reconnect and retry.");
  return data as T;
}
export async function loadHeatCatalog(signal: AbortSignal): Promise<VariableMeta> {
  const catalog = await liveJson<VariableMeta[]>("catalog", signal);
  const variable = catalog.find(v => v.id === "surface_temperature_anomaly" && !v.is_placeholder);
  if (!variable?.temporal_coverage) throw Error("Temperature coverage is unavailable in the live catalog.");
  return variable;
}
export async function analyzeHeat(query: AnalyzeRequest, signal: AbortSignal): Promise<AnalyzeResponse> {
  const result = await liveJson<AnalyzeResponse>("analyze", signal, query);
  if (!matchesReceipt(query, result)) throw Error("The returned receipt does not match the requested region, dates or verified source.");
  return result;
}
