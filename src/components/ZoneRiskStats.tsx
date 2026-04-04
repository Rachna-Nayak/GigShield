"use client";

import { motion } from "framer-motion";
import { ZONE_SUMMARY, getRiskColor, getRiskLabel } from "@/data/darkStores";
import type { TriggerCheckResult } from "@/services/triggerEngine";

interface ZoneRiskStatsProps {
  liveStatuses: Record<string, TriggerCheckResult>;
}

export default function ZoneRiskStats({ liveStatuses }: ZoneRiskStatsProps) {
  // Sort zones by risk score descending, take top 3
  const topZones = Object.entries(ZONE_SUMMARY)
    .sort(([, a], [, b]) => b.avgRiskScore - a.avgRiskScore)
    .slice(0, 3);

  // Count active triggers per zone from live statuses
  function getActiveTriggersForZone(zoneName: string): number {
    let count = 0;
    for (const [, result] of Object.entries(liveStatuses)) {
      // We check all stores but approximate by zone name
      if (result.triggers) {
        count += result.triggers.filter((t) => t.triggered).length;
      }
    }
    // Normalize – this is a rough zone-level approximation
    const storeCount = ZONE_SUMMARY[zoneName]?.storeCount || 1;
    return Math.round(count / (Object.keys(liveStatuses).length || 1) * storeCount);
  }

  const statusIcon = (status: string) => {
    switch (status) {
      case "disrupted":
        return "🔴";
      case "warning":
        return "🟡";
      default:
        return "🟢";
    }
  };

  // Get the worst status for a zone from live data
  function getZoneStatus(zoneName: string): string {
    let worst = "normal";
    for (const [storeId, result] of Object.entries(liveStatuses)) {
      if (storeId.includes(zoneName.toLowerCase().replace(/\s+/g, "-"))) {
        if (result.overallStatus === "disrupted") return "disrupted";
        if (result.overallStatus === "warning") worst = "warning";
      }
    }
    return worst;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      viewport={{ once: true }}
      className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6"
    >
      {topZones.map(([zone, data], i) => {
        const riskColor = getRiskColor(data.avgRiskScore);
        const riskLabel = getRiskLabel(data.avgRiskScore);
        const activeTriggers = getActiveTriggersForZone(zone);
        const zoneStatus = getZoneStatus(zone);

        return (
          <motion.div
            key={zone}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            viewport={{ once: true }}
            whileHover={{ y: -4, scale: 1.02 }}
            className="glass rounded-xl p-5 cursor-default group relative overflow-hidden"
          >
            {/* Glow accent */}
            <div
              className="absolute top-0 left-0 right-0 h-px"
              style={{
                background: `linear-gradient(90deg, transparent 0%, ${riskColor}60 50%, transparent 100%)`,
              }}
            />

            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-sm">{statusIcon(zoneStatus)}</span>
                <h4 className="font-[var(--font-heading)] text-sm font-semibold text-white truncate">
                  {zone}
                </h4>
              </div>
              <span
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={{
                  background: `${riskColor}20`,
                  color: riskColor,
                  border: `1px solid ${riskColor}30`,
                }}
              >
                {riskLabel}
              </span>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <div
                  className="font-[var(--font-heading)] text-xl font-bold"
                  style={{ color: riskColor }}
                >
                  {(data.avgRiskScore * 100).toFixed(0)}
                </div>
                <div className="text-[10px] text-white/40 mt-0.5">Risk %</div>
              </div>
              <div className="text-center">
                <div className="font-[var(--font-heading)] text-xl font-bold text-white">
                  {data.storeCount}
                </div>
                <div className="text-[10px] text-white/40 mt-0.5">Stores</div>
              </div>
              <div className="text-center">
                <div className="font-[var(--font-heading)] text-xl font-bold text-orange">
                  {activeTriggers}
                </div>
                <div className="text-[10px] text-white/40 mt-0.5">Triggers</div>
              </div>
            </div>

            {/* Platform badges */}
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
              {data.platforms.map((p) => (
                <span
                  key={p}
                  className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                  style={{
                    background:
                      p === "blinkit"
                        ? "rgba(255,107,53,0.15)"
                        : "rgba(0,212,170,0.15)",
                    color: p === "blinkit" ? "#ff6b35" : "#00d4aa",
                    border: `1px solid ${p === "blinkit" ? "rgba(255,107,53,0.25)" : "rgba(0,212,170,0.25)"}`,
                  }}
                >
                  {p === "blinkit" ? "Blinkit" : "Zepto"}
                </span>
              ))}
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
