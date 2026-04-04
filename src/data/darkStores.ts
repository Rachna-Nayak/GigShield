// ─────────────────────────────────────────────────────────────
// Dark Store Data Layer — Gig-Insure Hyperlocal Parametric Insurance
// ─────────────────────────────────────────────────────────────

export type RiskLevel = "high" | "medium" | "low";
export type Platform = "blinkit" | "zepto";

export interface DarkStore {
  id: string;
  name: string;
  platform: Platform;
  lat: number;
  lng: number;
  zone: string;
  zoneRadius: number;
  floodRisk: RiskLevel;
  trafficRisk: RiskLevel;
  pollutionRisk: RiskLevel;
  riskScore: number;
}

// Risk level to numeric value mapping
const RISK_VALUES: Record<RiskLevel, number> = {
  high: 1.0,
  medium: 0.5,
  low: 0.2,
};

function computeRiskScore(
  flood: RiskLevel,
  traffic: RiskLevel,
  pollution: RiskLevel
): number {
  return (
    RISK_VALUES[flood] * 0.5 +
    RISK_VALUES[traffic] * 0.3 +
    RISK_VALUES[pollution] * 0.2
  );
}

// PREMIUM FORMULA PENDING — DO NOT IMPLEMENT YET
export function calculateWeeklyPremium(
  _store: DarkStore
): number | null {
  // PREMIUM FORMULA PENDING — DO NOT IMPLEMENT YET
  return null;
}

// ─────────────────────────────────────────────────────────────
// Store Definitions
// ─────────────────────────────────────────────────────────────

export const DARK_STORES: DarkStore[] = [
  // ── BLINKIT ────────────────────────────────────────────────
  {
    id: "blinkit-hsr-hub",
    name: "Blinkit HSR Hub",
    platform: "blinkit",
    lat: 12.9141,
    lng: 77.6446,
    zone: "HSR Layout",
    zoneRadius: 1500,
    floodRisk: "high",
    trafficRisk: "high",
    pollutionRisk: "high",
    riskScore: computeRiskScore("high", "high", "high"),
  },
  {
    id: "blinkit-koramangala",
    name: "Blinkit Koramangala",
    platform: "blinkit",
    lat: 12.9352,
    lng: 77.6245,
    zone: "Koramangala",
    zoneRadius: 1500,
    floodRisk: "medium",
    trafficRisk: "high",
    pollutionRisk: "medium",
    riskScore: computeRiskScore("medium", "high", "medium"),
  },
  {
    id: "blinkit-btm-layout",
    name: "Blinkit BTM Layout",
    platform: "blinkit",
    lat: 12.9166,
    lng: 77.6101,
    zone: "BTM Layout",
    zoneRadius: 1500,
    floodRisk: "high",
    trafficRisk: "medium",
    pollutionRisk: "medium",
    riskScore: computeRiskScore("high", "medium", "medium"),
  },
  {
    id: "blinkit-indiranagar",
    name: "Blinkit Indiranagar",
    platform: "blinkit",
    lat: 12.9784,
    lng: 77.6408,
    zone: "Indiranagar",
    zoneRadius: 1500,
    floodRisk: "low",
    trafficRisk: "medium",
    pollutionRisk: "low",
    riskScore: computeRiskScore("low", "medium", "low"),
  },
  {
    id: "blinkit-whitefield",
    name: "Blinkit Whitefield",
    platform: "blinkit",
    lat: 12.9698,
    lng: 77.7500,
    zone: "Whitefield",
    zoneRadius: 1500,
    floodRisk: "low",
    trafficRisk: "high",
    pollutionRisk: "low",
    riskScore: computeRiskScore("low", "high", "low"),
  },
  {
    id: "blinkit-jp-nagar",
    name: "Blinkit JP Nagar",
    platform: "blinkit",
    lat: 12.9063,
    lng: 77.5857,
    zone: "JP Nagar",
    zoneRadius: 1500,
    floodRisk: "medium",
    trafficRisk: "low",
    pollutionRisk: "low",
    riskScore: computeRiskScore("medium", "low", "low"),
  },
  {
    id: "blinkit-electronic-city",
    name: "Blinkit Electronic City",
    platform: "blinkit",
    lat: 12.8399,
    lng: 77.6770,
    zone: "Electronic City",
    zoneRadius: 1500,
    floodRisk: "low",
    trafficRisk: "high",
    pollutionRisk: "medium",
    riskScore: computeRiskScore("low", "high", "medium"),
  },
  {
    id: "blinkit-marathahalli",
    name: "Blinkit Marathahalli",
    platform: "blinkit",
    lat: 12.9591,
    lng: 77.6974,
    zone: "Marathahalli",
    zoneRadius: 1500,
    floodRisk: "low",
    trafficRisk: "high",
    pollutionRisk: "medium",
    riskScore: computeRiskScore("low", "high", "medium"),
  },

  // ── ZEPTO ──────────────────────────────────────────────────
  {
    id: "zepto-hsr",
    name: "Zepto HSR",
    platform: "zepto",
    lat: 12.9121,
    lng: 77.6380,
    zone: "HSR Layout",
    zoneRadius: 1500,
    floodRisk: "high",
    trafficRisk: "high",
    pollutionRisk: "high",
    riskScore: computeRiskScore("high", "high", "high"),
  },
  {
    id: "zepto-koramangala-5th",
    name: "Zepto Koramangala 5th Block",
    platform: "zepto",
    lat: 12.9340,
    lng: 77.6200,
    zone: "Koramangala",
    zoneRadius: 1500,
    floodRisk: "medium",
    trafficRisk: "high",
    pollutionRisk: "medium",
    riskScore: computeRiskScore("medium", "high", "medium"),
  },
  {
    id: "zepto-bellandur",
    name: "Zepto Bellandur",
    platform: "zepto",
    lat: 12.9256,
    lng: 77.6760,
    zone: "Bellandur",
    zoneRadius: 1500,
    floodRisk: "medium",
    trafficRisk: "medium",
    pollutionRisk: "low",
    riskScore: computeRiskScore("medium", "medium", "low"),
  },
  {
    id: "zepto-sarjapur-road",
    name: "Zepto Sarjapur Road",
    platform: "zepto",
    lat: 12.9100,
    lng: 77.6870,
    zone: "Sarjapur Road",
    zoneRadius: 1500,
    floodRisk: "medium",
    trafficRisk: "high",
    pollutionRisk: "low",
    riskScore: computeRiskScore("medium", "high", "low"),
  },
  {
    id: "zepto-hebbal",
    name: "Zepto Hebbal",
    platform: "zepto",
    lat: 13.0358,
    lng: 77.5970,
    zone: "Hebbal",
    zoneRadius: 1500,
    floodRisk: "low",
    trafficRisk: "medium",
    pollutionRisk: "medium",
    riskScore: computeRiskScore("low", "medium", "medium"),
  },
  {
    id: "zepto-jayanagar",
    name: "Zepto Jayanagar",
    platform: "zepto",
    lat: 12.9250,
    lng: 77.5838,
    zone: "Jayanagar",
    zoneRadius: 1500,
    floodRisk: "low",
    trafficRisk: "low",
    pollutionRisk: "low",
    riskScore: computeRiskScore("low", "low", "low"),
  },
  {
    id: "zepto-yelahanka",
    name: "Zepto Yelahanka",
    platform: "zepto",
    lat: 13.1007,
    lng: 77.5963,
    zone: "Yelahanka",
    zoneRadius: 1500,
    floodRisk: "low",
    trafficRisk: "low",
    pollutionRisk: "low",
    riskScore: computeRiskScore("low", "low", "low"),
  },
  {
    id: "zepto-bannerghatta-road",
    name: "Zepto Bannerghatta Road",
    platform: "zepto",
    lat: 12.8876,
    lng: 77.6037,
    zone: "Bannerghatta Road",
    zoneRadius: 1500,
    floodRisk: "medium",
    trafficRisk: "medium",
    pollutionRisk: "low",
    riskScore: computeRiskScore("medium", "medium", "low"),
  },
];

// ─────────────────────────────────────────────────────────────
// Utility Functions
// ─────────────────────────────────────────────────────────────

export function getRiskColor(riskScore: number): string {
  if (riskScore > 0.6) return "#ef4444";
  if (riskScore > 0.35) return "#f59e0b";
  return "#10b981";
}

export function getRiskLabel(riskScore: number): string {
  if (riskScore > 0.6) return "High Risk";
  if (riskScore > 0.35) return "Medium Risk";
  return "Low Risk";
}

export function getStoresByZone(zoneName: string): DarkStore[] {
  return DARK_STORES.filter((s) => s.zone === zoneName);
}

// ─────────────────────────────────────────────────────────────
// Zone Summary
// ─────────────────────────────────────────────────────────────

export interface ZoneSummaryEntry {
  avgRiskScore: number;
  storeCount: number;
  platforms: Platform[];
}

function buildZoneSummary(): Record<string, ZoneSummaryEntry> {
  const zones: Record<
    string,
    { totalRisk: number; count: number; platforms: Set<Platform> }
  > = {};

  for (const store of DARK_STORES) {
    if (!zones[store.zone]) {
      zones[store.zone] = { totalRisk: 0, count: 0, platforms: new Set() };
    }
    zones[store.zone].totalRisk += store.riskScore;
    zones[store.zone].count += 1;
    zones[store.zone].platforms.add(store.platform);
  }

  const summary: Record<string, ZoneSummaryEntry> = {};
  for (const [zone, data] of Object.entries(zones)) {
    summary[zone] = {
      avgRiskScore: parseFloat((data.totalRisk / data.count).toFixed(3)),
      storeCount: data.count,
      platforms: Array.from(data.platforms),
    };
  }

  return summary;
}

export const ZONE_SUMMARY = buildZoneSummary();
