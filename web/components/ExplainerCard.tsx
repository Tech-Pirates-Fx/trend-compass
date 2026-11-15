import React from "react";
import { BookOpen, Activity, Compass, ShieldCheck } from "lucide-react";

export function ExplainerCard() {
  return (
    <div className="bg-gradient-to-br from-slate-50 to-blue-50/40 dark:from-slate-900 dark:to-blue-950/20 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 rounded-lg bg-blue-600 text-white">
          <BookOpen className="w-4 h-4" />
        </div>
        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
          What Do These Numbers Mean? A Student Guide
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
            <Compass className="w-4 h-4 text-blue-600" />
            Rate of Change (Theil-Sen Slope)
          </div>
          <p className="leading-relaxed">
            The estimated speed and direction of the change, expressed per decade and per year. We compute this using <strong>Sen&apos;s slope</strong>, which calculates the median slope between all pairs of observation points. Unlike ordinary averages, it isn&apos;t easily fooled by extreme weather outliers or satellite blips.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
            <Activity className="w-4 h-4 text-emerald-600" />
            p-value & Statistical Significance
          </div>
          <p className="leading-relaxed">
            The probability that this trend could have happened purely by random chance or natural climate wiggles. If the <strong>p-value is below 0.05 (5%)</strong>, scientists conclude the trend is statistically significant and unlikely to be random noise.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
            <ShieldCheck className="w-4 h-4 text-purple-600" />
            95% Confidence Interval (CI)
          </div>
          <p className="leading-relaxed">
            A realistic range for the true rate of change. If the 95% confidence interval spans across zero (e.g. from -0.10 to +0.25), the data cannot definitively rule out that the variable is remaining unchanged or fluctuating naturally.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
            <Activity className="w-4 h-4 text-amber-600" />
            Autocorrelation & Hamed-Rao Mann-Kendall
          </div>
          <p className="leading-relaxed">
            Weather on Tuesday is usually similar to weather on Monday—this &ldquo;memory&rdquo; in environmental data is called <strong>serial autocorrelation</strong>. Standard regression (OLS) often mistakes autocorrelation for a real trend. The Hamed-Rao test corrects for this memory effect so we don&apos;t report false alarms.
          </p>
        </div>
      </div>
    </div>
  );
}

