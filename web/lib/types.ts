import type { Provenance } from '../components/VoyageUI';

export interface BoundingBox {
  south: number;
  west: number;
  north: number;
  east: number;
}

export type Category = "atmosphere" | "land" | "ocean";
export type Resolution = "monthly" | "daily";

export interface TemporalCoverage {
  start: string; // e.g. "2000-01"
  end: string;   // e.g. "2025-12"
}

export interface VariableMeta {
  id: string;
  name: string;
  definition: string;
  units: string;
  category: Category;
  typical_resolution: Resolution;
  available_resolutions?: Resolution[];
  temporal_coverage?: TemporalCoverage;
  spatial_resolution_deg?: number;
  min_area_km2?: number;
  max_area_km2?: number;
  is_placeholder: boolean;
  placeholder_note: string;
}

export interface TimeSeriesPoint {
  t: string;
  value: number | null;
}

export interface TrendMethodResult {
  method_key: string;
  display_name: string;
  slope_per_year: number;
  slope_per_decade: number;
  intercept?: number | null;
  std_err?: number | null;
  ci_lower_decade?: number | null;
  ci_upper_decade?: number | null;
  p_value?: number | null;
  is_significant: boolean;
  test_statistic?: number | null;
  details?: Record<string, string | number | null>;
  notes?: string | null;
}

export interface Diagnostics {
  n_observations: number;
  missing_count: number;
  missing_pct: number;
  lag1_autocorrelation: number;
  warnings: string[];
}

export interface SummaryVerdict {
  verdict: "significant" | "not_significant" | "inconclusive";
  rate_per_decade: number;
  units: string;
  ci_lower_decade: number;
  ci_upper_decade: number;
  p_value: number | null;
  primary_method: string;
  plain_language: string;
  agreement_notes?: string | null;
  confidence_level?: number;
  confidence_method?: string | null;
}

export interface AnalyzeRequest {
  variable_id: string;
  bbox: BoundingBox;
  start: string;
  end: string;
  resolution?: Resolution;
  deseasonalize?: boolean;
  alpha?: number;
}

export interface AnalyzeResponse {
  provenance?: Provenance | null;
  variable: VariableMeta;
  bbox: BoundingBox;
  resolution: Resolution;
  units: string;
  source: string;
  is_mock: boolean;
  deseasonalize_applied: boolean;
  raw_timeseries: TimeSeriesPoint[];
  deseasonalized_timeseries?: TimeSeriesPoint[] | null;
  trend_line: TimeSeriesPoint[];
  methods: Record<string, TrendMethodResult>;
  diagnostics: Diagnostics;
  summary: SummaryVerdict;
}

export interface HealthResponse {
  status: string;
  service: string;
  phase: number;
  adapter: string;
  is_mock: boolean;
  verified?: boolean | null;
}

export function isAntimeridian(bbox: BoundingBox): boolean {
  return bbox.west > bbox.east;
}

export function getBBoxWidthDeg(bbox: BoundingBox): number {
  if (bbox.west <= bbox.east) {
    return bbox.east - bbox.west;
  }
  return 180.0 - bbox.west + (bbox.east - -180.0);
}

export function getBBoxCenter(bbox: BoundingBox): { lat: number; lon: number } {
  const lat = (bbox.south + bbox.north) / 2.0;
  if (!isAntimeridian(bbox)) {
    return { lat, lon: (bbox.west + bbox.east) / 2.0 };
  }
  const w360 = bbox.west;
  const e360 = bbox.east + 360.0;
  const mid360 = (w360 + e360) / 2.0;
  const lon = mid360 > 180.0 ? mid360 - 360.0 : mid360;
  return { lat, lon };
}

export function computeBBoxAreaKm2(bbox: BoundingBox): number {
  const r = 6371.0;
  const dSinLat = Math.abs(
    Math.sin((bbox.north * Math.PI) / 180) - Math.sin((bbox.south * Math.PI) / 180)
  );
  const lonSpanDeg = getBBoxWidthDeg(bbox);
  const dLonRad = (lonSpanDeg * Math.PI) / 180;
  return r * r * dSinLat * dLonRad;
}
