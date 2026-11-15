import React from "react";
import { TrendingUp, TrendingDown, Minus, HelpCircle } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  subvalue?: string;
  badge?: string;
  badgeColor?: "green" | "red" | "amber" | "blue" | "slate";
  iconType?: "up" | "down" | "flat" | "info";
  tooltip?: string;
}

export function StatCard({
  label,
  value,
  subvalue,
  badge,
  badgeColor = "blue",
  iconType,
  tooltip,
}: StatCardProps) {
  const badgeStyles = {
    green: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
    red: "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800",
    amber: "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800",
    blue: "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
    slate: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700",
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          {label}
          {tooltip && (
            <span title={tooltip} className="cursor-help text-slate-400 hover:text-slate-600">
              <HelpCircle className="w-3.5 h-3.5" />
            </span>
          )}
        </span>
        {badge && (
          <span
            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${badgeStyles[badgeColor]}`}
          >
            {badge}
          </span>
        )}
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          {value}
        </span>
        {iconType === "up" && <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
        {iconType === "down" && <TrendingDown className="w-5 h-5 text-rose-600 dark:text-rose-400" />}
        {iconType === "flat" && <Minus className="w-5 h-5 text-slate-400" />}
      </div>

      {subvalue && (
        <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
          {subvalue}
        </p>
      )}
    </div>
  );
}

