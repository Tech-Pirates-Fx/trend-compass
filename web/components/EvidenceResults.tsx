"use client";
import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, ArrowUpRight, Download, AlertTriangle, Copy, Check, RotateCcw, ShieldCheck, Database, Compass } from 'lucide-react';
import { fetchCatalog, runAnalysis } from '../lib/api';
import { AnalyzeResponse, BoundingBox } from '../lib/types';
import { recordBounds } from '../lib/records';
import { PRESET_REGIONS } from '../lib/presets';
import { GlassCard, ProvenancePanel, VerdictBadge } from './VoyageUI';
import { TimeSeriesChart } from './TimeSeriesChart';
import { StatsDetailsTable } from './StatsDetailsTable';
import { DataGate, fetchInventory } from './DataControl';
import { EvidenceLog, useExpedition } from './Expedition';

export function Results({queryOverride}:{queryOverride?:string}={}) {
  const {update}=useExpedition();
  const urlParams = (useSearchParams()??new URLSearchParams()), params=queryOverride?new URLSearchParams(queryOverride):urlParams, query = params.toString();
  const [data, setData] = useState<AnalyzeResponse | null>(null), [loading, setLoading] = useState(true), [error, setError] = useState(''), [retry, setRetry] = useState(0), [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    setData(null);

    async function analyze() {
      const p = new URLSearchParams(query);
      const inventory=await fetchInventory();
      if(!inventory.controls.enabled||!(p.has('preset')?inventory.controls.saved_voyages:inventory.can_play))throw new Error('Mission unavailable: observation data is disabled in Data Management.');
      if (p.has('preset')) {
        if (Array.from(p.keys()).some(key => key !== 'preset')) {
          throw new Error('Saved investigations use their recorded coordinates and dates. Start a new investigation to chart custom bounds.');
        }
        const response = await fetch('/api/py/saved-voyages',{cache:'no-store'});
        if (!response.ok) throw new Error('Saved voyages archive unavailable. Start a live investigation instead.');
        const saved = await response.json();
        const entry = saved.entries.find((item: { id: string; result: AnalyzeResponse }) => item.id === p.get('preset'));
        if (!entry || entry.result.is_mock || entry.result.provenance?.verified !== true) {
          throw new Error('This saved voyage does not contain verified NASA observations.');
        }
        if (active) setData(entry.result);
        return;
      }

      const catalog = await fetchCatalog();
      const variable = catalog.find(v => v.id === p.get('variable_id')) || (!p.get('variable_id') ? catalog[0] : undefined);
      if (!variable) throw new Error('The selected measurement is not in the connected catalog. Return to Chart Room to choose a variable.');
      const bounds = recordBounds(variable), start = p.get('start') || bounds?.start, end = p.get('end') || bounds?.end;
      if (!start || !end) throw new Error('Dataset timeline unavailable. Return to Chart Room to select dates.');
      const bbox = { ...PRESET_REGIONS[0].bbox };
      for (const key of ['south', 'west', 'north', 'east'] as const) {
        if (p.has(key)) bbox[key] = Number(p.get(key));
      }

      const response = await runAnalysis({
        variable_id: variable.id,
        bbox,
        start,
        end,
        resolution: p.get('resolution') === 'daily' ? 'daily' : 'monthly',
        deseasonalize: p.get('deseasonalize') === 'true',
        alpha: 0.05
      });
      if (active) setData(response);
    }

    analyze().catch(e => {
      if (active) setError(e instanceof Error ? e.message : 'Analysis failed. Check backend connection.');
    }).finally(() => {
      if (active) setLoading(false);
    });

    return () => { active = false; };
  }, [query, retry]);

  function download() {
    if (!data) return;
    const escape = (v: unknown) => `"${String(v ?? '').replaceAll('"', '""')}"`;
    const rows = [
      ['date', 'observed', 'deseasonalized', 'trend', 'units', 'source', 'is_mock'],
      ...data.raw_timeseries.map((p, i) => [
        p.t,
        p.value,
        data.deseasonalized_timeseries?.[i]?.value,
        data.trend_line[i]?.value,
        data.units,
        data.source,
        data.is_mock
      ])
    ];
    const blob = new Blob([rows.map(row => row.map(escape).join(',')).join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob), a = document.createElement('a');
    a.href = url;
    a.download = `trend-compass-${data.variable.id}${data.is_mock ? '-MOCK' : ''}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  const back = `/investigate?${query}`;
  useEffect(()=>{if(loading)update({result:'',view:'scan',logged:false});else if(error)update({result:'The data service could not complete this voyage. Retry or open a saved voyage.',station:2});},[loading,error,update]);

  return (
    <div className="workbench results-workbench max-w-7xl mx-auto px-5 sm:px-8 py-8 sm:py-12">
      {/* Action Toolbar */}
      <div className="results-toolbar mb-6 flex flex-wrap justify-between items-center gap-4">
        <Link href={back} className="inline-flex items-center gap-2 text-xs font-bold text-[var(--accent)] hover:underline">
          <ArrowLeft size={15} /> ⚓ Return to Chart Room
        </Link>
        <div className="flex gap-2.5">
          {data && (
            <>
              <button type="button" className="mode-button text-xs font-bold" onClick={copy}>
                {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Link Copied!' : 'Share Signal'}
              </button>
              <button type="button" className="mode-button text-xs font-bold !bg-[var(--gold)] !text-[var(--background)] !border-[var(--gold)] hover:brightness-110 shadow-md" onClick={download}>
                <Download size={14} /> Export CSV
              </button>
            </>
          )}
        </div>
      </div>

      {data&&<EvidenceLog data={data} query={query}/>}
      {/* Main Heading */}
      <div className="workbench-heading mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[var(--gold)] text-lg">💎</span>
            <p className="eyebrow text-[var(--gold)] font-mono font-bold">THE EVIDENCE CHEST</p>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            {data?.variable.name || 'Scanning Earth Observations…'}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--muted)] mt-1.5 font-medium">
            {params.get('region') || 'Selected regional coordinates'}
            {data && ` · ${data.resolution} observations`}
          </p>
        </div>
        {data && <VerdictBadge verdict={data.summary.verdict} />}
      </div>

      {loading && (
        <GlassCard className="p-8 text-center" role="status">
          <div className="loading-compass mx-auto mb-4" />
          <h3 className="text-lg font-bold">Opening the observation record…</h3>
          <p className="text-xs text-[var(--muted)] mt-1">Waiting for the selected investigation’s evidence.</p>
        </GlassCard>
      )}

      {error && (
        <GlassCard className="p-8">
          <AlertTriangle size={24} className="text-[var(--gold)] mb-3" />
          <h2 className="text-xl font-bold">Expedition Signal Failed to Resolve</h2>
          <p className="text-xs text-[var(--muted)] mt-2" role="alert">{error}</p>
          <div className="flex gap-4 mt-6">
            <button type="button" className="voyage-button text-xs font-bold" onClick={() => setRetry(r => r + 1)}>
              <RotateCcw size={14} /> Retry Query
            </button>
            <Link href={back} className="secondary-cta text-xs font-bold">
              Adjust Course <ArrowUpRight size={14} />
            </Link>
          </div>
        </GlassCard>
      )}

      {data && (
        <>
          {params.has('preset') && (
            <div className="notice mb-6 p-4 rounded-xl bg-[var(--glow)] border border-[var(--line)] text-xs text-[var(--muted)] font-medium flex items-center gap-2">
              <span className="text-[var(--gold)]">★</span>
              <span>Saved Voyage Record · Precomputed directly from official NASA GISTEMP v4 store. Functions fully offline without requiring a live Python server.</span>
            </div>
          )}

          {data.is_mock && (
            <div className="mock-result-notice mb-6 p-4 rounded-xl bg-amber-950/40 border border-amber-600/50 text-xs text-amber-200" role="note">
              <AlertTriangle size={18} />
              <div>
                <strong>SIMULATION / MOCK DATA ACTIVE</strong>
                <p>Synthetic values for interface testing. Not authentic NASA observations.</p>
              </div>
            </div>
          )}

          {/* =========================================================================
              THE FOUR DETECTIVE ANSWERS: METRIC CARDS
              ========================================================================= */}
          <div className="results-metrics grid sm:grid-cols-3 gap-4 mb-6">
            {/* Card 1: HOW MUCH (Rate per decade) */}
            <GlassCard className="metric-panel p-6">
              <span className="eyebrow text-[10px] font-mono text-[var(--gold)] font-bold">HOW MUCH / RATE PER DECADE</span>
              <strong className="text-3xl sm:text-4xl font-extrabold text-[var(--accent)] block my-2">
                {data.summary.rate_per_decade > 0 ? '+' : ''}{data.summary.rate_per_decade.toFixed(3)}
                <small className="text-xs font-normal text-[var(--muted)] ml-1">{data.units}</small>
              </strong>
              <p className="text-[11px] text-[var(--muted)]">Theil–Sen non-parametric median slope (outlier resilient)</p>
            </GlassCard>

            {/* Card 2: CONFIDENCE INTERVAL */}
            <GlassCard className="metric-panel p-6">
              <span className="eyebrow text-[10px] font-mono text-[var(--gold)] font-bold">CONFIDENCE INTERVAL (95%)</span>
              <strong className="text-2xl sm:text-3xl font-extrabold text-[var(--foreground)] block my-2 font-mono">
                [{data.summary.ci_lower_decade.toFixed(3)}, {data.summary.ci_upper_decade.toFixed(3)}]
              </strong>
              <p className="text-[11px] text-[var(--muted)]">Rank-based slope interval (serial dependence not corrected)</p>
            </GlassCard>

            {/* Card 3: IS IT SIGNIFICANT (Hamed-Rao Test) */}
            <GlassCard className="metric-panel p-6">
              <span className="eyebrow text-[10px] font-mono text-[var(--gold)] font-bold">IS IT SIGNIFICANT?</span>
              <strong className="text-2xl sm:text-3xl font-extrabold text-[var(--gold)] flex items-center gap-2 my-2">
                <ShieldCheck size={26} />
                {data.summary.verdict === 'significant' ? 'Significant' : data.summary.verdict === 'inconclusive' ? 'Inconclusive' : 'Not Significant'}
              </strong>
              <p className="text-[11px] text-[var(--muted)] font-mono">
                p = {data.summary.p_value == null ? "unavailable" : data.summary.p_value < 1e-4 ? data.summary.p_value.toExponential(3) : data.summary.p_value.toFixed(4)} (α = 0.05, Hamed-Rao MK)
              </p>
            </GlassCard>
          </div>

          {/* Plain English Finding & Coordinates */}
          <GlassCard className="finding-panel p-6 mb-6">
            <div>
              <span className="eyebrow text-[10px] font-mono text-[var(--gold)] font-bold block mb-1">CAPTAIN&apos;S PLAIN-LANGUAGE SUMMARY</span>
              <p className="text-sm text-[var(--foreground)] leading-relaxed font-medium">{data.summary.plain_language}</p>
              {data.summary.agreement_notes && (
                <p className="notice mt-3 text-xs text-[var(--muted)]">{data.summary.agreement_notes}</p>
              )}
            </div>

            <dl className="grid gap-3 pt-4 border-t sm:border-t-0 sm:border-l sm:pl-6 border-[var(--line)] text-xs">
              <div>
                <dt className="eyebrow text-[9px] text-[var(--muted)]">PRIMARY METHOD</dt>
                <dd className="font-bold text-[var(--foreground)]">
                  {data.methods[data.summary.primary_method]?.display_name || data.summary.primary_method}
                </dd>
              </div>
              <div>
                <dt className="eyebrow text-[9px] text-[var(--muted)]">GEOGRAPHIC BOUNDS</dt>
                <dd className="font-mono text-[11px] text-[var(--foreground)]">
                  {data.bbox.south.toFixed(1)}° to {data.bbox.north.toFixed(1)}° Lat<br />
                  {data.bbox.west.toFixed(1)}° to {data.bbox.east.toFixed(1)}° Lon
                </dd>
              </div>
              <div>
                <dt className="eyebrow text-[9px] text-[var(--muted)]">VALID OBSERVATIONS</dt>
                <dd className="font-mono text-[11px] text-[var(--foreground)]">
                  {data.diagnostics.n_observations} points · {data.raw_timeseries[0]?.t} → {data.raw_timeseries.at(-1)?.t}
                </dd>
              </div>
            </dl>
          </GlassCard>

          {/* Interactive Plotly Time Series Chart */}
          <TimeSeriesChart
            rawSeries={data.raw_timeseries}
            deseasonalizedSeries={data.deseasonalized_timeseries}
            trendLine={data.trend_line}
            units={data.units}
            variableName={data.variable.name}
          />

          {/* Detailed Statistical Table */}
          <StatsDetailsTable methods={data.methods} diagnostics={data.diagnostics} units={data.units} />

          {/* Provenance Panel with Checksums */}
          <ProvenancePanel provenance={data.provenance} />

          {/* Scientific Caveats Panel */}
          <GlassCard className="p-6">
            <div className="flex items-center gap-2 mb-2 text-[var(--gold)]">
              <Compass size={18} />
              <h3 className="font-bold text-sm uppercase tracking-wider font-mono">Interpretation & Caveats</h3>
            </div>
            <p className="text-xs text-[var(--muted)] leading-relaxed">
              Always review the reported slope rate, confidence interval, lag-1 autocorrelation ({data.diagnostics.lag1_autocorrelation.toFixed(2)}), and p-value together. 
              Statistical significance indicates evidence of a monotonic trend under the test’s assumptions, but is distinct from a subjective judgement of practical climate vulnerability.
            </p>
          </GlassCard>
        </>
      )}
    </div>
  );
}

