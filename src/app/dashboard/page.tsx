"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { getRiskColor, getRiskLabel } from "@/data/darkStores";
import { PARAMETRIC_TRIGGERS } from "@/services/triggerEngine";
import { getEarningsMidpoint, ZONE_RISKS } from "@/data/premiums";

// ─── Types ───────────────────────────────────────────────────
interface RiderData {
  riderId: string;
  name: string;
  phone: string;
  platform: string;
  zone: string;
  earnings: string;
  experience: string;
}

interface PolicyData {
  policyId: string;
  riderId: string;
  zone: string;
  platform: string;
  weeklyPremium: number;
  coverageAmount: number;
  status: string;
  startDate: string;
  endDate: string;
}

interface ClaimData {
  claimId: string;
  policyId: string;
  zone: string;
  disruptionType: string;
  triggerValues: Record<string, number>;
  hoursLost: number;
  payoutAmount: number;
  status: string;
  autoApproved: boolean;
  processingTimeSeconds: number;
  timestamp: string;
}

interface SensorData {
  rainfall: number;
  aqi: number;
  trafficSpeed: number;
  heatIndex: number;
  storeOnline: boolean;
}

// ─── Component ───────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();
  const [rider, setRider] = useState<RiderData | null>(null);
  const [policy, setPolicy] = useState<PolicyData | null>(null);
  const [claims, setClaims] = useState<ClaimData[]>([]);
  const [sensors, setSensors] = useState<SensorData>({
    rainfall: 12.4,
    aqi: 142,
    trafficSpeed: 18.5,
    heatIndex: 33.2,
    storeOnline: true,
  });
  const [triggerStates, setTriggerStates] = useState<Record<string, "clear" | "warning" | "triggered">>({
    rainfall: "clear",
    aqi: "clear",
    trafficSpeed: "clear",
    heatIndex: "clear",
    storeShutdown: "clear",
  });
  const [isSimulating, setIsSimulating] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [claimStep, setClaimStep] = useState(0);
  const [claimSuccess, setClaimSuccess] = useState(false);
  const [claimTimer, setClaimTimer] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [payoutAmount, setPayoutAmount] = useState(0);
  const [newClaimId, setNewClaimId] = useState("");
  const [flashSensor, setFlashSensor] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ─── Load from localStorage ────────────────────────────────
  useEffect(() => {
    const riderStr = localStorage.getItem("giginsure_rider");
    const policyStr = localStorage.getItem("giginsure_policy");
    const claimsStr = localStorage.getItem("giginsure_claims");

    if (!riderStr || !policyStr) {
      router.replace("/register");
      return;
    }

    setRider(JSON.parse(riderStr));
    setPolicy(JSON.parse(policyStr));
    setClaims(claimsStr ? JSON.parse(claimsStr) : []);
  }, [router]);

  // ─── Sensor refresh (safe values before disruption) ────────
  const refreshSensors = useCallback(() => {
    if (isSimulating) return;
    setSensors({
      rainfall: parseFloat((8 + Math.random() * 15).toFixed(1)),
      aqi: Math.round(90 + Math.random() * 80),
      trafficSpeed: parseFloat((14 + Math.random() * 12).toFixed(1)),
      heatIndex: parseFloat((30 + Math.random() * 5).toFixed(1)),
      storeOnline: true,
    });
  }, [isSimulating]);

  useEffect(() => {
    if (!policy) return;
    refreshSensors();
    const interval = setInterval(refreshSensors, 5000);
    return () => clearInterval(interval);
  }, [policy, refreshSensors]);

  // ─── Disruption Simulation ─────────────────────────────────
  const simulateDisruption = () => {
    if (isSimulating || !rider || !policy) return;
    setIsSimulating(true);
    setClaimStep(0);
    setClaimSuccess(false);

    // Compute payout
    const dailyEarnings = getEarningsMidpoint(rider.earnings);
    const hoursLost = 3;
    const raw = (dailyEarnings / 9) * hoursLost;
    const payout = Math.round(raw / 10) * 10;
    setPayoutAmount(payout);
    const clmId = `CLM-${Math.floor(100000 + Math.random() * 900000)}`;
    setNewClaimId(clmId);

    // Start live timer
    setClaimTimer(0);
    timerRef.current = setInterval(() => {
      setClaimTimer((prev) => parseFloat((prev + 0.1).toFixed(1)));
    }, 100);

    // 0.0s — Rainfall jumps, traffic drops
    setSensors({
      rainfall: 95,
      aqi: 142,
      trafficSpeed: 2,
      heatIndex: 33.2,
      storeOnline: true,
    });
    setFlashSensor("rainfall");

    // 0.5s — Rainfall trigger fires
    setTimeout(() => {
      setTriggerStates((prev) => ({ ...prev, rainfall: "triggered" }));
      setFlashSensor("trafficSpeed");
    }, 500);

    // 1.0s — Traffic trigger fires
    setTimeout(() => {
      setTriggerStates((prev) => ({ ...prev, trafficSpeed: "triggered" }));
    }, 1000);

    // 1.5s — Alert banner
    setTimeout(() => {
      setShowBanner(true);
    }, 1500);

    // 2.5s — AI Claim modal
    setTimeout(() => {
      setShowClaimModal(true);
      // Animate claim steps
      const steps = [0, 1, 2, 3, 4, 5];
      steps.forEach((step, i) => {
        setTimeout(() => setClaimStep(step + 1), i * 350);
      });
    }, 2500);

    // 4.5s — Success state
    setTimeout(() => {
      setClaimSuccess(true);
      if (timerRef.current) clearInterval(timerRef.current);
    }, 4700);

    // 5.5s — Close modal, update dashboard
    setTimeout(() => {
      setShowClaimModal(false);
      setShowBanner(false);

      // Create claim object
      const claim: ClaimData = {
        claimId: clmId,
        policyId: policy.policyId,
        zone: rider.zone,
        disruptionType: "Heavy Rainfall + Traffic Gridlock",
        triggerValues: { rainfall: 95, trafficSpeed: 2 },
        hoursLost: 3,
        payoutAmount: payout,
        status: "paid",
        autoApproved: true,
        processingTimeSeconds: parseFloat((6 + Math.random() * 3).toFixed(1)),
        timestamp: new Date().toISOString(),
      };

      const updatedClaims = [...claims, claim];
      setClaims(updatedClaims);
      localStorage.setItem("giginsure_claims", JSON.stringify(updatedClaims));

      // Toast
      setToastMessage(`💰 ₹${payout} has been credited to your UPI wallet`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);

      // Reset triggers & sensors after a delay
      setTimeout(() => {
        setTriggerStates({
          rainfall: "clear",
          aqi: "clear",
          trafficSpeed: "clear",
          heatIndex: "clear",
          storeShutdown: "clear",
        });
        setIsSimulating(false);
        setFlashSensor(null);
        refreshSensors();
      }, 2000);
    }, 5800);
  };

  if (!rider || !policy) return null;

  const zoneRisk = ZONE_RISKS[rider.zone] || ZONE_RISKS["HSR Layout"];
  const riskColor = getRiskColor(zoneRisk.riskScore);
  const riskLabel = getRiskLabel(zoneRisk.riskScore);
  const daysLeft = Math.max(0, Math.ceil((new Date(policy.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
  const platformColor = rider.platform === "Blinkit" ? "#ff6b35" : rider.platform === "Zepto" ? "#00d4aa" : "#0ea5e9";

  const triggerRows = [
    { key: "rainfall", label: "🌧 Heavy Rainfall", value: sensors.rainfall, unit: "mm/hr", threshold: PARAMETRIC_TRIGGERS.rainfall.threshold, inverse: false },
    { key: "aqi", label: "💨 Severe Pollution", value: sensors.aqi, unit: "AQI", threshold: PARAMETRIC_TRIGGERS.aqi.threshold, inverse: false },
    { key: "trafficSpeed", label: "🚦 Traffic Gridlock", value: sensors.trafficSpeed, unit: "km/h", threshold: PARAMETRIC_TRIGGERS.trafficSpeed.threshold, inverse: true },
    { key: "heatIndex", label: "🌡 Extreme Heat", value: sensors.heatIndex, unit: "°C", threshold: PARAMETRIC_TRIGGERS.heatIndex.threshold, inverse: false },
    { key: "storeShutdown", label: "🏪 Store Shutdown", value: sensors.storeOnline ? 0 : 60, unit: "min", threshold: 60, inverse: false },
  ];

  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      {/* ─── Toast ─────────────────────────────────────────── */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-[9999] glass-strong rounded-xl px-6 py-3 shadow-2xl border border-teal/20"
          >
            <span className="text-sm text-white font-medium">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Alert Banner ──────────────────────────────────── */}
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ opacity: 0, y: -60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -60 }}
            className="fixed top-16 left-0 right-0 z-[9990] px-4"
          >
            <div className="max-w-5xl mx-auto bg-red-500/90 backdrop-blur-sm rounded-xl px-6 py-3 flex items-center gap-3 shadow-2xl"
              style={{ animation: "pulse-glow 2s ease-in-out infinite" }}
            >
              <span className="text-lg">⚠️</span>
              <span className="text-sm text-white font-medium">
                Zone Disruption Detected in <strong>{rider.zone}</strong> — Heavy rainfall (95mm/hr) has halted delivery operations
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── AI Claim Modal ────────────────────────────────── */}
      <AnimatePresence>
        {showClaimModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9995] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-strong rounded-2xl p-8 w-full max-w-md border border-white/10 shadow-2xl"
            >
              {!claimSuccess ? (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-[var(--font-heading)] text-lg font-bold text-white">
                      🤖 AI Claim Engine Activated
                    </h3>
                    <span className="text-xs font-mono text-teal bg-teal/10 px-2 py-1 rounded-lg">
                      {claimTimer.toFixed(1)}s
                    </span>
                  </div>
                  <div className="space-y-3">
                    {[
                      "Disruption event confirmed across 3 data sources",
                      `Active policy verified — ${policy.policyId}`,
                      "Estimated downtime: 3 hours",
                      `Income loss calculated: ₹${payoutAmount}`,
                      "Fraud check passed — location validated",
                      "Claim approved automatically",
                    ].map((text, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={claimStep > i ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.3 }}
                        className="flex items-start gap-3"
                      >
                        <span className={`text-sm mt-0.5 ${claimStep > i ? "text-green-400" : "text-white/20"}`}>
                          {claimStep > i ? "✓" : "○"}
                        </span>
                        <span className={`text-sm ${claimStep > i ? "text-white/80" : "text-white/20"}`}>
                          {text}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                  {/* Data sources */}
                  <div className="mt-6 pt-4 border-t border-white/5">
                    <div className="text-[10px] text-white/30 uppercase tracking-wider mb-2 font-semibold">Multi-Source Validation</div>
                    <div className="flex gap-2">
                      {["Weather API", "Traffic API", "Store Status API"].map((src, i) => (
                        <motion.span
                          key={src}
                          initial={{ opacity: 0 }}
                          animate={claimStep > i + 1 ? { opacity: 1 } : {}}
                          className="text-[10px] px-2 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 font-medium"
                        >
                          {src} ✓
                        </motion.span>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-4"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="w-16 h-16 rounded-full bg-green-500/15 border-2 border-green-500/30 flex items-center justify-center mx-auto mb-4"
                  >
                    <svg width="32" height="32" viewBox="0 0 36 36" fill="none">
                      <motion.path
                        d="M10 18L16 24L28 12"
                        stroke="#22c55e"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                      />
                    </svg>
                  </motion.div>
                  <div className="font-[var(--font-heading)] text-3xl font-bold text-green-400 mb-1">
                    ₹{payoutAmount} Credited
                  </div>
                  <div className="text-sm text-white/50 mb-1">to Your Wallet</div>
                  <div className="text-xs text-white/30 mb-4">Claim ID: {newClaimId}</div>
                  <div className="flex items-center justify-center gap-2 text-xs text-white/30">
                    <span className="text-teal font-mono">{claimTimer.toFixed(1)}s</span>
                    <span>· Zero paperwork · Zero wait · Automatic</span>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-5xl mx-auto">
        {/* ─── Header ──────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="font-[var(--font-heading)] text-2xl sm:text-3xl font-bold text-white mb-1">
              Welcome, {rider.name.split(" ")[0]}
            </h1>
            <div className="flex items-center gap-2 text-sm text-white/40">
              <span
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={{ background: `${platformColor}15`, color: platformColor, border: `1px solid ${platformColor}25` }}
              >
                {rider.platform}
              </span>
              <span>·</span>
              <span>{rider.zone}</span>
            </div>
          </div>
          {/* Simulate button — visible for demo */}
          <motion.button
            onClick={simulateDisruption}
            disabled={isSimulating}
            whileHover={!isSimulating ? { scale: 1.03 } : {}}
            whileTap={!isSimulating ? { scale: 0.97 } : {}}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              isSimulating
                ? "bg-red-500/20 text-red-400 border border-red-500/30 cursor-not-allowed"
                : "bg-teal/10 text-teal border border-teal/20 hover:bg-teal/20 hover:shadow-lg hover:shadow-teal/10"
            }`}
          >
            <span className="text-lg">⚡</span>
            {isSimulating ? "Disruption Active..." : "Simulate Zone Disruption"}
          </motion.button>
        </motion.div>

        {/* ─── Stats Row ───────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {/* Active Coverage */}
          <div className="glass rounded-xl p-5">
            <div className="text-[10px] text-white/40 uppercase tracking-wider font-semibold mb-2">Active Coverage</div>
            <div className="font-[var(--font-heading)] text-2xl font-bold text-white">
              ₹{policy.coverageAmount.toLocaleString()}<span className="text-xs text-white/30 font-normal">/wk</span>
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[10px] text-green-400 font-medium">Protected</span>
            </div>
          </div>

          {/* Premium */}
          <div className="glass rounded-xl p-5">
            <div className="text-[10px] text-white/40 uppercase tracking-wider font-semibold mb-2">Weekly Premium</div>
            {/* PREMIUM FORMULA PENDING — HARDCODED FOR DEMO */}
            <div className="font-[var(--font-heading)] text-2xl font-bold text-teal">
              ₹{policy.weeklyPremium}
            </div>
            <div className="text-[10px] text-white/30 mt-2">Due in {daysLeft} days</div>
          </div>

          {/* Claims */}
          <div className="glass rounded-xl p-5">
            <div className="text-[10px] text-white/40 uppercase tracking-wider font-semibold mb-2">Claims This Month</div>
            <div className="font-[var(--font-heading)] text-2xl font-bold text-white">
              {claims.length}
            </div>
            <div className="text-[10px] text-white/30 mt-2">
              {claims.length === 0 ? "No claims yet" : `₹${claims.reduce((s, c) => s + c.payoutAmount, 0)} total`}
            </div>
          </div>

          {/* Zone Risk */}
          <div className="glass rounded-xl p-5">
            <div className="text-[10px] text-white/40 uppercase tracking-wider font-semibold mb-2">Zone Risk Today</div>
            <span
              className="text-sm font-bold px-3 py-1.5 rounded-full inline-block"
              style={{ background: `${riskColor}15`, color: riskColor, border: `1px solid ${riskColor}30` }}
            >
              {riskLabel}
            </span>
            <div className="text-[10px] text-white/30 mt-2">{rider.zone}</div>
          </div>
        </motion.div>

        {/* ─── Two Columns ─────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* LEFT — Active Policy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-2xl p-6"
          >
            <h3 className="font-[var(--font-heading)] text-sm font-bold text-white/50 uppercase tracking-wider mb-4">
              Your Active Policy
            </h3>

            <div className="flex items-center justify-between mb-4">
              <div className="font-[var(--font-heading)] text-lg font-bold text-white">{policy.policyId}</div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-green-500/15 text-green-400 border border-green-500/20">
                ACTIVE
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
              <div>
                <div className="text-[10px] text-white/30 mb-1">Coverage</div>
                <div className="text-white font-semibold">₹{policy.coverageAmount.toLocaleString()}/wk</div>
              </div>
              <div>
                <div className="text-[10px] text-white/30 mb-1">Premium</div>
                {/* PREMIUM FORMULA PENDING — HARDCODED FOR DEMO */}
                <div className="text-teal font-semibold">₹{policy.weeklyPremium}/wk</div>
              </div>
            </div>

            {/* Coverage timeline */}
            <div className="mb-4">
              <div className="flex justify-between text-[10px] text-white/30 mb-2">
                <span>Coverage Period</span>
                <span>{daysLeft} days left</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: "linear-gradient(90deg, #00d4aa, #0ea5e9)", width: `${((7 - daysLeft) / 7) * 100}%` }}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(5, ((7 - daysLeft) / 7) * 100)}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
            </div>

            <button
              onClick={() => {
                setToastMessage("✅ Coverage auto-renews weekly");
                setShowToast(true);
                setTimeout(() => setShowToast(false), 3000);
              }}
              className="w-full py-2.5 rounded-xl text-xs font-semibold bg-white/5 text-white/50 border border-white/5 hover:bg-white/10 hover:text-white/80 transition-all cursor-pointer"
            >
              Renew Coverage
            </button>
          </motion.div>

          {/* RIGHT — Zone Live Monitor */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-[var(--font-heading)] text-sm font-bold text-white/50 uppercase tracking-wider">
                Zone Live Monitor
              </h3>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-[10px] text-white/30">LIVE</span>
              </div>
            </div>

            <div className="text-[10px] text-white/20 mb-4 italic">
              Monitoring <span className="text-white/40 font-medium">{rider.zone}</span> specifically — not all of Bangalore
            </div>

            {/* Sensor readings */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              {[
                { icon: "🌧", label: "Rainfall", value: sensors.rainfall, unit: "mm/hr", key: "rainfall" },
                { icon: "💨", label: "AQI", value: sensors.aqi, unit: "", key: "aqi" },
                { icon: "🚦", label: "Traffic", value: sensors.trafficSpeed, unit: "km/h", key: "trafficSpeed" },
                { icon: "🌡", label: "Heat", value: sensors.heatIndex, unit: "°C", key: "heatIndex" },
              ].map((s) => (
                <div
                  key={s.key}
                  className={`rounded-lg p-3 transition-all duration-300 ${
                    flashSensor === s.key ? "bg-red-500/10 border border-red-500/20" : "bg-white/[0.03] border border-white/5"
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-sm">{s.icon}</span>
                    <span className="text-[10px] text-white/40">{s.label}</span>
                  </div>
                  <div className={`font-[var(--font-heading)] text-lg font-bold ${
                    flashSensor === s.key ? "text-red-400" : "text-white"
                  }`}>
                    {s.value}{s.unit && <span className="text-xs text-white/30 font-normal ml-1">{s.unit}</span>}
                  </div>
                </div>
              ))}
            </div>

            {/* Store status */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] border border-white/5 mb-5">
              <div className="flex items-center gap-2">
                <span className="text-sm">🏪</span>
                <span className="text-xs text-white/50">Dark Store Status</span>
              </div>
              <span className={`text-xs font-semibold ${sensors.storeOnline ? "text-green-400" : "text-red-400"}`}>
                {sensors.storeOnline ? "🟢 Online" : "🔴 Offline"}
              </span>
            </div>

            {/* Parametric Triggers */}
            <div>
              <div className="text-[10px] text-white/30 uppercase tracking-wider font-semibold mb-3">
                Parametric Triggers
              </div>
              <div className="space-y-2">
                {triggerRows.map((row) => {
                  const state = triggerStates[row.key] || "clear";
                  const chipColors = {
                    clear: { bg: "rgba(16,185,129,0.1)", text: "#10b981", border: "rgba(16,185,129,0.2)" },
                    warning: { bg: "rgba(245,158,11,0.1)", text: "#f59e0b", border: "rgba(245,158,11,0.2)" },
                    triggered: { bg: "rgba(239,68,68,0.15)", text: "#ef4444", border: "rgba(239,68,68,0.3)" },
                  }[state];
                  return (
                    <div
                      key={row.key}
                      className={`flex items-center justify-between p-2.5 rounded-lg transition-all duration-300 ${
                        state === "triggered" ? "bg-red-500/5 border border-red-500/10" : "bg-white/[0.02]"
                      }`}
                    >
                      <span className="text-xs text-white/60">{row.label}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-white/30 font-mono">
                          {row.value}{row.unit} / {row.inverse ? "≤" : "≥"}{row.threshold}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            state === "triggered" ? "animate-pulse" : ""
                          }`}
                          style={{ background: chipColors.bg, color: chipColors.text, border: `1px solid ${chipColors.border}` }}
                        >
                          {state.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>

        {/* ─── Claims History ──────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-[var(--font-heading)] text-sm font-bold text-white/50 uppercase tracking-wider">
              Claims History
            </h3>
            <a href="/claims" className="text-[11px] text-teal hover:text-teal/80 transition-colors">
              View All →
            </a>
          </div>

          {claims.length === 0 ? (
            <div className="text-center py-10">
              <div className="text-3xl mb-3">🛡️</div>
              <div className="text-sm text-white/30">No claims yet — you&apos;re protected if disruption hits</div>
            </div>
          ) : (
            <div className="space-y-3">
              {claims.map((claim) => (
                <motion.div
                  key={claim.claimId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/5"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400 text-lg">
                      💰
                    </div>
                    <div>
                      <div className="text-sm text-white font-medium">{claim.disruptionType}</div>
                      <div className="text-[10px] text-white/30 mt-0.5">
                        {claim.claimId} · {new Date(claim.timestamp).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })} · {claim.hoursLost}h lost
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-[var(--font-heading)] text-lg font-bold text-green-400">₹{claim.payoutAmount}</div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                      PAID
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

    </div>
  );
}
