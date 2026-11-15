"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Database,
  Lock,
  Layers,
  FileText,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Cpu,
  RefreshCw,
  Server,
  Sparkles,
  Info,
} from "lucide-react";
import { useDataControl, type Controls } from "../../components/DataControl";
import { sources, sourceStatus, type SourceInventory } from "../../lib/sources-registry";
import { GlassCard } from "../../components/VoyageUI";

export default function TechnicalDetails() {
  const { inventory, error, refresh } = useDataControl();
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  async function change(next: Controls) {
    setBusy(true);
    setNotice("");
    try {
      const response = await fetch("/api/data-control", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-TC-Admin": "local-workstation",
        },
        body: JSON.stringify(next),
      });
      const body = await response.json();
      if (!response.ok) {
        throw new Error(body.detail || "Settings could not be saved");
      }
      await refresh();
      setNotice("Settings saved. Connected play screens will reflect changes immediately.");
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Could not save settings");
    } finally {
      setBusy(false);
    }
  }

  const live = inventory as unknown as SourceInventory | null;
  const datasetInventory = sources.filter(s => live?.source_receipts?.[s.id]?.loaded).map(s => {
    const r = live!.source_receipts[s.id];
    return {name:s.name,category:s.kind,badgeClass:"text-teal-300 border-teal-500/40",source:r.citation || "Credit unavailable in receipt",url:s.url,sha256:r.sha256 || "Receipt missing",size:"See backend file inventory",coverage:typeof r.period === "string" ? r.period : r.period ? `${r.period.start} to ${r.period.end}` : "UNKNOWN",resolution:r.resolution || "UNKNOWN",baseline:"See source receipt",usage:s.usedBy.map(u=>u.label).join(", "),status:sourceStatus(s,live)};
  });
  const scientificCitations = [
    {
      label: "GISTEMP v4 Methodology & Uncertainty",
      citation:
        "Lenssen, N. J. L., G. Schmidt, J. Hansen, M. Menne, R. Ruedy, B. Kelly, and K. Hendrickson, 2024: Improvements in the GISTEMP uncertainty quantification. J. Geophys. Res. Atmos., doi:10.1029/2023JD040177.",
    },
    {
      label: "GISTEMP Primary Analysis",
      citation:
        "Hansen, J., R. Ruedy, M. Sato, and K. Lo, 2010: Global surface temperature change. Rev. Geophys., 48, RG4004, doi:10.1029/2010RG000345.",
    },
    {
      label: "Theil-Sen Robust Estimator",
      citation:
        "Theil, H., 1950: A rank-invariant method of linear and polynomial regression analysis; Sen, P. K., 1968: Estimates of the regression coefficient based on Kendall's tau. J. Amer. Statist. Assoc., 63, 1379–1389.",
    },
    {
      label: "Hamed-Rao Modified Mann-Kendall",
      citation:
        "Hamed, K. H., and A. R. Rao, 1998: A modified Mann-Kendall trend test for autocorrelated data. J. Hydrol., 204, 182–196.",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Status Notice */}
      {(error || notice) && (
        <div
          role="status"
          className={`p-4 rounded-xl mb-8 flex items-center gap-3 text-sm ${
            error
              ? "bg-red-950/80 border border-red-500/50 text-red-200"
              : "bg-teal-950/80 border border-teal-500/50 text-teal-200"
          }`}
        >
          {error ? <AlertTriangle size={18} className="shrink-0" /> : <CheckCircle2 size={18} className="shrink-0" />}
          <span>{error || notice}</span>
        </div>
      )}

      {/* =========================================================================
          SECTION 1: #controls — LOCAL WORKSTATION DATA SWITCHES
          ========================================================================= */}
      <section id="controls" className="mb-16 scroll-mt-20">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-amber-400 font-mono text-xs uppercase tracking-wider font-bold">
            01 / WORKSTATION DATA GOVERNANCE
          </span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Local Server-Enforced Controls</h2>
            <p className="text-xs text-slate-400 mt-1">
              Authorized workstation controls. Switching a source off preserves its data files and stops dependent operations.
            </p>
          </div>
          <button
            type="button"
            onClick={refresh}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 text-xs font-mono text-slate-300 transition-colors"
          >
            <RefreshCw size={12} className={busy ? "animate-spin" : ""} />
            <span>Refresh State</span>
          </button>
        </div>

        {!inventory ? (
          <GlassCard className="p-8 text-center">
            <p className="text-slate-300 text-sm mb-4">Connecting to local data control service…</p>
            <button type="button" onClick={refresh} className="tactile-game-btn tactile-game-btn-primary">
              Reconnect Data Service
            </button>
          </GlassCard>
        ) : (
          <div className="space-y-6">
            {/* MASTER SWITCH BANNER */}
            <div
              className={`p-6 rounded-2xl border transition-all ${
                inventory.controls.enabled
                  ? "bg-gradient-to-r from-teal-950/60 to-slate-900/80 border-teal-500/40 shadow-[0_0_25px_rgba(45,212,191,0.15)]"
                  : "bg-gradient-to-r from-red-950/60 to-slate-900/80 border-red-500/40 shadow-[0_0_25px_rgba(239,68,68,0.15)]"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        inventory.controls.enabled ? "bg-teal-400 animate-pulse" : "bg-red-400"
                      }`}
                    />
                    <span className="text-[11px] font-mono uppercase tracking-widest text-slate-300 font-bold">
                      MASTER DATA SWITCH
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    {inventory.controls.enabled ? "Ship Systems Online · Live Analysis Enabled" : "All Missions Offline · Data Gate Engaged"}
                  </h3>
                  <p className="text-xs text-slate-300 max-w-xl">
                    Master kill switch enforces data policy at the FastAPI backend level. Turning data off blocks live analysis
                    and saved voyages without deleting underlying records.
                  </p>
                </div>

                <button
                  role="switch"
                  aria-checked={inventory.controls.enabled}
                  disabled={busy}
                  onClick={() => change({ ...inventory.controls, enabled: !inventory.controls.enabled })}
                  className={`px-5 py-2.5 rounded-xl font-mono text-xs font-bold transition-all shadow-md self-start sm:self-auto ${
                    inventory.controls.enabled
                      ? "bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/50"
                      : "bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold border border-teal-300"
                  }`}
                >
                  {inventory.controls.enabled ? "Turn All Data OFF" : "Restore Data Access"}
                </button>
              </div>
            </div>

            {/* SOURCE-SPECIFIC SWITCHES */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                {
                  key: "gistemp",
                  name: "NASA GISTEMP v4 Temperature",
                  desc: "Powers live temperature anomaly investigations. Requires the processed 2°×2° GISTEMP v4 NetCDF store.",
                  badge: "CORE GRID CONNECTED",
                  badgeClass: "text-teal-300 border-teal-500/40 bg-teal-950/40",
                },
                {
                  key: "gpcp",
                  name: "GPCP v2.3 Monthly Precipitation",
                  desc: "Powers flood and deluge risk mode. 2.5°×2.5° gridded satellite and gauge precipitation CDR.",
                  badge: "PRECIPITATION CDR",
                  badgeClass: "text-cyan-300 border-cyan-500/40 bg-cyan-950/40",
                },
                {
                  key: "sea_level",
                  name: "NASA Sea Level Altimetry",
                  desc: "Global Mean Sea Level (GMSL) satellite altimeter observations tracking ocean thermal expansion and ice melt.",
                  badge: "OCEAN ALTIMETRY",
                  badgeClass: "text-blue-300 border-blue-500/40 bg-blue-950/40",
                },
                {
                  key: "appeears",
                  name: "AppEEARS MODIS Vegetation (NDVI)",
                  desc: "NASA LP DAAC MODIS MOD13C2 vegetation canopy health and agricultural harvest vigor index.",
                  badge: "VEGETATION INDEX",
                  badgeClass: "text-emerald-300 border-emerald-500/40 bg-emerald-950/40",
                },
                {
                  key: "data_rods",
                  name: "GES DISC Data Rods Soil Hydrology",
                  desc: "NASA NLDAS-2 / GLDAS-2 Noah Land Surface Model 0–100 cm volumetric soil moisture records.",
                  badge: "SOIL HYDROLOGY",
                  badgeClass: "text-amber-300 border-amber-500/40 bg-amber-950/40",
                },
                {
                  key: "giovanni",
                  name: "NASA Giovanni IMERG Precipitation",
                  desc: "NASA GES DISC multi-satellite IMERG precipitation time-series for monsoon and storm cross-validation.",
                  badge: "IMERG RAINFALL",
                  badgeClass: "text-sky-300 border-sky-500/40 bg-sky-950/40",
                },
                {
                  key: "noaa_cdo",
                  name: "NOAA CDO Ground Station Truth",
                  desc: "NOAA NCEI Global Historical Climatology Network (GHCN) meteorological station calibration benchmarks.",
                  badge: "GROUND TRUTH",
                  badgeClass: "text-orange-300 border-orange-500/40 bg-orange-950/40",
                },
                {
                  key: "knmi",
                  name: "KNMI Climate Explorer ENSO",
                  desc: "ERSSTv5 equatorial Pacific Nino 3.4 sea-surface temperature anomaly indices for teleconnection analysis.",
                  badge: "CLIMATE INDICES",
                  badgeClass: "text-indigo-300 border-indigo-500/40 bg-indigo-950/40",
                },
                {
                  key: "swot",
                  name: "NASA/CNES SWOT Water Elevation",
                  desc: "Ka-band radar interferometer telemetry measuring inland river reach and lake surface water elevations.",
                  badge: "SURFACE ALTIMETRY",
                  badgeClass: "text-teal-300 border-teal-500/40 bg-teal-950/40",
                },
                {
                  key: "radarsat",
                  name: "CSA RADARSAT SAR Flood Extent",
                  desc: "Synthetic Aperture Radar (SAR) C-band flood inundation telemetry and cloud-penetrating radar coverage.",
                  badge: "RADAR INUNDATION",
                  badgeClass: "text-violet-300 border-violet-500/40 bg-violet-950/40",
                },
                {
                  key: "earth_info",
                  name: "NASA Earth Information Center",
                  desc: "Live planetary vital signs HUD streaming atmospheric carbon, ice sheet mass changes, and global anomalies.",
                  badge: "PLANETARY VITALS",
                  badgeClass: "text-rose-300 border-rose-500/40 bg-rose-950/40",
                },
                {
                  key: "instruments",
                  name: "NASA Earth Science Fleet Telemetry",
                  desc: "Active constellation sensor calibration matrix covering MODIS, AIRS, OMI, GPM, and MERRA-2.",
                  badge: "ORBITAL FLEET",
                  badgeClass: "text-fuchsia-300 border-fuchsia-500/40 bg-fuchsia-950/40",
                },
                {
                  key: "global_table",
                  name: "NASA GISS Global Monthly Table",
                  desc: "Official published GLB.Ts+dSST global mean temperature anomaly baseline for comparison against regional slopes.",
                  badge: "GLOBAL BENCHMARK",
                  badgeClass: "text-yellow-300 border-yellow-500/40 bg-yellow-950/40",
                },
                {
                  key: "saved_voyages",
                  name: "Verified Saved Voyages",
                  desc: "Enables previously computed real investigations; these represent historical audit records, not live runs.",
                  badge: "PRECOMPUTED ARCHIVE",
                  badgeClass: "text-purple-300 border-purple-500/40 bg-purple-950/40",
                },
                {
                  key: "nasa_imagery",
                  name: "NASA Globe Imagery (GIBS)",
                  desc: "Decorative Blue Marble basemap. Switching off leaves the vector globe and numerical analysis fully functional.",
                  badge: "CONTEXTUAL BASEMAP",
                  badgeClass: "text-blue-300 border-blue-500/40 bg-blue-950/40",
                },
              ].map((item) => {
                const k = item.key as keyof Controls;
                const isEnabled = inventory.controls[k];
                return (
                  <GlassCard key={item.key} className="p-5 flex flex-col justify-between">
                    <div>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded border inline-block mb-3 ${item.badgeClass}`}
                      >
                        {item.badge}
                      </span>
                      <h4 className="text-base font-bold text-white mb-1.5">{item.name}</h4>
                      <p className="text-xs text-slate-300 leading-relaxed mb-4">{item.desc}</p>
                    </div>

                    <button
                      role="switch"
                      aria-checked={isEnabled}
                      disabled={busy}
                      onClick={() => change({ ...inventory.controls, [k]: !isEnabled })}
                      className={`w-full py-2 rounded-lg font-mono text-xs font-bold transition-all border ${
                        isEnabled
                          ? "bg-teal-950/60 hover:bg-teal-900/60 text-teal-300 border-teal-500/40"
                          : "bg-slate-900 hover:bg-slate-800 text-slate-400 border-slate-700"
                      }`}
                    >
                      {isEnabled ? "Enabled" : "Disabled"}
                    </button>
                  </GlassCard>
                );
              })}
            </div>

            {/* REGISTERED MEASUREMENTS & BACKEND SERVICES STRIP */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
              <div className="holotank-console p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Database size={16} className="text-teal-400" />
                  <h4 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                    Registered Telemetry Store
                  </h4>
                </div>
                {inventory.store_error && (
                  <p role="alert" className="text-xs text-red-300 mb-3">
                    {inventory.store_error}
                  </p>
                )}
                {inventory.variables.map((v) => (
                  <div key={v.id} className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-xs mb-2">
                    <div className="flex items-center justify-between mb-1">
                      <strong className="text-white font-mono">{v.name}</strong>
                      <span className="text-[10px] text-teal-300 font-mono">{v.units}</span>
                    </div>
                    <p className="text-slate-400 mb-1">{v.definition}</p>
                    <p className="text-[11px] text-slate-500 font-mono">
                      Coverage: {v.temporal_coverage?.start} → {v.temporal_coverage?.end}
                    </p>
                  </div>
                ))}
                {!inventory.variables.length && (
                  <p className="text-xs text-slate-400">
                    No usable measurement store detected. Enabling a switch cannot create missing data.
                  </p>
                )}
              </div>

              <div className="holotank-console p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Server size={16} className="text-amber-400" />
                  <h4 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                    Connected Application Services
                  </h4>
                </div>
                <div className="space-y-2">
                  {inventory.services.map((s) => {
                    const isAllowed =
                      inventory.controls.enabled &&
                      inventory.controls[s.source as keyof Controls];
                    return (
                      <div
                        key={s.route}
                        className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div>
                          <strong className="text-white block">{s.name}</strong>
                          <code className="text-[11px] text-slate-400 font-mono">{s.route}</code>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            isAllowed
                              ? "bg-teal-950 text-teal-300 border border-teal-500/30"
                              : "bg-red-950 text-red-300 border border-red-500/30"
                          }`}
                        >
                          {isAllowed ? "ONLINE" : "BLOCKED"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* =========================================================================
          SECTION 2: #sources — DATASET RECEIPTS & SCIENTIFIC PROVENANCE
          ========================================================================= */}
      <section id="sources" className="mb-16 scroll-mt-20">
        <p className="mb-6 text-slate-300">Sea of Time (/voyage) uses verified GISTEMP v4 monthly observations for 1986–2025, deterministic case selection and original procedural ship/UI art. Its 300 seeded AR(1) noise storms are simulated teaching aids, not NASA observations or the official significance test. The official verdict uses Hamed–Rao. World tint uses annual Theil–Sen slopes; incomplete cells remain transparent. Existing NASA Blue Marble imagery and AI-generated Piper assets are reused. OpenAI Codex implemented this local prototype; system monospace fonts require no downloaded font asset.</p>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-amber-400 font-mono text-xs uppercase tracking-wider font-bold">
            02 / SCIENTIFIC PROVENANCE &amp; RECEIPTS
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          Dataset Inventory &amp; Cryptographic Receipts
        </h2>
        <p className="text-slate-300 text-sm max-w-3xl mb-8 leading-relaxed">
          Every observation used by Trend Compass traces to an official NASA or public domain repository.
          Below is the complete inventory of numerical observations, validation CSVs, and contextual assets.
        </p>

        <div className="space-y-4">
          {datasetInventory.map((item, i) => (
            <GlassCard key={i} className="p-6">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border ${item.badgeClass}`}>
                      {item.category}
                    </span>
                    <span className="text-xs font-mono text-slate-400">· {item.source}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white">{item.name}</h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">{item.usage}</p>
                </div>

                <div className="text-right shrink-0">
                  <span className="inline-block px-2.5 py-1 rounded-md text-xs font-mono bg-slate-900 border border-slate-700 text-slate-300">
                    {item.status}
                  </span>
                </div>
              </div>

              {/* Technical Specifications Matrix */}
              <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
                <div>
                  <span className="text-slate-500 block text-[10px]">COVERAGE</span>
                  <span className="text-slate-300">{item.coverage}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">SPATIAL RESOLUTION</span>
                  <span className="text-slate-300">{item.resolution}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">CLIMATOLOGY BASELINE</span>
                  <span className="text-slate-300">{item.baseline}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">PAYLOAD SIZE</span>
                  <span className="text-slate-300">{item.size}</span>
                </div>
              </div>

              {/* Cryptographic SHA-256 Receipt */}
              <div className="mt-3 p-2.5 rounded-lg bg-black/60 border border-slate-800 text-[11px] font-mono flex flex-col sm:flex-row sm:items-center justify-between gap-2 overflow-hidden">
                <div className="flex items-center gap-2 truncate">
                  <ShieldCheck size={14} className="text-teal-400 shrink-0" />
                  <span className="text-slate-400 shrink-0">SHA-256:</span>
                  <code className="text-teal-300 truncate">{item.sha256}</code>
                </div>
                {item.url.startsWith("http") && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-slate-400 hover:text-white shrink-0 transition-colors"
                  >
                    <span>Official Source</span>
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: #citations — SCIENTIFIC LITERATURE CITATIONS
          ========================================================================= */}
      <section id="citations" className="mb-16 scroll-mt-20">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-amber-400 font-mono text-xs uppercase tracking-wider font-bold">
            03 / PEER-REVIEWED LITERATURE
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          Methodology &amp; Literature Citations
        </h2>
        <p className="text-slate-300 text-sm max-w-3xl mb-6">
          Our statistical algorithms adhere strictly to published climate and statistical literature.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {scientificCitations.map((c, i) => (
            <GlassCard key={i} className="p-5">
              <span className="text-xs font-mono text-amber-300 font-bold block mb-1.5">{c.label}</span>
              <p className="text-xs text-slate-300 font-mono leading-relaxed">{c.citation}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: #transparency — AI DISCLOSURES & SYSTEM TRANSPARENCY
          ========================================================================= */}
      <section id="transparency" className="mb-12 scroll-mt-20">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-amber-400 font-mono text-xs uppercase tracking-wider font-bold">
            04 / AI DISCLOSURE &amp; TRANSPARENCY
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          AI Collaboration &amp; Mathematical Determinism
        </h2>
        <p className="text-slate-300 text-sm max-w-3xl mb-6 leading-relaxed">
          In compliance with NASA Space Apps Challenge AI disclosure rules, below is a complete breakdown of
          AI utilization vs. deterministic mathematical execution.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GlassCard className="p-6">
            <div className="flex items-center gap-2 text-teal-300 font-bold text-sm mb-3">
              <Sparkles size={18} />
              <span>AI ASSISTANCE ROLES</span>
            </div>
            <ul className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <li>
                <strong className="text-white">AI Tools Used:</strong> Anthropic Claude 3.5 Sonnet, Google DeepMind
                Antigravity, and GitHub/OpenAI Codex.
              </li>
              <li>
                <strong className="text-white">Assistance Scope:</strong> Used as engineering pair programmers for
                FastAPI route boilerplate, Next.js 14 App Router layout troubleshooting, TailwindCSS responsive styling,
                and comprehensive unit test suites.
              </li>
              <li>
                <strong className="text-white">Prompts &amp; Logs:</strong> All agent sessions and instructions are
                logged in <code className="text-teal-300">docs/AI_LOG.md</code> and version-controlled.
              </li>
            </ul>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-sm mb-3">
              <ShieldCheck size={18} />
              <span>ZERO AI HALLUCINATION IN SCIENCE</span>
            </div>
            <ul className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <li>
                <strong className="text-white">Deterministic Execution:</strong> No generative AI model or LLM produces,
                guesses, or modifies climate data. All slope rates, p-values, confidence intervals, and time-series
                reductions are calculated deterministically by Python scripts.
              </li>
              <li>
                <strong className="text-white">Mathematical Engines:</strong> Executed using NumPy, SciPy Stats, and
                pyMannKendall directly against verified NetCDF observation arrays.
              </li>
              <li>
                <strong className="text-white">Full Reproducibility:</strong> Every calculation can be reproduced
                locally via <code className="text-amber-300">pytest api/tests</code>.
              </li>
            </ul>
          </GlassCard>
        </div>
      </section>
    </div>
  );
}
