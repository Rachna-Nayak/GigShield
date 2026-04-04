"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  ZONE_OPTIONS,
  PLATFORM_OPTIONS,
  EARNINGS_OPTIONS,
  EXPERIENCE_OPTIONS,
  ZONE_RISKS,
  getWeeklyPremium,
  getCoverageAmount,
} from "@/data/premiums";
import { getRiskColor, getRiskLabel } from "@/data/darkStores";

const analysisPhrases = [
  "Scanning zone disruption history...",
  "Calculating risk exposure...",
  "Generating your policy...",
];

function riskPillColor(level: string) {
  if (level === "high") return { bg: "rgba(239,68,68,0.15)", text: "#ef4444", border: "rgba(239,68,68,0.3)" };
  if (level === "medium") return { bg: "rgba(245,158,11,0.15)", text: "#f59e0b", border: "rgba(245,158,11,0.3)" };
  return { bg: "rgba(16,185,129,0.15)", text: "#10b981", border: "rgba(16,185,129,0.3)" };
}

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [platform, setPlatform] = useState("");
  const [zone, setZone] = useState("");
  const [earnings, setEarnings] = useState("");
  const [experience, setExperience] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [analyisIdx, setAnalysisIdx] = useState(0);

  // Check if already registered
  useEffect(() => {
    const rider = localStorage.getItem("giginsure_rider");
    if (rider) {
      router.replace("/dashboard");
    }
  }, [router]);

  // Cycle through analysis phrases
  useEffect(() => {
    if (!isSubmitting) return;
    const interval = setInterval(() => {
      setAnalysisIdx((prev) => Math.min(prev + 1, analysisPhrases.length - 1));
    }, 700);
    return () => clearInterval(interval);
  }, [isSubmitting]);

  const zoneRisk = zone ? ZONE_RISKS[zone] : null;
  const premium = zone ? getWeeklyPremium(zone) : null;
  const coverage = zone ? getCoverageAmount(zone) : null;

  const isValid = name.trim() && phone.trim() && platform && zone && earnings && experience;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setIsSubmitting(true);

    // Wait for analysis animation
    await new Promise((r) => setTimeout(r, 2200));

    const riderId = `RDR-${Date.now().toString(36).toUpperCase()}`;
    const policyId = `GI-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const now = new Date();
    const endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const rider = {
      riderId,
      name: name.trim(),
      phone: phone.trim(),
      platform,
      zone,
      earnings,
      experience,
      registeredAt: now.toISOString(),
    };

    // PREMIUM FORMULA PENDING — HARDCODED FOR DEMO
    const policy = {
      policyId,
      riderId,
      zone,
      platform,
      weeklyPremium: getWeeklyPremium(zone),
      coverageAmount: getCoverageAmount(zone),
      status: "active",
      startDate: now.toISOString(),
      endDate: endDate.toISOString(),
      triggersEnabled: ["rainfall", "aqi", "trafficSpeed", "storeShutdown", "heatIndex"],
    };

    localStorage.setItem("giginsure_rider", JSON.stringify(rider));
    localStorage.setItem("giginsure_policy", JSON.stringify(policy));
    localStorage.setItem("giginsure_claims", JSON.stringify([]));

    router.push("/policy-confirmation");
  };

  const inputClass =
    "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-teal/50 focus:ring-1 focus:ring-teal/20 transition-all duration-200 placeholder:text-white/20";
  const selectClass =
    "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-teal/50 focus:ring-1 focus:ring-teal/20 transition-all duration-200 appearance-none cursor-pointer";
  const labelClass = "text-xs text-white/50 uppercase tracking-wider font-semibold mb-2 block";

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      {/* Submitting overlay */}
      <AnimatePresence>
        {isSubmitting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-navy/95 backdrop-blur-sm"
          >
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-16 h-16 rounded-full border-2 border-teal/30 flex items-center justify-center mb-6"
            >
              <svg width="32" height="36" viewBox="0 0 64 72" fill="none">
                <path
                  d="M32 4L6 16V36C6 52 18 64 32 68C46 64 58 52 58 36V16L32 4Z"
                  stroke="#00d4aa"
                  strokeWidth="2"
                  fill="rgba(0,212,170,0.1)"
                  className="shield-path"
                />
              </svg>
            </motion.div>
            <motion.p
              key={analyisIdx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-teal text-sm font-medium tracking-wide"
            >
              {analysisPhrases[analyisIdx]}
            </motion.p>
            <div className="flex gap-1 mt-4">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, delay: i * 0.2, repeat: Infinity }}
                  className="w-1.5 h-1.5 rounded-full bg-teal"
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-lg"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-2 text-white font-[var(--font-heading)] text-lg font-bold mb-4">
            <svg width="24" height="28" viewBox="0 0 64 72" fill="none">
              <path d="M32 4L6 16V36C6 52 18 64 32 68C46 64 58 52 58 36V16L32 4Z" stroke="#00d4aa" strokeWidth="3" fill="rgba(0,212,170,0.1)" />
              <path d="M24 36L30 42L42 30" stroke="#00d4aa" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Gig-<span className="text-teal">Insure</span>
          </a>
          <h1 className="font-[var(--font-heading)] text-3xl sm:text-4xl font-bold text-white mt-4 mb-2">
            Protect Your Income
          </h1>
          <p className="text-white/40 text-sm">
            Zone-level parametric insurance in under 60 seconds
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 sm:p-8 space-y-5">
          {/* Name */}
          <div>
            <label className={labelClass}>Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Arjun Kumar"
              className={inputClass}
              required
            />
          </div>

          {/* Phone */}
          <div>
            <label className={labelClass}>Phone Number</label>
            <div className="flex gap-2">
              <div className="flex items-center px-3 bg-white/5 border border-white/10 rounded-xl text-white/50 text-sm">
                +91
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="98765 43210"
                className={inputClass}
                required
              />
            </div>
          </div>

          {/* Platform + Zone row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Platform</label>
              <select value={platform} onChange={(e) => setPlatform(e.target.value)} className={selectClass} required style={{ background: "#0a0f1a" }}>
                <option value="" disabled>Select</option>
                {PLATFORM_OPTIONS.map((p) => (
                  <option key={p} value={p} style={{ background: "#0f1623" }}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Delivery Zone</label>
              <select value={zone} onChange={(e) => setZone(e.target.value)} className={selectClass} required style={{ background: "#0a0f1a" }}>
                <option value="" disabled>Select zone</option>
                {ZONE_OPTIONS.map((z) => (
                  <option key={z} value={z} style={{ background: "#0f1623" }}>{z}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Earnings + Experience row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Avg Daily Earnings</label>
              <select value={earnings} onChange={(e) => setEarnings(e.target.value)} className={selectClass} required style={{ background: "#0a0f1a" }}>
                <option value="" disabled>Select</option>
                {EARNINGS_OPTIONS.map((e) => (
                  <option key={e} value={e} style={{ background: "#0f1623" }}>{e}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Years on Platform</label>
              <select value={experience} onChange={(e) => setExperience(e.target.value)} className={selectClass} required style={{ background: "#0a0f1a" }}>
                <option value="" disabled>Select</option>
                {EXPERIENCE_OPTIONS.map((e) => (
                  <option key={e} value={e} style={{ background: "#0f1623" }}>{e}</option>
                ))}
              </select>
            </div>
          </div>

          {/* ─── Zone Risk Preview ─────────────────────────────── */}
          <AnimatePresence>
            {zoneRisk && premium !== null && coverage !== null && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: "auto", marginTop: 20 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <div className="glass-strong rounded-xl p-5 border border-teal/10">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] uppercase tracking-widest text-white/40 font-semibold">
                      AI Risk Analysis
                    </span>
                    <span
                      className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                      style={{
                        background: `${getRiskColor(zoneRisk.riskScore)}20`,
                        color: getRiskColor(zoneRisk.riskScore),
                        border: `1px solid ${getRiskColor(zoneRisk.riskScore)}30`,
                      }}
                    >
                      {getRiskLabel(zoneRisk.riskScore)}
                    </span>
                  </div>

                  {/* Risk factor pills */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {(["floodRisk", "trafficRisk", "pollutionRisk"] as const).map((key) => {
                      const level = zoneRisk[key];
                      const colors = riskPillColor(level);
                      const labels = { floodRisk: "🌧 Flood", trafficRisk: "🚦 Traffic", pollutionRisk: "💨 Pollution" };
                      return (
                        <span
                          key={key}
                          className="text-[11px] font-medium px-2.5 py-1 rounded-full"
                          style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}
                        >
                          {labels[key]}: {level}
                        </span>
                      );
                    })}
                  </div>

                  {/* Premium + Coverage */}
                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-white/5">
                    <div>
                      <div className="text-[10px] text-white/40 mb-1">Weekly Premium</div>
                      <div className="font-[var(--font-heading)] text-2xl font-bold text-teal">
                        ₹{premium}<span className="text-sm text-white/30 font-normal">/week</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-white/40 mb-1">Coverage</div>
                      <div className="font-[var(--font-heading)] text-2xl font-bold text-white">
                        ₹{coverage.toLocaleString()}<span className="text-sm text-white/30 font-normal">/week</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={!isValid || isSubmitting}
            whileHover={isValid ? { scale: 1.02 } : {}}
            whileTap={isValid ? { scale: 0.98 } : {}}
            className={`w-full py-3.5 rounded-xl text-sm font-semibold tracking-wide transition-all duration-300 cursor-pointer ${
              isValid
                ? "bg-teal text-navy hover:shadow-lg hover:shadow-teal/20"
                : "bg-white/5 text-white/20 cursor-not-allowed"
            }`}
          >
            Get Protected →
          </motion.button>

          <p className="text-center text-[11px] text-white/20 mt-2">
            No documents needed · Instant activation · Cancel anytime
          </p>
        </form>
      </motion.div>
    </div>
  );
}
