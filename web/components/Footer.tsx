import Link from "next/link";
import { Compass } from "lucide-react";

export function Footer() {
  return (
    <footer className="voyage-footer border-t border-[var(--line)] bg-[#040e17]/95 py-8 text-xs text-[var(--muted)]">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-full border border-amber-400/50 bg-black/40 flex items-center justify-center text-amber-300">
            <Compass size={16} />
          </span>
          <div>
            <p className="font-semibold text-white tracking-tight">Trend Compass · Star Galleon</p>
            <p className="text-[11px] text-slate-400">
              NASA Space Apps Challenge 2026: &ldquo;Be An Earth System Trend Detective!&rdquo;
            </p>
          </div>
        </div>

        {/* Primary Destination Links */}
        <nav aria-label="Footer Navigation" className="flex flex-wrap items-center gap-6 font-mono text-[11px]">
          <Link href="/" className="hover:text-emerald-400 transition-colors">
            🕹️ Play Missions
          </Link>
          <Link href="/about" className="hover:text-emerald-400 transition-colors">
            👥 Crew &amp; About Us
          </Link>
          <Link href="/data" className="hover:text-emerald-400 transition-colors">
            🛡️ Data Vault (19 Feeds)
          </Link>
        </nav>

        <p className="text-[11px] text-slate-500 font-mono">
          Made with authentic NASA GISS GISTEMP v4 NetCDF observations.
        </p>
      </div>
    </footer>
  );
}
