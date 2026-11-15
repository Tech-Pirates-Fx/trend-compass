import React from "react";
import { CheckCircle2, XCircle, AlertCircle, HelpCircle } from "lucide-react";
import { SummaryVerdict as SummaryVerdictType } from "../lib/types";

interface SummaryVerdictProps {
  summary: SummaryVerdictType;
  variableName: string;
}

export function SummaryVerdict({ summary, variableName }: SummaryVerdictProps) {
  const isSig = summary.verdict === "significant";
  const isInconclusive = summary.verdict === "inconclusive";

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Statistical Verdict
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">
            Is {variableName} Experiencing a Real Trend?
          </h2>
        </div>

        {/* Big Verdict Badge */}
        <div
          className={`inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-sm sm:text-base font-bold shadow-sm ${
            isSig
              ? "bg-emerald-50 dark:bg-emerald-950/70 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300"
              : isInconclusive
              ? "bg-amber-50 dark:bg-amber-950/70 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300"
              : "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200"
          }`}
        >
          {isSig ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          ) : isInconclusive ? (
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
          ) : (
            <XCircle className="w-5 h-5 text-slate-500 dark:text-slate-400 shrink-0" />
          )}
          <span>
            {isSig
              ? "Statistically Significant Trend"
              : isInconclusive
              ? "Inconclusive Trend"
              : "Not Statistically Significant"}
          </span>
        </div>
      </div>

      {/* Plain Language Summary Box */}
      <div className="mt-6 p-5 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/60 text-slate-800 dark:text-slate-200">
        <div className="flex items-start gap-3">
          <div className="p-1.5 rounded-lg bg-blue-600 text-white shrink-0 mt-0.5">
            <HelpCircle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-900 dark:text-blue-300">
              Plain-Language Finding
            </h3>
            <p className="mt-1 text-sm sm:text-base leading-relaxed font-normal">
              {summary.plain_language}
            </p>
          </div>
        </div>
      </div>

      {/* Method Disagreement Warning Box */}
      {summary.agreement_notes && (
        <div className="mt-4 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-sm">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold">Notice on Statistical Disagreement:</strong>
              <p className="mt-0.5 text-xs sm:text-sm leading-relaxed text-amber-800 dark:text-amber-300">
                {summary.agreement_notes}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

