"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  DARK_STORES,
  ZONE_SUMMARY,
  getRiskColor,
  getRiskLabel,
  type DarkStore,
  type Platform,
} from "@/data/darkStores";
import {
  generateMockLiveData,
  checkAllTriggers,
  simulateDisruptionEvent,
  PARAMETRIC_TRIGGERS,
  type LiveData,
  type TriggerCheckResult,
} from "@/services/triggerEngine";
import ZoneRiskStats from "./ZoneRiskStats";

// ─────────────────────────────────────────────────────────────
// Platform colors
// ─────────────────────────────────────────────────────────────
const PLATFORM_COLORS: Record<Platform, string> = {
  blinkit: "#ff6b35",
  zepto: "#00d4aa",
};

// ─────────────────────────────────────────────────────────────
// The Map Component
// ─────────────────────────────────────────────────────────────
export default function DarkStoreMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, { marker: L.CircleMarker; zone: L.Circle }>>(new Map());
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  const [mapReady, setMapReady] = useState(false);
  const [liveData, setLiveData] = useState<Record<string, LiveData>>({});
  const [liveStatuses, setLiveStatuses] = useState<Record<string, TriggerCheckResult>>({});
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [platformFilter, setPlatformFilter] = useState<"all" | Platform>("all");
  const [activeDisruption, setActiveDisruption] = useState<ReturnType<typeof simulateDisruptionEvent> | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // ─── Initialize Map ────────────────────────────────────────
  useEffect(() => {
    if (!isInView || !mapContainerRef.current || leafletMapRef.current) return;

    import("leaflet").then((L) => {
      // Fix default icon issue
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(mapContainerRef.current!, {
        center: [12.9341, 77.6146],
        zoom: 12,
        zoomControl: true,
        scrollWheelZoom: true,
        attributionControl: false,
      });

      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        { subdomains: "abcd", maxZoom: 19 }
      ).addTo(map);

      leafletMapRef.current = map;

      // Add markers for all stores
      const markerMap = new Map<string, { marker: L.CircleMarker; zone: L.Circle }>();

      DARK_STORES.forEach((store) => {
        const riskColor = getRiskColor(store.riskScore);
        const platformColor = PLATFORM_COLORS[store.platform];

        // Zone radius circle
        const zoneCircle = L.circle([store.lat, store.lng], {
          radius: store.zoneRadius,
          color: riskColor,
          fillColor: riskColor,
          fillOpacity: 0.12,
          weight: 1,
          opacity: 0.35,
        }).addTo(map);

        // Store marker
        const marker = L.circleMarker([store.lat, store.lng], {
          radius: 9,
          fillColor: platformColor,
          fillOpacity: 1,
          color: "#ffffff",
          weight: 2,
          opacity: 0.9,
        }).addTo(map);

        markerMap.set(store.id, { marker, zone: zoneCircle });
      });

      markersRef.current = markerMap;

      // Fix: Leaflet needs the container to be fully laid out before it can
      // compute the correct viewport. We invalidate + re-center after a tick.
      map.whenReady(() => {
        setTimeout(() => {
          map.invalidateSize();
          map.setView([12.9341, 77.6146], 12);
          setMapReady(true);
        }, 300);
      });
    });

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [isInView]);

  // ─── Bind Popups when live data is available ───────────────
  const bindPopups = useCallback(() => {
    if (!leafletMapRef.current) return;

    DARK_STORES.forEach((store) => {
      const entry = markersRef.current.get(store.id);
      if (!entry) return;

      const data = liveData[store.id];
      const status = liveStatuses[store.id];
      if (!data) return;

      const riskColor = getRiskColor(store.riskScore);
      const riskLabel = getRiskLabel(store.riskScore);
      const platformColor = PLATFORM_COLORS[store.platform];

      const triggerBars = status
        ? status.triggers
            .map((t) => {
              const trigDef = PARAMETRIC_TRIGGERS[t.triggerName];
              const label = trigDef?.label || t.triggerName;
              const barColor = t.severity === "critical" ? "#ef4444" : t.severity === "moderate" ? "#f59e0b" : "#22c55e";
              return `<div style="display:flex;align-items:center;gap:6px;margin-top:3px;">
                <span style="width:6px;height:6px;border-radius:50%;background:${barColor};display:inline-block;box-shadow:0 0 4px ${barColor}60;"></span>
                <span style="color:rgba(255,255,255,0.6);font-size:10px;">${label}</span>
              </div>`;
            })
            .join("")
        : "";

      const popupHtml = `
        <div style="
          background:rgba(10,15,26,0.95);
          backdrop-filter:blur(20px);
          -webkit-backdrop-filter:blur(20px);
          border:1px solid rgba(255,255,255,0.1);
          border-radius:14px;
          padding:16px 18px;
          min-width:240px;
          font-family:'Inter',sans-serif;
          box-shadow:0 8px 32px rgba(0,0,0,0.5);
        ">
          <!-- Header -->
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
            <div style="color:#fff;font-weight:700;font-size:14px;font-family:'Space Grotesk',sans-serif;">${store.name}</div>
            <span style="
              font-size:10px;font-weight:600;
              padding:2px 8px;border-radius:20px;
              background:${platformColor}20;
              color:${platformColor};
              border:1px solid ${platformColor}30;
            ">${store.platform === "blinkit" ? "Blinkit" : "Zepto"}</span>
          </div>

          <!-- Risk pill -->
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:12px;">
            <span style="
              width:8px;height:8px;border-radius:50%;
              background:${riskColor};
              box-shadow:0 0 8px ${riskColor}60;
              display:inline-block;
            "></span>
            <span style="color:${riskColor};font-size:12px;font-weight:600;">${riskLabel}</span>
            <span style="color:rgba(255,255,255,0.3);font-size:11px;margin-left:4px;">(${(store.riskScore * 100).toFixed(0)}%)</span>
          </div>

          <!-- Sensor readings -->
          <div style="
            background:rgba(255,255,255,0.03);
            border-radius:10px;
            padding:10px 12px;
            margin-bottom:10px;
            border:1px solid rgba(255,255,255,0.05);
          ">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
              <div style="display:flex;align-items:center;gap:5px;">
                <span style="font-size:13px;">🌧</span>
                <span style="color:rgba(255,255,255,0.7);font-size:11px;">${data.rainfall} mm/hr</span>
              </div>
              <div style="display:flex;align-items:center;gap:5px;">
                <span style="font-size:13px;">💨</span>
                <span style="color:rgba(255,255,255,0.7);font-size:11px;">AQI ${data.aqi}</span>
              </div>
              <div style="display:flex;align-items:center;gap:5px;">
                <span style="font-size:13px;">🚦</span>
                <span style="color:rgba(255,255,255,0.7);font-size:11px;">${data.trafficSpeed} km/h</span>
              </div>
              <div style="display:flex;align-items:center;gap:5px;">
                <span style="font-size:13px;">🌡</span>
                <span style="color:rgba(255,255,255,0.7);font-size:11px;">${data.heatIndex}°C</span>
              </div>
            </div>
          </div>

          <!-- Status -->
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
            <span style="color:rgba(255,255,255,0.5);font-size:11px;">Store Status</span>
            <span style="font-size:12px;">${data.storeOnline ? "🟢 Online" : "🔴 Offline"}</span>
          </div>

          <!-- Trigger status -->
          <div style="border-top:1px solid rgba(255,255,255,0.06);padding-top:8px;margin-top:4px;">
            <div style="color:rgba(255,255,255,0.35);font-size:10px;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px;font-weight:600;">Parametric Triggers</div>
            ${triggerBars}
          </div>

          <!-- Premium placeholder -->
          <div style="
            margin-top:10px;padding-top:8px;
            border-top:1px solid rgba(255,255,255,0.06);
            color:rgba(255,255,255,0.3);font-size:11px;font-style:italic;
          ">Weekly Premium: Calculating...</div>
        </div>
      `;

      entry.marker.unbindPopup();
      entry.marker.bindPopup(popupHtml, {
        className: "dark-store-popup",
        maxWidth: 280,
        closeButton: true,
      });
    });
  }, [liveData, liveStatuses]);

  useEffect(() => {
    bindPopups();
  }, [bindPopups]);

  // ─── Live Data Refresh ──────────────────────────────────────
  const refreshLiveData = useCallback(() => {
    const newData: Record<string, LiveData> = {};
    const newStatuses: Record<string, TriggerCheckResult> = {};

    DARK_STORES.forEach((store) => {
      const data = generateMockLiveData(store.id);
      newData[store.id] = data;
      newStatuses[store.id] = checkAllTriggers(data);
    });

    setLiveData(newData);
    setLiveStatuses(newStatuses);
  }, []);

  // Initial load + 6-second refresh
  useEffect(() => {
    if (!mapReady) return;
    refreshLiveData();
    const interval = setInterval(refreshLiveData, 6000);
    return () => clearInterval(interval);
  }, [mapReady, refreshLiveData]);

  // ─── Platform/Zone Filtering ───────────────────────────────
  useEffect(() => {
    if (!leafletMapRef.current) return;

    DARK_STORES.forEach((store) => {
      const entry = markersRef.current.get(store.id);
      if (!entry) return;

      const platformMatch = platformFilter === "all" || store.platform === platformFilter;
      const zoneMatch = !selectedZone || store.zone === selectedZone;
      const visible = platformMatch && zoneMatch;

      if (visible) {
        if (!leafletMapRef.current!.hasLayer(entry.marker)) {
          entry.marker.addTo(leafletMapRef.current!);
          entry.zone.addTo(leafletMapRef.current!);
        }
      } else {
        leafletMapRef.current!.removeLayer(entry.marker);
        leafletMapRef.current!.removeLayer(entry.zone);
      }
    });
  }, [platformFilter, selectedZone]);

  // ─── Disruption Simulation ──────────────────────────────────
  const handleSimulateDisruption = () => {
    if (isSimulating) return;
    setIsSimulating(true);

    const event = simulateDisruptionEvent("HSR Layout", "rainfall", 95);
    setActiveDisruption(event);
    setShowToast(true);

    // Flash affected store markers
    if (leafletMapRef.current) {
      event.affectedStores.forEach((store) => {
        const entry = markersRef.current.get(store.id);
        if (entry) {
          entry.marker.setStyle({ fillColor: "#ef4444", color: "#ef4444", fillOpacity: 1 });
          entry.zone.setStyle({ fillColor: "#ef4444", color: "#ef4444", fillOpacity: 0.3 });
        }
      });
    }

    // Toast auto-hide after 5s
    setTimeout(() => setShowToast(false), 5000);

    // Reset after 8s
    setTimeout(() => {
      if (leafletMapRef.current) {
        event.affectedStores.forEach((store) => {
          const entry = markersRef.current.get(store.id);
          if (entry) {
            const platformColor = PLATFORM_COLORS[store.platform];
            const riskColor = getRiskColor(store.riskScore);
            entry.marker.setStyle({ fillColor: platformColor, color: "#ffffff", fillOpacity: 1 });
            entry.zone.setStyle({ fillColor: riskColor, color: riskColor, fillOpacity: 0.12 });
          }
        });
      }
      setActiveDisruption(null);
      setIsSimulating(false);
    }, 8000);
  };

  // ─── Inject Custom CSS ──────────────────────────────────────
  useEffect(() => {
    const style = document.createElement("style");
    style.id = "dark-store-map-styles";
    style.textContent = `
      .dark-store-popup .leaflet-popup-content-wrapper {
        background: transparent !important;
        box-shadow: none !important;
        border: none !important;
        border-radius: 14px !important;
        padding: 0 !important;
      }
      .dark-store-popup .leaflet-popup-content {
        margin: 0 !important;
        line-height: 1.4 !important;
      }
      .dark-store-popup .leaflet-popup-tip {
        background: rgba(10,15,26,0.95) !important;
        border: 1px solid rgba(255,255,255,0.1) !important;
        box-shadow: none !important;
      }
      .dark-store-popup .leaflet-popup-close-button {
        color: rgba(255,255,255,0.4) !important;
        font-size: 18px !important;
        top: 8px !important;
        right: 10px !important;
      }
      .dark-store-popup .leaflet-popup-close-button:hover {
        color: #00d4aa !important;
      }

      @keyframes disruption-pulse {
        0%, 100% { box-shadow: 0 0 20px rgba(239,68,68,0.3); }
        50% { box-shadow: 0 0 40px rgba(239,68,68,0.6); }
      }
      .disruption-active {
        animation: disruption-pulse 1s ease-in-out infinite;
      }

      @keyframes flash-border {
        0%, 100% { border-color: rgba(239,68,68,0.6); }
        50% { border-color: rgba(239,68,68,0.15); }
      }

      .rain-overlay-drop {
        position: absolute;
        width: 1.5px;
        height: 16px;
        background: linear-gradient(transparent, rgba(255,255,255,0.6));
        animation: rain-fall linear infinite;
      }
      @keyframes rain-fall {
        to { transform: translateY(700px); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
    return () => {
      const el = document.getElementById("dark-store-map-styles");
      if (el) el.remove();
    };
  }, []);

  // ─── Zone options for dropdown ──────────────────────────────
  const zoneOptions = Object.keys(ZONE_SUMMARY).sort();

  return (
    <section
      id="map"
      ref={containerRef}
      className="relative py-20 px-4"
      style={{
        background: "linear-gradient(180deg, #0a0f1a 0%, #0d1320 50%, #0a0f1a 100%)",
      }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="font-[var(--font-heading)] text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3">
            Live Zone Risk Monitor
          </h2>
          <p className="text-white/40 text-sm sm:text-base max-w-lg mx-auto">
            Real-time parametric monitoring across Bangalore&apos;s dark store delivery zones
          </p>
          <div className="w-16 h-px bg-teal mx-auto mt-4" />
        </motion.div>

        {/* Map Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
          className={`relative rounded-2xl overflow-hidden border ${
            isSimulating
              ? "border-red-500/40 disruption-active"
              : "border-white/5"
          }`}
          style={{ boxShadow: isSimulating ? undefined : "0 0 80px rgba(0,212,170,0.05)" }}
        >
          <div
            ref={mapContainerRef}
            className="w-full"
            style={{ height: "clamp(500px, 65vh, 700px)" }}
          />

          {/* ─── Control Panel (top-right) ──────────────────── */}
          <AnimatePresence>
            {mapReady && (
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="absolute top-4 right-4 z-[1000] glass-strong rounded-xl p-4 flex flex-col gap-3"
                style={{ minWidth: 200 }}
              >
                <div className="text-[10px] text-white/40 uppercase tracking-widest font-semibold mb-1">
                  Controls
                </div>

                {/* Platform filter */}
                <div className="flex gap-1.5">
                  {(["all", "blinkit", "zepto"] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPlatformFilter(p)}
                      className={`text-[11px] font-medium px-3 py-1.5 rounded-full transition-all duration-200 cursor-pointer ${
                        platformFilter === p
                          ? p === "blinkit"
                            ? "bg-orange/20 text-orange border border-orange/30"
                            : p === "zepto"
                              ? "bg-teal/20 text-teal border border-teal/30"
                              : "bg-white/10 text-white border border-white/20"
                          : "bg-white/5 text-white/40 border border-white/5 hover:bg-white/10 hover:text-white/60"
                      }`}
                    >
                      {p === "all" ? "All" : p === "blinkit" ? "Blinkit" : "Zepto"}
                    </button>
                  ))}
                </div>

                {/* Zone filter */}
                <select
                  value={selectedZone || ""}
                  onChange={(e) => setSelectedZone(e.target.value || null)}
                  className="text-[11px] bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white/70 focus:outline-none focus:border-teal/40 cursor-pointer appearance-none"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.4)' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 8px center",
                    paddingRight: "28px",
                  }}
                >
                  <option value="" style={{ background: "#0f1623" }}>All Zones</option>
                  {zoneOptions.map((z) => (
                    <option key={z} value={z} style={{ background: "#0f1623" }}>
                      {z}
                    </option>
                  ))}
                </select>

                {/* Simulate button */}
                <button
                  onClick={handleSimulateDisruption}
                  disabled={isSimulating}
                  className={`flex items-center justify-center gap-2 text-[11px] font-semibold px-3 py-2 rounded-lg transition-all duration-300 cursor-pointer ${
                    isSimulating
                      ? "bg-red-500/20 text-red-400 border border-red-500/30 cursor-not-allowed"
                      : "bg-teal/10 text-teal border border-teal/20 hover:bg-teal/20 hover:border-teal/40 active:scale-95"
                  }`}
                >
                  <span className="text-base">⚡</span>
                  {isSimulating ? "Simulating..." : "Simulate Disruption"}
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ─── Legend (bottom-left) ────────────────────────── */}
          <AnimatePresence>
            {mapReady && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="absolute bottom-4 left-4 z-[1000] glass rounded-xl p-4"
                style={{ minWidth: 170 }}
              >
                <div className="text-[10px] text-white/40 uppercase tracking-widest font-semibold mb-3">
                  Legend
                </div>
                <div className="flex flex-col gap-2">
                  {/* Platform markers */}
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-3 h-3 rounded-full border-2 border-white/80"
                      style={{ background: "#ff6b35", boxShadow: "0 0 6px #ff6b3560" }}
                    />
                    <span className="text-[11px] text-white/60">Blinkit Store</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-3 h-3 rounded-full border-2 border-white/80"
                      style={{ background: "#00d4aa", boxShadow: "0 0 6px #00d4aa60" }}
                    />
                    <span className="text-[11px] text-white/60">Zepto Store</span>
                  </div>

                  <div className="h-px bg-white/5 my-1" />

                  {/* Risk zones */}
                  <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full" style={{ background: "#ef4444", boxShadow: "0 0 6px #ef444460" }} />
                    <span className="text-[11px] text-white/60">High Risk Zone</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full" style={{ background: "#f59e0b", boxShadow: "0 0 6px #f59e0b60" }} />
                    <span className="text-[11px] text-white/60">Medium Risk</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full" style={{ background: "#10b981", boxShadow: "0 0 6px #10b98160" }} />
                    <span className="text-[11px] text-white/60">Low Risk</span>
                  </div>

                  {/* Active disruption indicator */}
                  {isSimulating && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-2.5 mt-1"
                    >
                      <span className="relative w-3 h-3">
                        <span
                          className="absolute inset-0 rounded-full"
                          style={{ background: "#ef4444", boxShadow: "0 0 8px #ef4444" }}
                        />
                        <span
                          className="absolute inset-[-3px] rounded-full border border-red-500/50"
                          style={{ animation: "pulse-ring-danger 1.5s ease-out infinite" }}
                        />
                      </span>
                      <span className="text-[11px] text-red-400 font-medium">Active Disruption</span>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ─── Toast Notification ──────────────────────────── */}
          <AnimatePresence>
            {showToast && (
              <motion.div
                initial={{ opacity: 0, x: 60, y: -10 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                exit={{ opacity: 0, x: 60, y: -10 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="absolute top-4 left-4 sm:left-auto sm:right-[230px] z-[2000] glass-strong rounded-xl p-4 flex items-start gap-3 max-w-sm shadow-2xl border border-red-500/20"
              >
                <div className="text-2xl mt-0.5">🛡️</div>
                <div>
                  <div className="text-sm text-white/90 font-semibold leading-snug mb-1">
                    Disruption Detected
                  </div>
                  <div className="text-xs text-white/60 leading-relaxed">
                    Heavy rainfall in <span className="text-red-400 font-medium">HSR Layout</span> —{" "}
                    <span className="text-teal font-semibold">Auto-claim triggered</span> for affected riders
                  </div>
                  {activeDisruption && (
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/20 font-medium">
                        {activeDisruption.severity}
                      </span>
                      <span className="text-[10px] text-white/30">
                        {activeDisruption.affectedStores.length} stores affected
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ─── Rain Overlay during simulation ─────────────── */}
          <AnimatePresence>
            {isSimulating && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-[400] overflow-hidden pointer-events-none"
              >
                {Array.from({ length: 100 }).map((_, i) => (
                  <div
                    key={i}
                    className="rain-overlay-drop"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `-${Math.random() * 30 + 10}px`,
                      animationDelay: `${Math.random() * 0.6}s`,
                      animationDuration: `${0.35 + Math.random() * 0.3}s`,
                    }}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ─── Tagline ──────────────────────────────────────── */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center mt-10 text-lg sm:text-xl font-[var(--font-heading)] font-medium"
        >
          <span className="text-teal">Hyperlocal.</span>{" "}
          <span className="text-white/80">Zone-level.</span>{" "}
          <span className="text-white/40">Not city-level.</span>
        </motion.p>

        {/* ─── Zone Risk Stats ──────────────────────────────── */}
        <ZoneRiskStats liveStatuses={liveStatuses} />
      </div>
    </section>
  );
}
