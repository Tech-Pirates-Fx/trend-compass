"use client";

import React, { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { TimeSeriesPoint } from "../lib/types";

// Dynamically import react-plotly.js to prevent SSR window reference errors
const Plot = dynamic(() => import("react-plotly.js"), {
  ssr: false,
  loading: () => (
    <div className="h-[420px] w-full flex items-center justify-center bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 animate-pulse text-slate-400 text-sm">
      Loading interactive visualization engine...
    </div>
  ),
});

interface TimeSeriesChartProps {
  rawSeries: TimeSeriesPoint[];
  deseasonalizedSeries?: TimeSeriesPoint[] | null;
  trendLine: TimeSeriesPoint[];
  units: string;
  variableName: string;
}

export function TimeSeriesChart({
  rawSeries,
  deseasonalizedSeries,
  trendLine,
  units,
  variableName,
}: TimeSeriesChartProps) {
  const [foreground, setForeground] = useState("#a0b6bc");
  useEffect(() => { const update = () => setForeground(getComputedStyle(document.documentElement).getPropertyValue("--foreground").trim()); update(); const observer = new MutationObserver(update); observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] }); return () => observer.disconnect(); }, []);
  const plotData = useMemo(() => {
        const traces: any[] = [];

    // 1. Raw Observations
    traces.push({
      x: rawSeries.map((p) => p.t),
      y: rawSeries.map((p) => p.value),
      type: "scatter",
      mode: "lines+markers",
      name: "Observed Data",
      line: { color: "rgba(100, 116, 139, 0.45)", width: 1.5 },
      marker: { size: 3.5, color: "rgba(100, 116, 139, 0.6)" },
      hovertemplate: `<b>Observed:</b> %{y:.2f} ${units}<br><i>Date:</i> %{x}<extra></extra>`,
    });

    // 2. Deseasonalized Series (if provided)
    if (deseasonalizedSeries && deseasonalizedSeries.length > 0) {
      traces.push({
        x: deseasonalizedSeries.map((p) => p.t),
        y: deseasonalizedSeries.map((p) => p.value),
        type: "scatter",
        mode: "lines",
        name: "Deseasonalized (STL)",
        line: { color: "#2563eb", width: 2.2 },
        hovertemplate: `<b>Deseasonalized:</b> %{y:.2f} ${units}<br><i>Date:</i> %{x}<extra></extra>`,
      });
    }

    // 3. Fitted Trend Line (Theil-Sen)
    if (trendLine && trendLine.length > 0) {
      // Color trend line based on direction
      const firstVal = trendLine[0]?.value ?? 0;
      const lastVal = trendLine[trendLine.length - 1]?.value ?? 0;
      const isUp = lastVal >= firstVal;
      const trendColor = isUp ? "#dc2626" : "#0284c7"; // Red for warming/increase, Blue for cooling/decrease

      traces.push({
        x: trendLine.map((p) => p.t),
        y: trendLine.map((p) => p.value),
        type: "scatter",
        mode: "lines",
        name: "Fitted Trend (Theil-Sen)",
        line: { color: trendColor, width: 3.2, dash: "solid" },
        hovertemplate: `<b>Trend Fit:</b> %{y:.2f} ${units}<br><i>Date:</i> %{x}<extra></extra>`,
      });
    }

    return traces;
  }, [rawSeries, deseasonalizedSeries, trendLine, units]);

    const layout: Record<string, any> = {
    autosize: true,
    height: 440,
    margin: { l: 55, r: 25, t: 30, b: 45 },
    hovermode: "x unified",
    paper_bgcolor: "transparent",
    plot_bgcolor: "transparent",
    font: {
      family: "system-ui, -apple-system, sans-serif",
      color: foreground,
    },
    legend: {
      orientation: "h",
      yanchor: "bottom",
      y: 1.02,
      xanchor: "right",
      x: 1,
      font: { size: 12 },
    },
    xaxis: {
      type: "date",
      showgrid: true,
      gridcolor: "rgba(150, 150, 150, 0.15)",
      zeroline: false,
    },
    yaxis: {
      title: { text: `${variableName} (${units})`, font: { size: 12 } },
      showgrid: true,
      gridcolor: "rgba(150, 150, 150, 0.15)",
      zeroline: false,
    },
  };

    const config: Record<string, any> = {
    responsive: true,
    displayModeBar: true,
    displaylogo: false,
    modeBarButtonsToRemove: ["lasso2d", "select2d"],
  };

  return (
    <div className="w-full glass-card p-4 sm:p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Time Series & Trend Trajectory
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Observations and fitted trend returned by the analysis service
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            <span className="w-2.5 h-0.5 bg-slate-400"></span> Raw
          </span>
          {deseasonalizedSeries && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300">
              <span className="w-2.5 h-0.5 bg-blue-600"></span> STL Deseasonalized
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-300">
            <span className="w-2.5 h-0.5 bg-red-600"></span> Trend Line
          </span>
        </div>
      </div>

      <div className="w-full overflow-hidden">
        <Plot data={plotData} layout={layout} config={config} style={{ width: "100%" }} />
      </div>
    </div>
  );
}
