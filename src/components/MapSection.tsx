"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";

// Marker data
const blinkitStores = [
  { name: "Blinkit HSR Hub", lat: 12.9141, lng: 77.6446 },
  { name: "Blinkit Koramangala", lat: 12.9352, lng: 77.6245 },
  { name: "Blinkit BTM Layout", lat: 12.9166, lng: 77.6101 },
  { name: "Blinkit Indiranagar", lat: 12.9784, lng: 77.6408 },
  { name: "Blinkit Whitefield", lat: 12.9698, lng: 77.75 },
  { name: "Blinkit JP Nagar", lat: 12.9063, lng: 77.5857 },
  { name: "Blinkit Electronic City", lat: 12.8399, lng: 77.677 },
  { name: "Blinkit Marathahalli", lat: 12.9591, lng: 77.6974 },
];

const zeptoStores = [
  { name: "Zepto HSR Layout", lat: 12.9121, lng: 77.638 },
  { name: "Zepto Koramangala 5th Block", lat: 12.934, lng: 77.62 },
  { name: "Zepto Bellandur", lat: 12.9256, lng: 77.676 },
  { name: "Zepto Sarjapur Road", lat: 12.91, lng: 77.687 },
  { name: "Zepto Hebbal", lat: 13.0358, lng: 77.597 },
  { name: "Zepto Jayanagar", lat: 12.925, lng: 77.5838 },
  { name: "Zepto Yelahanka", lat: 13.1007, lng: 77.5963 },
  { name: "Zepto Bannerghatta Road", lat: 12.8876, lng: 77.6037 },
];

const riskLevels = ["High Risk", "Medium Risk", "Low Risk"] as const;
const riskColors = {
  "High Risk": "#ef4444",
  "Medium Risk": "#eab308",
  "Low Risk": "#22c55e",
};

// indices for which markers get zone circles
const zoneIndices = { blinkit: [0, 1], zepto: [0] };

// Disruption zone center (HSR Layout area)
const disruptionCenter = { lat: 12.913, lng: 77.641 };

export default function MapSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });
  const [mapReady, setMapReady] = useState(false);
  const [showDisruption, setShowDisruption] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const markersAddedRef = useRef(false);

  const simulateDisruption = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setShowToast(true);

    document.querySelectorAll(".custom-marker").forEach((el) => {
      const idx = el.getAttribute("data-index");
      if (idx === "0" || idx === "1") {
        el.classList.add("flash-red");
      }
    });

    setTimeout(() => setShowToast(false), 4000);

    setTimeout(() => {
      document.querySelectorAll(".flash-red").forEach((el) => {
        el.classList.remove("flash-red");
      });
      setIsSimulating(false);
    }, 5000);
  };

  useEffect(() => {
    if (!isInView || !mapRef.current || leafletMapRef.current) return;

    // Dynamic import of Leaflet (client only)
    import("leaflet").then((L) => {
      const map = L.map(mapRef.current!, {
        center: [12.9141, 77.6446],
        zoom: 12,
        zoomControl: true,
        scrollWheelZoom: false,
        dragging: false,
        touchZoom: false,
        doubleClickZoom: false,
        boxZoom: false,
        keyboard: false,
        attributionControl: false,
      });

      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        {
          subdomains: "abcd",
          maxZoom: 19,
        }
      ).addTo(map);

      leafletMapRef.current = map;

      // Wait for tiles to load
      map.whenReady(() => {
        setTimeout(() => setMapReady(true), 500);
      });
    });

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [isInView]);

  // Add markers with animation
  useEffect(() => {
    if (!mapReady || !leafletMapRef.current || markersAddedRef.current) return;
    markersAddedRef.current = true;

    import("leaflet").then((L) => {
      const map = leafletMapRef.current!;
      const allMarkerElements: HTMLElement[] = [];

      const createMarker = (
        store: { name: string; lat: number; lng: number },
        color: string,
        brand: string,
        index: number,
        delay: number,
        showZone: boolean
      ) => {
        const risk =
          riskLevels[Math.floor(Math.random() * riskLevels.length)];
        const riskColor = riskColors[risk];

        // Custom circular marker with pulse
        const markerHtml = `
          <div class="custom-marker" style="position:relative;width:16px;height:16px;" data-index="${index}" data-brand="${brand}">
            <div style="
              position:absolute;inset:0;border-radius:50%;
              background:${color};
              box-shadow:0 0 10px ${color}80;
              opacity:0;
              transform:scale(0);
              animation:marker-pop 0.5s ${delay}ms ease-out forwards;
            "></div>
            <div style="
              position:absolute;inset:-4px;border-radius:50%;
              border:2px solid ${color}60;
              opacity:0;
              animation:marker-pulse-ring 2s ${delay + 500}ms ease-out infinite;
            "></div>
          </div>
        `;

        const icon = L.divIcon({
          html: markerHtml,
          className: "custom-leaflet-marker",
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        });

        const marker = L.marker([store.lat, store.lng], { icon }).addTo(map);

        // Glassmorphism tooltip
        const tooltipContent = `
          <div style="
            background:rgba(15,22,35,0.9);
            backdrop-filter:blur(16px);
            -webkit-backdrop-filter:blur(16px);
            border:1px solid rgba(255,255,255,0.1);
            border-radius:12px;
            padding:12px 16px;
            min-width:180px;
            font-family:Inter,sans-serif;
          ">
            <div style="color:#fff;font-weight:600;font-size:13px;margin-bottom:6px;">${store.name}</div>
            <div style="color:rgba(255,255,255,0.5);font-size:11px;margin-bottom:4px;">Zone radius: 1.5 km delivery zone</div>
            <div style="display:flex;align-items:center;gap:6px;margin-top:4px;">
              <span style="width:8px;height:8px;border-radius:50%;background:${riskColor};display:inline-block;box-shadow:0 0 6px ${riskColor}80;"></span>
              <span style="color:${riskColor};font-size:11px;font-weight:500;">${risk}</span>
            </div>
          </div>
        `;

        marker.bindTooltip(tooltipContent, {
          direction: "top",
          offset: [0, -12],
          opacity: 1,
          className: "glass-tooltip",
        });

        // Track marker element for disruption effect
        const el = marker.getElement();
        if (el) allMarkerElements.push(el);

        // Zone circle for select markers
        if (showZone) {
          setTimeout(() => {
            L.circle([store.lat, store.lng], {
              radius: 1500,
              color: color,
              fillColor: color,
              fillOpacity: 0.06,
              weight: 1,
              opacity: 0.3,
              dashArray: "4 6",
            }).addTo(map);
          }, delay + 800);
        }
      };

      // Add Blinkit markers
      blinkitStores.forEach((store, i) => {
        createMarker(
          store,
          "#ff6b35",
          "blinkit",
          i,
          i * 200,
          zoneIndices.blinkit.includes(i)
        );
      });

      // Add Zepto markers
      zeptoStores.forEach((store, i) => {
        createMarker(
          store,
          "#00d4aa",
          "zepto",
          i,
          (blinkitStores.length + i) * 200,
          zoneIndices.zepto.includes(i)
        );
      });

      // Disruption overlay after all markers appear
      const totalDelay =
        (blinkitStores.length + zeptoStores.length) * 200 + 1000;
      setTimeout(() => {
        // Red/orange gradient pulse overlay
        const disruptionCircle = L.circle(
          [disruptionCenter.lat, disruptionCenter.lng],
          {
            radius: 2500,
            color: "#ef4444",
            fillColor: "#ef4444",
            fillOpacity: 0.0,
            weight: 0,
            className: "disruption-zone",
          }
        ).addTo(map);

        // Animate fill opacity
        let opacity = 0;
        let increasing = true;
        const pulseInterval = setInterval(() => {
          if (increasing) {
            opacity += 0.005;
            if (opacity >= 0.12) increasing = false;
          } else {
            opacity -= 0.003;
            if (opacity <= 0.04) increasing = true;
          }
          disruptionCircle.setStyle({ fillOpacity: opacity });
        }, 50);

        setShowDisruption(true);

        return () => clearInterval(pulseInterval);
      }, totalDelay);
    });
  }, [mapReady]);

  // Inject marker animation styles
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes marker-pop {
        0% { opacity: 0; transform: scale(0); }
        60% { transform: scale(1.3); }
        100% { opacity: 1; transform: scale(1); }
      }
      @keyframes marker-pulse-ring {
        0% { transform: scale(1); opacity: 0.6; }
        100% { transform: scale(2.5); opacity: 0; }
      }
      .custom-leaflet-marker {
        background: transparent !important;
        border: none !important;
      }
      .glass-tooltip {
        background: transparent !important;
        border: none !important;
        box-shadow: none !important;
        padding: 0 !important;
      }
      .glass-tooltip .leaflet-tooltip-arrow { display: none; }
      .disruption-zone {
        filter: blur(8px);
      }
      .flash-red > div:first-child {
        animation: flash-red-bg 0.5s ease-in-out infinite !important;
      }
      .flash-red > div:last-child {
        border-color: #ef4444 !important;
        animation: marker-pulse-ring 0.8s ease-out infinite !important;
      }
      @keyframes flash-red-bg {
        0%, 100% { background: #ef4444 !important; box-shadow: 0 0 15px #ef4444 !important; opacity: 1 !important; transform: scale(1.3) !important; }
        50% { background: #b91c1c !important; box-shadow: 0 0 5px #b91c1c !important; opacity: 1 !important; transform: scale(1.1) !important; }
      }
      .rain-drop {
        position: absolute;
        width: 1.5px;
        height: 15px;
        background: linear-gradient(transparent, rgba(255,255,255,0.7));
        animation: drop-fall linear infinite;
      }
      @keyframes drop-fall {
        to { transform: translateY(600px); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <section
      id="map"
      ref={containerRef}
      className="relative py-20 px-4"
      style={{
        background:
          "linear-gradient(180deg, #0a0f1a 0%, #0d1320 50%, #0a0f1a 100%)",
      }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Map container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
          className="relative rounded-2xl overflow-hidden border border-white/5"
          style={{ boxShadow: "0 0 80px rgba(0,212,170,0.05)" }}
        >
          <div
            ref={mapRef}
            className="w-full"
            style={{ height: "clamp(400px, 60vh, 600px)" }}
          />

          {/* Disruption Simulation UI */}
          <AnimatePresence>
            {showToast && (
              <motion.div
                initial={{ opacity: 0, x: 50, y: -20 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                exit={{ opacity: 0, x: 50, y: -20 }}
                className="absolute top-4 right-4 z-[2000] glass-strong rounded-xl p-4 flex items-center gap-3 w-80 shadow-2xl"
              >
                <div className="text-xl">🛡️</div>
                <div className="text-sm text-white/90 font-medium leading-snug">
                  Disruption detected in HSR Layout — <span className="text-teal font-bold">3 riders auto-compensated</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Rain Overlay */}
          <AnimatePresence>
            {isSimulating && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-[400] overflow-hidden pointer-events-none"
              >
                {Array.from({ length: 80 }).map((_, i) => (
                  <div
                    key={i}
                    className="rain-drop"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `-${Math.random() * 20 + 20}px`,
                      animationDelay: `${Math.random() * 0.5}s`,
                      animationDuration: `${0.4 + Math.random() * 0.3}s`,
                    }}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Simulate Disruption Button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={mapReady ? { opacity: 1, y: 0 } : {}}
            onClick={simulateDisruption}
            disabled={isSimulating}
            className={`absolute bottom-6 right-6 z-[1000] glass border border-teal/20 bg-teal/5 px-5 py-2.5 rounded-full flex items-center gap-2 transition-all duration-300 ${
              isSimulating ? "opacity-0 pointer-events-none" : "hover:bg-teal/20 hover:border-teal/50 hover:scale-105 active:scale-95 text-white shadow-lg shadow-teal/5 cursor-pointer"
            }`}
          >
            <span className="text-lg">⚡</span>
            <span className="text-sm font-semibold tracking-wide">Simulate Disruption</span>
          </motion.button>

          {/* Legend card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={mapReady ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="absolute top-4 right-4 z-[1000] glass rounded-xl p-4"
            style={{ minWidth: 160 }}
          >
            <div className="text-xs text-white/40 uppercase tracking-wider mb-3 font-semibold">
              Legend
            </div>
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-2.5">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{
                    background: "#ff6b35",
                    boxShadow: "0 0 6px #ff6b3580",
                  }}
                />
                <span className="text-xs text-white/60">Blinkit Zones</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{
                    background: "#00d4aa",
                    boxShadow: "0 0 6px #00d4aa80",
                  }}
                />
                <span className="text-xs text-white/60">Zepto Zones</span>
              </div>
              {showDisruption && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2.5"
                >
                  <span className="relative w-2.5 h-2.5">
                    <span
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: "#ef4444",
                        boxShadow: "0 0 6px #ef444480",
                      }}
                    />
                    <span
                      className="absolute inset-[-2px] rounded-full border border-red-500/50"
                      style={{
                        animation:
                          "marker-pulse-ring 2s ease-out infinite",
                      }}
                    />
                  </span>
                  <span className="text-xs text-white/60">
                    Active Disruption
                  </span>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>

        {/* Tagline below map */}
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
      </div>
    </section>
  );
}
