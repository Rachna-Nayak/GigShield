// ─────────────────────────────────────────────────────────────
// PREMIUM FORMULA PENDING — HARDCODED FOR DEMO
// Zone-based weekly premiums and coverage. These values are
// placeholder constants until the actuarial model is finalized.
// ─────────────────────────────────────────────────────────────

// PREMIUM FORMULA PENDING — HARDCODED FOR DEMO
export const ZONE_PREMIUMS: Record<string, number> = {
  "HSR Layout": 32,
  "Koramangala": 26,
  "BTM Layout": 29,
  "Indiranagar": 18,
  "Whitefield": 16,
  "JP Nagar": 22,
  "Electronic City": 22,
  "Marathahalli": 22,
  "Bellandur": 22,
  "Sarjapur Road": 22,
  "Hebbal": 22,
  "Jayanagar": 22,
  "Yelahanka": 22,
  "Bannerghatta Road": 22,
};

// PREMIUM FORMULA PENDING — HARDCODED FOR DEMO
export function getWeeklyPremium(zone: string): number {
  return ZONE_PREMIUMS[zone] ?? 22;
}

// PREMIUM FORMULA PENDING — HARDCODED FOR DEMO
export function getCoverageAmount(zone: string): number {
  return getWeeklyPremium(zone) * 80;
}

export const ZONE_OPTIONS = [
  "HSR Layout",
  "Koramangala",
  "BTM Layout",
  "Indiranagar",
  "Whitefield",
  "JP Nagar",
  "Electronic City",
  "Marathahalli",
  "Bellandur",
  "Sarjapur Road",
  "Hebbal",
  "Jayanagar",
];

export const PLATFORM_OPTIONS = [
  "Blinkit",
  "Zepto",
  "Swiggy Instamart",
];

export const EARNINGS_OPTIONS = [
  "₹500-₹700",
  "₹700-₹900",
  "₹900-₹1100",
  "₹1100+",
];

export const EXPERIENCE_OPTIONS = [
  "< 1 year",
  "1-2 years",
  "2-3 years",
  "3+ years",
];

// Get midpoint of earnings range for payout calculation
export function getEarningsMidpoint(earnings: string): number {
  switch (earnings) {
    case "₹500-₹700": return 600;
    case "₹700-₹900": return 800;
    case "₹900-₹1100": return 1000;
    case "₹1100+": return 1200;
    default: return 800;
  }
}

// Zone risk data for registration preview
export interface ZoneRiskInfo {
  floodRisk: "high" | "medium" | "low";
  trafficRisk: "high" | "medium" | "low";
  pollutionRisk: "high" | "medium" | "low";
  riskScore: number;
}

export const ZONE_RISKS: Record<string, ZoneRiskInfo> = {
  "HSR Layout": { floodRisk: "high", trafficRisk: "high", pollutionRisk: "high", riskScore: 1.0 },
  "Koramangala": { floodRisk: "medium", trafficRisk: "high", pollutionRisk: "medium", riskScore: 0.65 },
  "BTM Layout": { floodRisk: "high", trafficRisk: "medium", pollutionRisk: "medium", riskScore: 0.75 },
  "Indiranagar": { floodRisk: "low", trafficRisk: "medium", pollutionRisk: "low", riskScore: 0.29 },
  "Whitefield": { floodRisk: "low", trafficRisk: "high", pollutionRisk: "low", riskScore: 0.44 },
  "JP Nagar": { floodRisk: "medium", trafficRisk: "low", pollutionRisk: "low", riskScore: 0.35 },
  "Electronic City": { floodRisk: "low", trafficRisk: "high", pollutionRisk: "medium", riskScore: 0.5 },
  "Marathahalli": { floodRisk: "low", trafficRisk: "high", pollutionRisk: "medium", riskScore: 0.5 },
  "Bellandur": { floodRisk: "medium", trafficRisk: "medium", pollutionRisk: "low", riskScore: 0.44 },
  "Sarjapur Road": { floodRisk: "medium", trafficRisk: "high", pollutionRisk: "low", riskScore: 0.59 },
  "Hebbal": { floodRisk: "low", trafficRisk: "medium", pollutionRisk: "medium", riskScore: 0.35 },
  "Jayanagar": { floodRisk: "low", trafficRisk: "low", pollutionRisk: "low", riskScore: 0.2 },
};
