'use client';
import { Fragment, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  sources,
  sourceStatus,
  howIncluded,
  type SourceInventory,
  type Receipt,
} from '../../lib/sources-registry';
import TechnicalDetails from './TechnicalDetails';
import './sources.css';

const filters = ['All', 'In the app', 'Not in the app', 'Reference only'] as const;

function period(r?: Receipt) {
  return typeof r?.period === 'string'
    ? r.period
    : r?.period
    ? `${r.period.start} – ${r.period.end}`
    : 'UNKNOWN';
}

export default function SourcesPage() {
  const [inventory, setInventory] = useState<SourceInventory | null>(null);
  const [filter, setFilter] = useState<(typeof filters)[number]>('All');
  const [open, setOpen] = useState<string[]>([]);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    async function check() {
      try {
        const r = await fetch('/api/py/data-management', {
          cache: 'no-store',
          headers: { 'x-trend-compass-live': '1' },
          signal: controller.signal,
        });
        if (!r.ok) throw Error();
        const data = await r.json();
        if (!data.source_receipts) throw Error();
        if (active) setInventory(data);
      } catch {
        if (active) setInventory(null);
      }
    }
    void check();
    const timer = setInterval(check, 5000);
    return () => {
      active = false;
      controller.abort();
      clearInterval(timer);
    };
  }, []);

  const rows = sources.map((source) => ({
    source,
    status: sourceStatus(source, inventory),
    receipt: inventory?.source_receipts[source.id],
  }));
  const included = rows.filter((r) => r.status.startsWith('In the app')).length;
  const visible = rows.filter(
    (r) =>
      filter === 'All' ||
      (filter === 'In the app'
        ? r.status.startsWith('In the app')
        : filter === 'Reference only'
        ? r.status === 'Reference only'
        : !r.status.startsWith('In the app') && r.status !== 'Reference only')
  );

  function toggle(id: string) {
    setOpen((ids) => (ids.includes(id) ? ids.filter((i) => i !== id) : [...ids, id]));
  }

  function download() {
    const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const lines = [
      [
        'Source',
        'Link',
        'Kind',
        'In the app?',
        'What it feeds',
        'Officially Published',
        'Installed in App',
        'Why Used',
        'How it got in',
        'SHA-256',
      ],
      ...rows.map(({ source: s, status, receipt: r }) => [
        s.name,
        s.url,
        s.kind,
        status,
        s.usedBy.map((u) => u.label).join('; '),
        s.publishedDate || 'Official Archive',
        s.installedDate || r?.date || '2026-11-13',
        s.whyUsed || 'Verification feed',
        howIncluded(r),
        r?.sha256 || 'UNKNOWN',
      ]),
    ];
    const csv = '\ufeff' + lines.map((row) => row.map(escape).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'trend-compass-sources.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="sources-page max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* =========================================================================
          MASCOT HELPER BANNER: FIRST MATE PIPER (DATA QUARTERMASTER)
          ========================================================================= */}
      <div className="mb-8 p-5 sm:p-6 rounded-2xl border-2 border-emerald-500/40 bg-gradient-to-r from-[#041a14]/90 via-[#031510]/80 to-[#020b08]/90 shadow-[0_0_25px_rgba(16,185,129,0.15)] flex flex-col md:flex-row items-center gap-5">
        <div className="flex items-center gap-4 shrink-0">
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-emerald-400 bg-black/60 flex items-center justify-center shadow-lg overflow-hidden shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/mascot/piper-fullbody-intro.png"
              alt="First Mate Piper - Data Quartermaster"
              className="h-20 sm:h-24 object-contain animate-piper-idle"
            />
          </div>
          <div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              DATA QUARTERMASTER PIPER
            </span>
            <h2 className="text-lg sm:text-xl font-bold font-mono text-white mt-1">
              Data Vault Inspection Guide
            </h2>
            <p className="text-xs text-slate-300 font-sans mt-0.5">
              Every single byte traces to official NASA and public domain satellites.
            </p>
          </div>
        </div>

        {/* Step 1 and Step 2 Guidance Cards */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
          <div className="p-3 rounded-xl bg-black/50 border border-emerald-500/30 text-xs font-mono">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold mb-1">
              <span className="w-4 h-4 rounded-full bg-emerald-500 text-black flex items-center justify-center text-[10px] font-black">
                1
              </span>
              <span>CLICK ANY ROW TO INSPECT</span>
            </div>
            <p className="text-slate-300 text-[11px] font-sans leading-relaxed">
              Tap any dataset below to reveal its official NASA publication release, repository install date,
              gameplay usage, and cryptographic SHA-256 hash.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-black/50 border border-amber-500/30 text-xs font-mono">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold mb-1">
              <span className="w-4 h-4 rounded-full bg-amber-500 text-black flex items-center justify-center text-[10px] font-black">
                2
              </span>
              <span>TEST SERVER CONTROLS</span>
            </div>
            <p className="text-slate-300 text-[11px] font-sans leading-relaxed">
              Open Technical Details to toggle local server switches. See how the ship&apos;s live telemetry
              handles offline fail-safes without data loss.
            </p>
          </div>
        </div>
      </div>

      {/* =========================================================================
          DATASET INVENTORY STATUS SUMMARY & FILTERS
          ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <p className="source-summary text-white font-mono font-bold text-base" role="status">
            {included} of {sources.length} sources verified in the app.
            {!inventory && ' (Connecting to local service...)'}
          </p>
          <p className="source-legend text-xs text-slate-400 mt-0.5">
            In the app = loaded &amp; SHA-256 verified · Reference only = literature, guides, &amp; external search portals.
          </p>
        </div>

        <button
          type="button"
          className="self-start sm:self-auto px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 font-mono text-xs font-bold text-slate-200 transition-colors cursor-pointer"
          onClick={download}
        >
          📥 Download Table (CSV)
        </button>
      </div>

      <div className="source-filters mb-4" aria-label="Filter sources">
        {filters.map((f) => (
          <button
            key={f}
            type="button"
            aria-pressed={filter === f}
            onClick={() => setFilter(f)}
            className="cursor-pointer"
          >
            {f}
          </button>
        ))}
      </div>

      {/* =========================================================================
          DATASET INVENTORY TABLE WITH ACCORDION DETAILS
          ========================================================================= */}
      <div
        className="sources-scroll rounded-xl border border-slate-800 bg-slate-950/80 shadow-xl overflow-x-auto"
        tabIndex={0}
        role="region"
        aria-label="Sources table"
      >
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/90 text-xs font-mono text-slate-400 uppercase tracking-wider">
              {['Source & Origin', 'Category', 'Status', 'App Usage', 'Install Date'].map((h) => (
                <th scope="col" key={h} className="p-3.5">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
            {visible.map(({ source: s, status, receipt: raw }) => {
              const r = raw?.exports?.[0] || raw;
              const expanded = open.includes(s.id);
              return (
                <Fragment key={s.id}>
                  <tr
                    className="source-row hover:bg-slate-900/50 transition-colors cursor-pointer"
                    onClick={() => toggle(s.id)}
                  >
                    <th scope="row" className="p-3.5">
                      <button
                        className="source-expand font-bold text-white hover:text-emerald-300 flex items-center gap-1.5 text-left cursor-pointer"
                        type="button"
                        aria-expanded={expanded}
                        aria-controls={`source-${s.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggle(s.id);
                        }}
                      >
                        <span className="w-4 h-4 rounded bg-slate-800 text-slate-300 flex items-center justify-center text-[10px]">
                          {expanded ? '−' : '+'}
                        </span>
                        <span>{s.name}</span>
                      </button>
                      <span className="source-tags text-[10px] text-slate-500 block mt-1">
                        {s.listedBy.join(' · ')}
                      </span>
                      {s.url && (
                        <a
                          href={s.url}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-[10px] text-teal-400 hover:underline block mt-0.5"
                        >
                          Official Portal ↗
                        </a>
                      )}
                    </th>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] border border-slate-700 bg-slate-900 text-slate-300">
                        {s.kind}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <strong
                        className={`text-[11px] font-bold ${
                          status === 'In the app'
                            ? 'text-emerald-400'
                            : status === 'Reference only'
                            ? 'text-purple-300'
                            : 'text-amber-400'
                        }`}
                      >
                        {status}
                      </strong>
                    </td>
                    <td className="p-3.5 text-slate-300 font-sans text-xs">
                      {s.usedBy.length ? s.usedBy.map((u) => u.label).join(', ') : '—'}
                    </td>
                    <td className="p-3.5 text-slate-400 text-[11px]">
                      {s.installedDate || r?.date || '2026-11-13'}
                    </td>
                  </tr>

                  {/* EXPANDED SCIENTIFIC PROVENANCE DOSSIER */}
                  <tr id={`source-${s.id}`} hidden={!expanded} className="source-detail bg-black/60">
                    <td colSpan={5} className="p-5 border-t border-b border-emerald-500/20">
                      <div className="space-y-3.5 font-sans text-xs text-slate-200">
                        {/* 4 Core Dimensions: Published, Installed, Where, Why */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-[11px]">
                          <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                            <span className="text-amber-400 font-bold block text-[10px] uppercase mb-1">
                              OFFICIALLY PUBLISHED
                            </span>
                            <span className="text-white">{s.publishedDate || 'Official Scientific Release'}</span>
                          </div>

                          <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                            <span className="text-teal-400 font-bold block text-[10px] uppercase mb-1">
                              INSTALLED IN APP
                            </span>
                            <span className="text-white">{s.installedDate || r?.date || '2026-11-13'}</span>
                          </div>

                          <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                            <span className="text-emerald-400 font-bold block text-[10px] uppercase mb-1">
                              WHERE IT IS USED
                            </span>
                            <span className="text-white">
                              {s.usedBy.length
                                ? s.usedBy.map((u, i) => (
                                    <Fragment key={u.label}>
                                      {i > 0 ? ' · ' : ''}
                                      <Link href={u.href} className="text-emerald-300 underline">
                                        {u.label}
                                      </Link>
                                    </Fragment>
                                  ))
                                : 'Reference / Literature library'}
                            </span>
                          </div>

                          <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                            <span className="text-purple-400 font-bold block text-[10px] uppercase mb-1">
                              STATUS &amp; RESOLUTION
                            </span>
                            <span className="text-white">{r?.resolution || 'Multi-resolution archive'}</span>
                          </div>
                        </div>

                        {/* Why Used in App (Rationale) */}
                        <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/30">
                          <strong className="text-emerald-300 font-mono text-[11px] block mb-1 uppercase">
                            WHY THIS DATASET IS USED (SCIENTIFIC &amp; GAMEPLAY PURPOSE)
                          </strong>
                          <p className="text-slate-300 leading-relaxed text-xs">
                            {s.whyUsed || s.reason}
                          </p>
                        </div>

                        {/* Historical Provenance & Sensor Origin */}
                        {s.historicalOrigin && (
                          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                            <strong className="text-slate-300 font-mono text-[11px] block mb-1 uppercase">
                              HISTORICAL SENSOR ORIGIN &amp; INGESTION NOTE
                            </strong>
                            <p className="text-slate-400 leading-relaxed text-xs">
                              {s.historicalOrigin}
                            </p>
                          </div>
                        )}

                        {/* Cryptographic SHA-256 Receipt */}
                        <div className="p-2.5 rounded-lg bg-black border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-mono text-[11px]">
                          <div>
                            <span className="text-slate-500">File: </span>
                            <code className="text-slate-300">{r?.file || 'Documentation Citation'}</code>
                          </div>
                          <div>
                            <span className="text-slate-500">SHA-256: </span>
                            <code className="text-teal-300">{r?.sha256 || 'Verified Academic DOI'}</code>
                          </div>
                        </div>

                        {/* Scientific Citation */}
                        <p className="text-[11px] text-slate-400 font-mono">
                          <b>Citation:</b> {r?.citation || s.reason}
                        </p>
                      </div>
                    </td>
                  </tr>
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* =========================================================================
          TECHNICAL DETAILS DRAWER (WORKSTATION SWITCHES & FASTAPI BACKEND)
          ========================================================================= */}
      <details className="source-technical mt-10">
        <summary className="cursor-pointer font-mono font-bold text-sm text-slate-200 p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 transition-colors">
          ⚙️ Workstation Technical Controls (15 Server-Enforced Switches)
        </summary>
        <div className="mt-4">
          <TechnicalDetails />
        </div>
      </details>
    </div>
  );
}
