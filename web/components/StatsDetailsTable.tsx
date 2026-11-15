"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, AlertTriangle, CheckCircle2, XCircle, Info } from "lucide-react";
import { Diagnostics, TrendMethodResult } from "../lib/types";

interface StatsDetailsTableProps {
  methods: Record<string, TrendMethodResult>;
  diagnostics: Diagnostics;
  units: string;
}

export function StatsDetailsTable({
  methods,
  diagnostics,
  units,
}: StatsDetailsTableProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const methodList = Object.values(methods);

  return (
    <div className="glass-card p-5 sm:p-6 shadow-sm">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left group"
      >
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Technical Rigor
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">
              {methodList.length} Methods Evaluated
            </span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            Show Me the Statistics
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Side-by-side comparison of parametric, non-parametric, and autocorrelation-corrected tests
          </p>
        </div>
        <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-blue-50 dark:group-hover:bg-blue-950 group-hover:text-blue-600 transition-colors">
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </button>

      {isExpanded && (
        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 space-y-6">
          {/* Methods Comparison Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40">
                  <th className="py-3 px-3 font-semibold text-slate-700 dark:text-slate-300">Method</th>
                  <th className="py-3 px-3 font-semibold text-slate-700 dark:text-slate-300">Rate / Decade</th>
                  <th className="py-3 px-3 font-semibold text-slate-700 dark:text-slate-300">Rate / Year</th>
                  <th className="py-3 px-3 font-semibold text-slate-700 dark:text-slate-300">95% Confidence Interval</th>
                  <th className="py-3 px-3 font-semibold text-slate-700 dark:text-slate-300">p-value</th>
                  <th className="py-3 px-3 font-semibold text-slate-700 dark:text-slate-300">Test Statistic</th>
                  <th className="py-3 px-3 font-semibold text-slate-700 dark:text-slate-300">Significance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {methodList.map((m) => {
                  const hasCi = m.ci_lower_decade != null && m.ci_upper_decade != null;
                  return (
                    <tr key={m.method_key} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {m.display_name}
                        </div>
                        {m.notes && (
                          <div className="text-[11px] text-slate-400 mt-0.5 max-w-xs">
                            {m.notes}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-3 font-mono font-bold text-slate-800 dark:text-slate-200">
                        {m.slope_per_decade > 0 ? "+" : ""}
                        {m.slope_per_decade.toFixed(3)} {units}
                      </td>
                      <td className="py-3.5 px-3 font-mono text-slate-600 dark:text-slate-400">
                        {m.slope_per_year > 0 ? "+" : ""}
                        {m.slope_per_year.toFixed(4)} {units}
                      </td>
                      <td className="py-3.5 px-3 font-mono text-slate-600 dark:text-slate-300">
                        {hasCi
                          ? `[${m.ci_lower_decade! > 0 ? "+" : ""}${m.ci_lower_decade!.toFixed(3)}, ${
                              m.ci_upper_decade! > 0 ? "+" : ""
                            }${m.ci_upper_decade!.toFixed(3)}]`
                          : "N/A (rank test)"}
                      </td>
                      <td className="py-3.5 px-3 font-mono">
                        {m.p_value != null ? (
                          <span
                            className={
                              m.p_value < 0.05
                                ? "font-bold text-emerald-600 dark:text-emerald-400"
                                : "text-slate-500"
                            }
                          >
                            {m.p_value < 0.0001 ? "< 0.0001" : m.p_value.toFixed(4)}
                          </span>
                        ) : (
                          "Derived"
                        )}
                      </td>
                      <td className="py-3.5 px-3 font-mono text-slate-500">
                        {m.test_statistic != null ? m.test_statistic.toFixed(2) : "—"}
                      </td>
                      <td className="py-3.5 px-3">
                        {m.is_significant ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                            <CheckCircle2 className="w-3 h-3" /> Significant
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                            <XCircle className="w-3 h-3" /> Not Sig
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Diagnostics and Quality Checks */}
          <div className="bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-blue-600" />
              Time Series Diagnostics & Data Quality
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-3">
              <div className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                  Observations
                </span>
                <span className="font-mono font-bold text-base text-slate-900 dark:text-white">
                  {diagnostics.n_observations}
                </span>
              </div>
              <div className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                  Missing Values
                </span>
                <span className="font-mono font-bold text-base text-slate-900 dark:text-white">
                  {diagnostics.missing_count} ({diagnostics.missing_pct}%)
                </span>
              </div>
              <div className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                  Lag-1 Autocorrelation (r₁)
                </span>
                <span
                  className={`font-mono font-bold text-base ${
                    Math.abs(diagnostics.lag1_autocorrelation) > 0.3
                      ? "text-amber-600 dark:text-amber-400"
                      : "text-slate-900 dark:text-white"
                  }`}
                >
                  {diagnostics.lag1_autocorrelation.toFixed(3)}
                </span>
              </div>
              <div className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                  Recommended Test
                </span>
                <span className="font-semibold text-xs text-blue-600 dark:text-blue-400 block mt-1 truncate">
                  Hamed-Rao Mann-Kendall
                </span>
              </div>
            </div>

            {/* Warnings display */}
            {diagnostics.warnings && diagnostics.warnings.length > 0 && (
              <div className="space-y-1.5 mt-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                {diagnostics.warnings.map((w, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 text-xs text-amber-800 dark:text-amber-300"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span>{w}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
