import type { AnalyzeResponse, BoundingBox } from "../../lib/types";
import type { GameLevel, ExpeditionType, PredictionChoice, HonestOutcome, PresetHotspot } from "./types";

export const HEAT_HOTSPOTS: PresetHotspot[] = [
  { id: "india", name: "India", flag: "🇮🇳", tag: "Tropical Subcontinent", bbox: { south: 8.0, north: 37.0, west: 68.0, east: 97.0 } },
  { id: "australia", name: "Australia", flag: "🇦🇺", tag: "Southern Heatwave Belt", bbox: { south: -43.6, north: -10.0, west: 113.3, east: 153.6 } },
  { id: "kenya", name: "Kenya", flag: "🇰🇪", tag: "Equatorial Rift Valley", bbox: { south: -4.7, north: 5.5, west: 33.9, east: 41.9 } },
  { id: "norway", name: "Norway", flag: "🇳🇴", tag: "Arctic-Atlantic Margin", bbox: { south: 57.9, north: 71.2, west: 4.5, east: 31.1 } },
  { id: "brazil", name: "Brazil", flag: "🇧🇷", tag: "Amazon Basin", bbox: { south: -33.7, north: 5.3, west: -73.9, east: -34.8 } },
  { id: "usa", name: "United States", flag: "🇺🇸", tag: "Continental Mid-Latitudes", bbox: { south: 24.5, north: 49.4, west: -125.0, east: -66.9 } },
  { id: "japan", name: "Japan", flag: "🇯🇵", tag: "NW Pacific Rim", bbox: { south: 24.0, north: 45.5, west: 122.9, east: 153.0 } },
  { id: "weddell", name: "Weddell Sea", flag: "🌊", tag: "Antarctic Polar Deep", bbox: { south: -70.0, north: -60.0, west: -60.0, east: -20.0 } },
];

export const FLOOD_HOTSPOTS: PresetHotspot[] = [
  { id: "ganges", name: "Ganges-Brahmaputra Delta", flag: "🌊", tag: "Monsoon Deluge Center", bbox: { south: 20.0, north: 28.0, west: 86.0, east: 94.0 } },
  { id: "indus", name: "Indus River Basin", flag: "🌊", tag: "Glacial/Monsoon Flood Belt", bbox: { south: 24.0, north: 37.0, west: 67.0, east: 76.0 } },
  { id: "yangtze", name: "Yangtze River Basin", flag: "🌊", tag: "East Asian Summer Monsoon", bbox: { south: 24.0, north: 35.0, west: 90.0, east: 122.0 } },
  { id: "mississippi", name: "Mississippi River Basin", flag: "🌊", tag: "Continental Drainage Surge", bbox: { south: 29.0, north: 50.0, west: -114.0, east: -78.0 } },
  { id: "rhine", name: "Rhine River Basin", flag: "🌊", tag: "European Corridor", bbox: { south: 46.0, north: 52.0, west: 5.0, east: 12.0 } },
  { id: "amazon", name: "Amazon Basin", flag: "🌊", tag: "Tropical Hydrological Engine", bbox: { south: -17.0, north: 5.0, west: -79.0, east: -47.0 } },
];

export const DROUGHT_HOTSPOTS: PresetHotspot[] = [
  { id: "somalia", name: "Horn of Africa", flag: "🌾", tag: "Arid Crisis Arc", bbox: { south: -1.5, north: 12.0, west: 41.0, east: 51.5 } },
  { id: "california", name: "California Basin", flag: "🌾", tag: "Mediterranean Hydro Basin", bbox: { south: 32.5, north: 42.0, west: -124.5, east: -114.0 } },
  { id: "sahel", name: "Sahel Belt", flag: "🌾", tag: "Semi-Arid Transition", bbox: { south: 12.0, north: 18.0, west: -16.0, east: 25.0 } },
  { id: "aral", name: "Aral Basin", flag: "🌾", tag: "Continental Desiccation", bbox: { south: 38.0, north: 46.0, west: 56.0, east: 65.0 } },
  { id: "murray", name: "Murray-Darling Basin", flag: "🌾", tag: "Australian Agrarian Basin", bbox: { south: -37.5, north: -24.5, west: 138.5, east: 151.5 } },
];

export const CANOPY_HOTSPOTS: PresetHotspot[] = [
  { id: "matogrosso", name: "Mato Grosso", flag: "🌱", tag: "Agroforestry Frontier", bbox: { south: -18.0, north: -7.5, west: -61.5, east: -50.0 } },
  { id: "cornbelt", name: "US Corn Belt", flag: "🌽", tag: "Temperate Grain Expanse", bbox: { south: 37.0, north: 44.0, west: -96.5, east: -84.0 } },
  { id: "punjab", name: "Punjab Plain", flag: "🌾", tag: "Intensive Irrigation Belt", bbox: { south: 29.5, north: 32.5, west: 73.5, east: 77.0 } },
  { id: "ukraine", name: "Ukrainian Steppe", flag: "🌻", tag: "Black Soil Breadbasket", bbox: { south: 45.0, north: 50.0, west: 29.0, east: 38.0 } },
];

export const OCEAN_HOTSPOTS: PresetHotspot[] = [
  { id: "gulfstream", name: "North Atlantic Drift", flag: "🌊", tag: "AMOC Conveyor Gateway", bbox: { south: 30.0, north: 45.0, west: -75.0, east: -50.0 } },
  { id: "humboldt", name: "Humboldt Current", flag: "🌊", tag: "ENSO Upwelling Corridor", bbox: { south: -20.0, north: -5.0, west: -85.0, east: -75.0 } },
  { id: "kuroshio", name: "Kuroshio Extension", flag: "🌊", tag: "Western Pacific Boundary", bbox: { south: 28.0, north: 40.0, west: 135.0, east: 155.0 } },
  { id: "agulhas", name: "Agulhas Retroflection", flag: "🌊", tag: "Indian-Atlantic Chokepoint", bbox: { south: -42.0, north: -32.0, west: 15.0, east: 30.0 } },
];

export class DiscoveryManager {
  public static evaluateOutcome(
    rawPrediction: PredictionChoice,
    data: AnalyzeResponse,
    expedition: ExpeditionType
  ): HonestOutcome {
    const isSig = data.summary.verdict === "significant";
    const rate = data.summary.rate_per_decade;
    const isFlood = expedition === "flood" || expedition === "drought";

    const prediction = rawPrediction === "yes" ? "rising" : rawPrediction === "no" ? "no_significant" : rawPrediction;

    if (isFlood) {
      const isWetter = rate > 0;
      const isDrier = rate < 0;

      if (prediction === "rising" && isSig && isWetter) {
        return {
          badgeName: "Storm Radar Ace",
          badgeIcon: "⛈️",
          points: 50,
          title: "Precipitation Surge Verified",
          commentary: `Outstanding deduction, Navigator! You predicted WETTER (RISING), and NASA GPCP v2.3 radar confirmed a statistically significant rainfall surge of +${rate.toFixed(2)} mm/day per decade.`,
          verdictState: "win",
          verdictBanner: "🏆 YOU WON! HYPOTHESIS CONFIRMED!",
          verdictSubtitle: "Your prediction matched the verified NASA multi-satellite precipitation surge.",
        };
      }
      if (prediction === "falling" && isSig && isDrier) {
        return {
          badgeName: "Drying Trend Detective",
          badgeIcon: "📉",
          points: 50,
          title: "Precipitation Decline Verified",
          commentary: `Sharp deduction! You predicted DRIER (FALLING), and NASA's multi-satellite record confirmed a statistically significant drying trend of ${rate.toFixed(2)} mm/day per decade.`,
          verdictState: "win",
          verdictBanner: "🏆 YOU WON! HYPOTHESIS CONFIRMED!",
          verdictSubtitle: "Your prediction matched the empirical multi-satellite drying trend.",
        };
      }
      if (prediction === "no_significant" && !isSig) {
        return {
          badgeName: "Monsoon Hydrologist",
          badgeIcon: "🌊",
          points: 60,
          title: "Natural Monsoonal Variability",
          commentary: `Elite scientific discernment! You anticipated natural seasonal fluctuations without a statistically detectable 20-year drift (p ≥ 0.05). Recognizing the absence of trend is true science!`,
          verdictState: "win",
          verdictBanner: "🏆 YOU WON! SHARP DISCRIMINATION!",
          verdictSubtitle: "You correctly anticipated natural variability without an artificial trend.",
        };
      }
      if (prediction === "unsure" && !isSig) {
        return {
          badgeName: "Prudent Hydrologist",
          badgeIcon: "⚖️",
          points: 50,
          title: "Honest Uncertainty Respected",
          commentary: `A true scientist's instinct! When data exhibits variable interannual swings, withholding premature claims is the most rigorous approach. NASA's observations confirmed natural variability.`,
          verdictState: "prudent",
          verdictBanner: "⚖️ SCIENTIFIC INTEGRITY! TRUTH PRESERVED!",
          verdictSubtitle: "You withheld bias on noisy data; NASA observations confirmed natural variability.",
        };
      }
      if (prediction === "unsure" && isSig) {
        return {
          badgeName: "Evidence Explorer",
          badgeIcon: "🧭",
          points: 35,
          title: "Evidence-Led Discovery",
          commentary: `You let NASA observations lead the way! The multi-satellite record revealed a verified trend of ${rate > 0 ? "+" : ""}${rate.toFixed(2)} mm/day per decade.`,
          verdictState: "close_call",
          verdictBanner: "⚡ YOU TRIED CLOSELY! EVIDENCE UNLOCKED!",
          verdictSubtitle: "You let the satellite record guide you to the verified rainfall signal.",
        };
      }
      return {
        badgeName: "Honest Observer",
        badgeIcon: "🔭",
        points: 25,
        title: "Truth Over Presumption",
        commentary: `Your prior hunch differed from the record, but in science, discovering where observations disagree with intuition is how real knowledge advances! NASA sensors measured ${rate > 0 ? "+" : ""}${rate.toFixed(2)} mm/day per decade.`,
        verdictState: "close_call",
        verdictBanner: "⚡ YOU TRIED CLOSELY! VALUABLE DISCOVERY!",
        verdictSubtitle: "Intuition differed from observations — disproving a hunch is how science makes breakthroughs!",
      };
    }

    // Heat / Ocean / Canopy Expeditions
    const isWarming = rate > 0;
    const isCooling = rate < 0;

    if (prediction === "rising" && isSig && isWarming) {
      return {
        badgeName: "Keen Navigator",
        badgeIcon: "🏅",
        points: 50,
        title: "Warming Trend Verified",
        commentary: `Spot on, Navigator! You predicted RISING, and NASA's instruments confirmed a statistically significant warming rate of +${rate.toFixed(2)} °C/decade.`,
        verdictState: "win",
        verdictBanner: "🏆 YOU WON! HYPOTHESIS CONFIRMED!",
        verdictSubtitle: "Your prediction was empirically validated by NASA GISTEMP thermal sensors.",
      };
    }
    if (prediction === "falling" && isSig && isCooling) {
      return {
        badgeName: "Cooling Detective",
        badgeIcon: "❄️",
        points: 50,
        title: "Cooling Trend Verified",
        commentary: `Sharp eyes! You predicted FALLING, and NASA's data confirmed a statistically significant downward rate of ${rate.toFixed(2)} °C/decade.`,
        verdictState: "win",
        verdictBanner: "🏆 YOU WON! HYPOTHESIS CONFIRMED!",
        verdictSubtitle: "Your prediction matched the verified downward temperature trend.",
      };
    }
    if (prediction === "no_significant" && !isSig) {
      return {
        badgeName: "Careful Scientist",
        badgeIcon: "🔬",
        points: 60,
        title: "Natural Variability Identified",
        commentary: `Outstanding scientific discernment! You anticipated no statistically significant trend, and the data showed natural fluctuations with no detectable long-term drift (p ≥ 0.05). Recognizing the absence of evidence is elite science!`,
        verdictState: "win",
        verdictBanner: "🏆 YOU WON! ACCURATE DISCERNMENT!",
        verdictSubtitle: "You correctly rejected false-positive warming where observations show natural variability.",
      };
    }
    if (prediction === "unsure" && !isSig) {
      return {
        badgeName: "Prudent Skeptic",
        badgeIcon: "⚖️",
        points: 50,
        title: "Honest Uncertainty Respected",
        commentary: `A true scientist's instinct! When data is fluctuating, withholding premature judgment is the most honest approach. NASA's observations confirmed natural variability.`,
        verdictState: "prudent",
        verdictBanner: "⚖️ SCIENTIFIC INTEGRITY! TRUTH PRESERVED!",
        verdictSubtitle: "Withholding assumptions on ambiguous telemetry is the hallmark of honest science.",
      };
    }
    if (prediction === "unsure" && isSig) {
      return {
        badgeName: "Curious Explorer",
        badgeIcon: "🧭",
        points: 35,
        title: "Evidence-Led Discovery",
        commentary: `You let the observations speak for themselves! NASA's sensors revealed a verified rate of ${rate > 0 ? "+" : ""}${rate.toFixed(2)} °C/decade.`,
        verdictState: "close_call",
        verdictBanner: "⚡ YOU TRIED CLOSELY! EVIDENCE UNLOCKED!",
        verdictSubtitle: "The satellite data revealed the true climate trajectory for your investigation.",
      };
    }
    return {
      badgeName: "Honest Observer",
      badgeIcon: "🔭",
      points: 25,
      title: "Truth Over Presumption",
      commentary: `Intuition met the empirical record! NASA's instruments revealed ${rate > 0 ? "+" : ""}${rate.toFixed(2)} °C/decade across this region.`,
      verdictState: "close_call",
      verdictBanner: "⚡ YOU TRIED CLOSELY! VALUABLE DISCOVERY!",
      verdictSubtitle: "Intuition met reality — learning where data refutes presumption is real scientific discovery!",
    };
  }

  public static downloadCsv(data: AnalyzeResponse): void {
    this.exportCsv(data);
  }

  public static exportCsv(data: AnalyzeResponse): void {
    if (!data) return;
    const escape = (v: unknown) => `"${String(v ?? "").replaceAll('"', '""')}"`;
    const rows = [
      ["date", "observed", "deseasonalized", "trend", "units", "source", "is_mock"],
      ...data.raw_timeseries.map((p, i) => [
        p.t,
        p.value,
        data.deseasonalized_timeseries?.[i]?.value ?? "",
        data.trend_line[i]?.value ?? "",
        data.units,
        data.source,
        data.is_mock,
      ]),
    ];
    const blob = new Blob([rows.map((row) => row.map(escape).join(",")).join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `trend-compass-${data.variable.id}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  public static exportJson(data: AnalyzeResponse, expedition: string, targetName: string): void {
    if (!data) return;
    const payload = {
      project: "Trend Compass - NASA Earth System Crisis Expeditions",
      expedition,
      targetName,
      variable: data.variable,
      units: data.units,
      source: data.source,
      summary: data.summary,
      diagnostics: data.diagnostics,
      observations: data.raw_timeseries.length,
      provenance: data.provenance,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `trend-compass-research-${expedition}-${targetName.toLowerCase().replace(/\s+/g, "_")}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
