"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { GameEngine } from "../components/game/GameEngine";
import type { GameLevel } from "../components/game/types";

function GameEngineWithParams() {
  const searchParams = useSearchParams();
  const lvlParam = searchParams?.get("level") || searchParams?.get("step");

  const parsed = Number(lvlParam);
  const initialLevel = parsed >= 0 && parsed <= 6 && Number.isInteger(parsed) ? (parsed as GameLevel) : 0;
  return <GameEngine key={initialLevel} initialLevel={initialLevel} />;
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="w-screen h-screen flex flex-col items-center justify-center bg-black text-teal-400 font-mono text-xs gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-teal-400 border-t-transparent animate-spin" />
          <span className="tracking-widest uppercase">Initializing Star Galleon Engine…</span>
        </div>
      }
    >
      <GameEngineWithParams />
    </Suspense>
  );
}
