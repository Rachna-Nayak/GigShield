// ─────────────────────────────────────────────────────────────
// Parametric Trigger Engine — Gig-Insure
// ─────────────────────────────────────────────────────────────

import { DARK_STORES, type DarkStore } from "@/data/darkStores";

// ─────────────────────────────────────────────────────────────
// Trigger Thresholds
// ─────────────────────────────────────────────────────────────

export interface TriggerDefinition {
  threshold: number;
  unit: string;
  label: string;
}

export const PARAMETRIC_TRIGGERS: Record<string, TriggerDefinition> = {
  rainfall: { threshold: 60, unit: "mm/hr", label: "Heavy Rainfall" },
  aqi: { threshold: 350, unit: "AQI", label: "Severe Pollution" },
  trafficSpeed: { threshold: 5, unit: "km/h", label: "Traffic Gridlock" },
  storeOfflineMinutes: { threshold: 60, unit: "minutes", label: "Dark Store Shutdown" },
  heatIndex: { threshold: 42, unit: "°C", label: "Extreme Heat" },
};

// ─────────────────────────────────────────────────────────────
// Disruption Event Simulation
// ─────────────────────────────────────────────────────────────

export interface DisruptionEvent {
  triggered: boolean;
  zone: string;
  eventType: string;
  value: number;
  threshold: number;
  severity: "critical" | "moderate" | "none";
  timestamp: string;
  affectedStores: DarkStore[];
}

export function simulateDisruptionEvent(
  zone: string,
  eventType: string,
  value: number
): DisruptionEvent {
  const trigger = PARAMETRIC_TRIGGERS[eventType];
  if (!trigger) {
    return {
      triggered: false,
      zone,
      eventType,
      value,
      threshold: 0,
      severity: "none",
      timestamp: new Date().toISOString(),
      affectedStores: [],
    };
  }

  // For trafficSpeed, trigger fires when speed DROPS below threshold
  const triggered =
    eventType === "trafficSpeed" ? value <= trigger.threshold : value >= trigger.threshold;

  const severity: DisruptionEvent["severity"] = !triggered
    ? "none"
    : eventType === "trafficSpeed"
      ? value <= trigger.threshold / 1.5
        ? "critical"
        : "moderate"
      : value > trigger.threshold * 1.5
        ? "critical"
        : "moderate";

  const affectedStores = DARK_STORES.filter((s) => s.zone === zone);

  return {
    triggered,
    zone,
    eventType,
    value,
    threshold: trigger.threshold,
    severity,
    timestamp: new Date().toISOString(),
    affectedStores,
  };
}

// ─────────────────────────────────────────────────────────────
// Live Data Generation
// ─────────────────────────────────────────────────────────────

export interface LiveData {
  rainfall: number;
  aqi: number;
  trafficSpeed: number;
  heatIndex: number;
  storeOnline: boolean;
  timestamp: string;
}

// High-risk zones that bias towards dangerous values
const HIGH_RISK_ZONES = ["HSR Layout", "BTM Layout"];

export function generateMockLiveData(storeId: string): LiveData {
  const store = DARK_STORES.find((s) => s.id === storeId);
  const isHighRisk = store ? HIGH_RISK_ZONES.includes(store.zone) : false;

  // Base ranges, biased up for high-risk zones
  const rainfallBase = isHighRisk ? 35 : 10;
  const rainfallRange = isHighRisk ? 50 : 30;

  const aqiBase = isHighRisk ? 200 : 80;
  const aqiRange = isHighRisk ? 250 : 150;

  const trafficSpeedBase = isHighRisk ? 3 : 12;
  const trafficSpeedRange = isHighRisk ? 12 : 25;

  const heatBase = isHighRisk ? 36 : 28;
  const heatRange = isHighRisk ? 10 : 8;

  return {
    rainfall: parseFloat((rainfallBase + Math.random() * rainfallRange).toFixed(1)),
    aqi: Math.round(aqiBase + Math.random() * aqiRange),
    trafficSpeed: parseFloat((trafficSpeedBase + Math.random() * trafficSpeedRange).toFixed(1)),
    heatIndex: parseFloat((heatBase + Math.random() * heatRange).toFixed(1)),
    storeOnline: Math.random() > 0.1, // 90% chance online
    timestamp: new Date().toISOString(),
  };
}

// ─────────────────────────────────────────────────────────────
// Trigger Checking
// ─────────────────────────────────────────────────────────────

export interface TriggerResult {
  triggerName: string;
  triggered: boolean;
  value: number;
  threshold: number;
  severity: "critical" | "moderate" | "none";
}

export interface TriggerCheckResult {
  triggers: TriggerResult[];
  overallStatus: "disrupted" | "warning" | "normal";
}

export function checkAllTriggers(liveData: LiveData): TriggerCheckResult {
  const triggers: TriggerResult[] = [];

  // Rainfall
  const rainfallTrigger = PARAMETRIC_TRIGGERS.rainfall;
  const rainfallTriggered = liveData.rainfall >= rainfallTrigger.threshold;
  triggers.push({
    triggerName: "rainfall",
    triggered: rainfallTriggered,
    value: liveData.rainfall,
    threshold: rainfallTrigger.threshold,
    severity: !rainfallTriggered
      ? "none"
      : liveData.rainfall > rainfallTrigger.threshold * 1.5
        ? "critical"
        : "moderate",
  });

  // AQI
  const aqiTrigger = PARAMETRIC_TRIGGERS.aqi;
  const aqiTriggered = liveData.aqi >= aqiTrigger.threshold;
  triggers.push({
    triggerName: "aqi",
    triggered: aqiTriggered,
    value: liveData.aqi,
    threshold: aqiTrigger.threshold,
    severity: !aqiTriggered
      ? "none"
      : liveData.aqi > aqiTrigger.threshold * 1.5
        ? "critical"
        : "moderate",
  });

  // Traffic Speed (inverse — lower is worse)
  const trafficTrigger = PARAMETRIC_TRIGGERS.trafficSpeed;
  const trafficTriggered = liveData.trafficSpeed <= trafficTrigger.threshold;
  triggers.push({
    triggerName: "trafficSpeed",
    triggered: trafficTriggered,
    value: liveData.trafficSpeed,
    threshold: trafficTrigger.threshold,
    severity: !trafficTriggered
      ? "none"
      : liveData.trafficSpeed <= trafficTrigger.threshold / 1.5
        ? "critical"
        : "moderate",
  });

  // Heat Index
  const heatTrigger = PARAMETRIC_TRIGGERS.heatIndex;
  const heatTriggered = liveData.heatIndex >= heatTrigger.threshold;
  triggers.push({
    triggerName: "heatIndex",
    triggered: heatTriggered,
    value: liveData.heatIndex,
    threshold: heatTrigger.threshold,
    severity: !heatTriggered
      ? "none"
      : liveData.heatIndex > heatTrigger.threshold * 1.5
        ? "critical"
        : "moderate",
  });

  // Store offline
  if (!liveData.storeOnline) {
    triggers.push({
      triggerName: "storeOfflineMinutes",
      triggered: true,
      value: 60,
      threshold: PARAMETRIC_TRIGGERS.storeOfflineMinutes.threshold,
      severity: "moderate",
    });
  }

  // Determine overall status
  const hasCritical = triggers.some((t) => t.severity === "critical");
  const hasTriggered = triggers.some((t) => t.triggered);

  const overallStatus: TriggerCheckResult["overallStatus"] = hasCritical
    ? "disrupted"
    : hasTriggered
      ? "warning"
      : "normal";

  return { triggers, overallStatus };
}
