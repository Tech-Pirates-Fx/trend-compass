/**
 * PlayerStatsManager - Persistent Local User Career Record & Space Telemetry Engine
 * Tracks mission completions, scientific accuracy, EXP, Detective Ranks, and NASA badges in localStorage.
 */

export type PlayerBadge = {
  id: string;
  name: string;
  icon: string;
  unlockedAt: string;
  description: string;
};

export type DetectiveRank =
  | "Cadet Observer"
  | "Data Surveyor"
  | "Telemetry Specialist"
  | "Orbital Detective"
  | "Planetary Commander";

export type PlayerCareerStats = {
  totalExp: number;
  rankTitle: DetectiveRank;
  rankLevel: number;
  missionsCompleted: number;
  hypothesesConfirmed: number;
  prudentSkepticCount: number;
  valuableDiscoveries: number;
  scientificAccuracyPct: number;
  hotspotsExplored: string[];
  activeExpeditions: string[];
  totalScansExecuted: number;
  dataPointsAnalyzed: number;
  orbitalVelocityKmS: number;
  satellitesSynced: number;
  badges: PlayerBadge[];
  lastActive: string;
};

const STORAGE_KEY = "trend-compass-player-career-v1";

const DEFAULT_STATS: PlayerCareerStats = {
  totalExp: 220,
  rankTitle: "Data Surveyor",
  rankLevel: 2,
  missionsCompleted: 4,
  hypothesesConfirmed: 3,
  prudentSkepticCount: 1,
  valuableDiscoveries: 0,
  scientificAccuracyPct: 100,
  hotspotsExplored: ["India", "Australia", "Ganges-Brahmaputra Delta"],
  activeExpeditions: ["heat", "flood"],
  totalScansExecuted: 6,
  dataPointsAnalyzed: 14860,
  orbitalVelocityKmS: 7.67,
  satellitesSynced: 19,
  badges: [
    {
      id: "thermal-pioneer",
      name: "Thermal Pioneer",
      icon: "🔥",
      unlockedAt: "2026-11-14",
      description: "Successfully validated first GISTEMP v4 surface temperature anomaly regression.",
    },
    {
      id: "storm-radar-ace",
      name: "Storm Radar Ace",
      icon: "⛈️",
      unlockedAt: "2026-11-15",
      description: "Confirmed multi-satellite precipitation surge with GPCP v2.3 CDR telemetry.",
    },
    {
      id: "prudent-skeptic",
      name: "Prudent Skeptic",
      icon: "⚖️",
      unlockedAt: "2026-11-15",
      description: "Demonstrated scientific integrity by withholding bias on noisy climate records.",
    },
  ],
  lastActive: "2026-11-16",
};

export function computeRank(exp: number): { title: DetectiveRank; level: number } {
  if (exp >= 1000) return { title: "Planetary Commander", level: 5 };
  if (exp >= 500) return { title: "Orbital Detective", level: 4 };
  if (exp >= 250) return { title: "Telemetry Specialist", level: 3 };
  if (exp >= 100) return { title: "Data Surveyor", level: 2 };
  return { title: "Cadet Observer", level: 1 };
}

class PlayerStatsService {
  private static instance: PlayerStatsService;
  private stats: PlayerCareerStats = DEFAULT_STATS;
  private listeners: Set<() => void> = new Set();
  private initialized: boolean = false;

  private constructor() {
    this.init();
  }

  public static getInstance(): PlayerStatsService {
    if (!PlayerStatsService.instance) {
      PlayerStatsService.instance = new PlayerStatsService();
    }
    return PlayerStatsService.instance;
  }

  private init(): void {
    if (typeof window === "undefined" || this.initialized) return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.stats = { ...DEFAULT_STATS, ...parsed };
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_STATS));
      }
    } catch {
      this.stats = { ...DEFAULT_STATS };
    }
    this.initialized = true;
  }

  public getStats(): PlayerCareerStats {
    this.init();
    return this.stats;
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.stats));
      } catch {
        // Storage fail-safe
      }
    }
    this.listeners.forEach((fn) => fn());
  }

  public recordMissionOutcome(
    verdictState: "win" | "close_call" | "prudent",
    points: number,
    expedition: string,
    targetName: string,
    badgeName: string,
    badgeIcon: string,
    observationsCount: number = 252
  ): void {
    this.init();
    const s = this.stats;
    s.missionsCompleted += 1;
    s.totalScansExecuted += 1;
    s.dataPointsAnalyzed += observationsCount;
    s.totalExp += points;

    if (verdictState === "win") s.hypothesesConfirmed += 1;
    else if (verdictState === "prudent") s.prudentSkepticCount += 1;
    else s.valuableDiscoveries += 1;

    // Recalculate accuracy rate
    const successfulDeductions = s.hypothesesConfirmed + s.prudentSkepticCount;
    s.scientificAccuracyPct = Math.round((successfulDeductions / Math.max(1, s.missionsCompleted)) * 100);

    // Update rank
    const { title, level } = computeRank(s.totalExp);
    s.rankTitle = title;
    s.rankLevel = level;

    // Unique hotspots & expeditions
    if (!s.hotspotsExplored.includes(targetName)) {
      s.hotspotsExplored.push(targetName);
    }
    if (!s.activeExpeditions.includes(expedition)) {
      s.activeExpeditions.push(expedition);
    }

    // Add badge if new
    const badgeId = badgeName.toLowerCase().replace(/[^a-z0-9]/g, "-");
    if (!s.badges.some((b) => b.id === badgeId)) {
      s.badges.push({
        id: badgeId,
        name: badgeName,
        icon: badgeIcon,
        unlockedAt: new Date().toISOString().split("T")[0],
        description: `Awarded for rigorous empirical deduction during the ${expedition.toUpperCase()} campaign in ${targetName}.`,
      });
    }

    s.lastActive = new Date().toISOString().split("T")[0];
    this.notify();
  }

  public resetStats(): void {
    this.stats = {
      ...DEFAULT_STATS,
      totalExp: 0,
      rankTitle: "Cadet Observer",
      rankLevel: 1,
      missionsCompleted: 0,
      hypothesesConfirmed: 0,
      prudentSkepticCount: 0,
      valuableDiscoveries: 0,
      scientificAccuracyPct: 100,
      hotspotsExplored: [],
      activeExpeditions: [],
      totalScansExecuted: 0,
      dataPointsAnalyzed: 0,
      badges: [],
      lastActive: new Date().toISOString().split("T")[0],
    };
    this.notify();
  }

  public exportDossier(): void {
    if (typeof window === "undefined") return;
    const json = JSON.stringify(
      {
        dossierTitle: "TREND COMPASS · NASA Earth System Detective Career Dossier",
        commander: "Lead Investigator",
        generatedAt: new Date().toISOString(),
        careerRecord: this.stats,
      },
      null,
      2
    );
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `trend-compass-dossier-${this.stats.rankTitle.toLowerCase().replace(/\s+/g, "-")}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}

export const PlayerStatsManager = PlayerStatsService.getInstance();
