"use client";

import React, { useEffect, useState } from "react";
import { AlertTriangle, Database } from "lucide-react";
import { checkHealth } from "../lib/api";

interface MockBannerProps {
  isMock?: boolean;
  adapter?: string;
  sourceText?: string;
}

export function MockBanner({ isMock: propIsMock, adapter: propAdapter, sourceText }: MockBannerProps) {
  const [isMock, setIsMock] = useState<boolean | null>(
    typeof propIsMock === "boolean" ? propIsMock : null
  );
  const [adapter, setAdapter] = useState<string | null>(propAdapter || null);

  useEffect(() => {
    if (typeof propIsMock === "boolean") {
      setIsMock(propIsMock);
      return;
    }

    let isMounted = true;
    checkHealth()
      .then((res) => {
        if (isMounted) {
          setIsMock(res.is_mock);
          setAdapter(res.adapter);
        }
      })
      .catch(() => {
        // If API fails to respond, keep default false or fallback to null
        if (isMounted) {
          setIsMock(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [propIsMock]);

  // When data is real, do not display the mock banner
  if (isMock === false || isMock === null) {
    if (sourceText && !isMock) {
      return (
        <aside
          aria-label="Dataset source notice"
          className="bg-emerald-500/10 border-b border-emerald-500/20 text-emerald-900 dark:text-emerald-200 px-4 py-1.5 text-xs font-medium"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Source: <strong className="font-semibold">{sourceText}</strong>
            </span>
          </div>
        </aside>
      );
    }
    return null;
  }

  return (
    <aside
      aria-label="Simulation notice"
      className="bg-amber-500/10 border-b border-amber-500/30 text-amber-900 dark:text-amber-200 px-4 py-2 text-xs sm:text-sm font-medium transition-colors"
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span>
            <strong>Phase 2 Simulation: showing MOCK data, not real NASA measurements.</strong>
            <span className="hidden md:inline text-amber-700/80 dark:text-amber-300/80 ml-1">
              Deterministic synthetic series validate statistical detection algorithms ahead of confirmed Earthdata endpoints.
            </span>
          </span>
        </div>
        <span className="inline-flex items-center gap-1 text-[11px] bg-amber-500/20 px-2 py-0.5 rounded font-mono">
          <Database className="w-3 h-3" />
          Adapter: {adapter || "mock"}
          {sourceText && ` • ${sourceText}`}
        </span>
      </div>
    </aside>
  );
}
