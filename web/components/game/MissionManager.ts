/**
 * MissionManager - Manages active expedition, target regions, and spatial coordinate locks
 */

import type { BoundingBox } from "../../lib/types";
import type { Country } from "../../lib/geography";
import type { ExpeditionType, PresetHotspot } from "./types";
import {
  HEAT_HOTSPOTS,
  FLOOD_HOTSPOTS,
  DROUGHT_HOTSPOTS,
  CANOPY_HOTSPOTS,
  OCEAN_HOTSPOTS,
} from "./DiscoveryManager";

type Listener = () => void;

class MissionState {
  private static instance: MissionState;

  private expedition: ExpeditionType = "heat";
  private targetName: string = "India";
  private targetBBox: BoundingBox = HEAT_HOTSPOTS[0].bbox;
  private selectedCountry: Country | null = null;
  private isTargetLocked: boolean = false;
  private listeners: Set<Listener> = new Set();

  private constructor() {}

  public static getInstance(): MissionState {
    if (!MissionState.instance) {
      MissionState.instance = new MissionState();
    }
    return MissionState.instance;
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach((fn) => fn());
  }

  public getExpedition(): ExpeditionType {
    return this.expedition;
  }

  public setExpedition(type: ExpeditionType): void {
    this.expedition = type;
    const spots = this.getHotspotsFor(type);
    this.targetName = spots[0].name;
    this.targetBBox = spots[0].bbox;
    this.selectedCountry = null;
    this.isTargetLocked = false;
    this.notify();
  }

  public getTargetName(): string {
    return this.targetName;
  }

  public getTargetBBox(): BoundingBox {
    return this.targetBBox;
  }

  public getSelectedCountry(): Country | null {
    return this.selectedCountry;
  }

  public isLocked(): boolean {
    return this.isTargetLocked;
  }

  public setHotspot(spot: PresetHotspot): void {
    this.targetName = spot.name;
    this.targetBBox = spot.bbox;
    this.selectedCountry = null;
    this.isTargetLocked = true;
    this.notify();
  }

  public setCountry(country: Country, bbox: BoundingBox): void {
    this.selectedCountry = country;
    this.targetName = country.properties.name;
    this.targetBBox = bbox;
    this.isTargetLocked = true;
    this.notify();
  }

  public setLock(locked: boolean): void {
    this.isTargetLocked = locked;
    this.notify();
  }

  private getHotspotsFor(exp: ExpeditionType): PresetHotspot[] {
    switch (exp) {
      case "flood":
        return FLOOD_HOTSPOTS;
      case "drought":
        return DROUGHT_HOTSPOTS;
      case "canopy":
        return CANOPY_HOTSPOTS;
      case "ocean":
        return OCEAN_HOTSPOTS;
      case "heat":
      default:
        return HEAT_HOTSPOTS;
    }
  }

  public getHotspots(): PresetHotspot[] {
    return this.getHotspotsFor(this.expedition);
  }

  public getMissionTitle(): string {
    switch (this.expedition) {
      case "flood":
        return "EXTREME RAINFALL RADAR (GPCP v2.3)";
      case "drought":
        return "HYDROLOGICAL DROUGHT (SMAP / GPCP)";
      case "canopy":
        return "CANOPY & HARVEST (MODIS / GISTEMP)";
      case "ocean":
        return "OCEAN CURRENTS (MUR SST / GISTEMP)";
      case "heat":
      default:
        return "GLOBAL HEAT ANOMALIES (GISTEMP v4)";
    }
  }

  public getVariableId(): string {
    return this.expedition === "flood" || this.expedition === "drought"
      ? "precipitation"
      : "surface_temperature_anomaly";
  }
}

export const MissionManager = MissionState.getInstance();
