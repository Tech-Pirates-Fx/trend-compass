import type { HTMLAttributes, ReactNode } from "react";
import { CheckCircle2, CircleHelp, MinusCircle, Database } from "lucide-react";

export function GlassCard({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`glass-card ${className}`} {...props} />;
}
export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "gold" | "teal" }) {
  return <span className={`voyage-badge badge-${tone}`}>{children}</span>;
}
export function HudFrame({ children, label, className = "" }: { children: ReactNode; label: string; className?: string }) {
  return <section aria-label={label} className={`hud-frame ${className}`}><span className="eyebrow hud-label">{label}</span>{children}</section>;
}
export function SectionHeader({ eyebrow, title, children }: { eyebrow?: string; title: string; children?: ReactNode }) {
  return <div className="mb-7">{eyebrow && <p className="eyebrow mb-3 text-[var(--accent)]">{eyebrow}</p>}
    <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">{title}</h2>
    {children && <div className="mt-3 text-[var(--muted)] leading-relaxed max-w-2xl">{children}</div>}</div>;
}
export function VerdictBadge({ verdict }: { verdict: "significant" | "not_significant" | "inconclusive" }) {
  const labels = { significant: "Statistically significant", not_significant: "Not statistically significant", inconclusive: "Inconclusive" };
  const Icon = verdict === "significant" ? CheckCircle2 : verdict === "not_significant" ? MinusCircle : CircleHelp;
  return <Badge tone={verdict === "significant" ? "teal" : verdict === "inconclusive" ? "gold" : "neutral"}><Icon size={14} aria-hidden="true" />{labels[verdict]}</Badge>;
}
export interface Provenance {
  dataset_name?: string; version?: string; source_url?: string | null; retrieval_date?: string | null;
  units?: string; baseline?: string; spatial_resolution?: string;
  temporal_coverage?: string | { start?: string; end?: string };
  citation?: string; smoothing?: string; verified?: boolean;
  input_sha256?: string;
  processed_sha256?: string | null;
}
export function ProvenancePanel({ provenance }: { provenance?: Provenance | null }) {
  const coverage = provenance?.temporal_coverage;
  const coverageText = typeof coverage === "string" ? coverage : coverage ? `${coverage.start || "Unknown"} to ${coverage.end || "Unknown"}` : undefined;
  const rows = [["Dataset", provenance?.dataset_name], ["Version", provenance?.version], ["Retrieved", provenance?.retrieval_date],
    ["Units", provenance?.units], ["Baseline", provenance?.baseline], ["Grid resolution", provenance?.spatial_resolution],
    ["Record", coverageText], ["Smoothing", provenance?.smoothing], ["Citation", provenance?.citation], ["Input SHA-256", provenance?.input_sha256], ["Processed SHA-256", provenance?.processed_sha256]];
  let source: string | undefined;
  try { const url = new URL(provenance?.source_url || ""); if (["https:", "http:"].includes(url.protocol)) source = url.href; } catch { /* Unknown source. */ }
  const hasDetails = rows.some(([, value]) => Boolean(value)) || Boolean(source);
  return <GlassCard className="p-6 sm:p-8">
    <div className="flex items-center gap-3 mb-5"><Database size={19} className="text-[var(--accent)]" aria-hidden="true" /><h2 className="font-semibold text-lg">Where this data comes from</h2></div>
    {!hasDetails ? <p className="text-sm leading-relaxed text-[var(--muted)]">Dataset provenance has not been supplied. The source, version and retrieval date are unknown.</p> : <>
      {provenance?.verified === true && <p className="mb-4 text-sm text-[var(--accent)]">Official-source download recorded · checksums below</p>}
      {provenance?.verified === false && <p className="mb-4 text-sm text-[var(--gold)]">Provisional source · official origin has not been verified.</p>}
      <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-5">{rows.map(([label, value]) => <div key={label}><dt className="eyebrow mb-1">{label}</dt><dd className="text-sm leading-relaxed break-words">{value || "Not supplied"}</dd></div>)}</dl>
      {source && <a href={source} target="_blank" rel="noopener noreferrer" className="inline-block mt-6 text-sm underline underline-offset-4 text-[var(--accent)]">Open dataset source ↗</a>}
    </>}
  </GlassCard>;
}
