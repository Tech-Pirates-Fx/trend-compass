"use client";

import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { CosmicBackdrop } from "./CosmicBackdrop";
import { setupGlobalAutoplay } from "../lib/background-music";
import { UniversalPiperCompanion } from "./UniversalPiperCompanion";
import { PlayerDossierModal } from "./PlayerDossierModal";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() || "/";
  const isVoyage = pathname === "/voyage";
  const isGameMode = pathname === "/" || pathname === "/play";
  const [isDossierOpen, setIsDossierOpen] = useState(false);

  useEffect(() => {
    if (!isVoyage) setupGlobalAutoplay();
  }, [isVoyage]);

  if (isVoyage) return <main id="main-content" className="fixed inset-0 overflow-hidden">{children}</main>;

  if (isGameMode) {
    return (
      <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#02060c] relative select-none">
        {/* Dynamic Thematic Space Sky & Planetary Horizon Backdrop */}
        <CosmicBackdrop />
        <main
          id="main-content"
          tabIndex={-1}
          className="w-full h-full overflow-hidden relative z-10"
        >
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#02060c] text-[var(--foreground)] relative">
      <CosmicBackdrop />
      <Navbar />
      <main id="main-content" tabIndex={-1} className="flex-1 relative z-10">
        {children}
      </main>
      <Footer />
      <UniversalPiperCompanion onOpenDossier={() => setIsDossierOpen(true)} />
      <PlayerDossierModal isOpen={isDossierOpen} onClose={() => setIsDossierOpen(false)} />
    </div>
  );
}
