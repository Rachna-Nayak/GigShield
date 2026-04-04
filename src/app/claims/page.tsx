"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

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

export default function ClaimsPage() {
  const router = useRouter();
  const [claims, setClaims] = useState<ClaimData[]>([]);
  const [riderName, setRiderName] = useState("");

  useEffect(() => {
    const riderStr = localStorage.getItem("giginsure_rider");
    const claimsStr = localStorage.getItem("giginsure_claims");
    if (!riderStr) {
      router.replace("/register");
      return;
    }
    const rider = JSON.parse(riderStr);
    setRiderName(rider.name);
    setClaims(claimsStr ? JSON.parse(claimsStr) : []);
  }, [router]);

  const totalPayout = claims.reduce((s, c) => s + c.payoutAmount, 0);
  const avgProcessing = claims.length > 0
    ? (claims.reduce((s, c) => s + c.processingTimeSeconds, 0) / claims.length).toFixed(1)
    : "0";

  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <a href="/dashboard" className="text-white/30 hover:text-teal transition-colors text-sm">
              ← Dashboard
            </a>
          </div>
          <h1 className="font-[var(--font-heading)] text-2xl sm:text-3xl font-bold text-white mb-1">
            Claims History
          </h1>
          <p className="text-sm text-white/40">
            All parametric claims for {riderName}
          </p>
        </motion.div>

        {/* Summary Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-4 mb-8"
        >
          <div className="glass rounded-xl p-5 text-center">
            <div className="text-[10px] text-white/40 uppercase tracking-wider font-semibold mb-2">
              Total Claims
            </div>
            <div className="font-[var(--font-heading)] text-3xl font-bold text-white">
              {claims.length}
            </div>
          </div>
          <div className="glass rounded-xl p-5 text-center">
            <div className="text-[10px] text-white/40 uppercase tracking-wider font-semibold mb-2">
              Total Payout
            </div>
            <div className="font-[var(--font-heading)] text-3xl font-bold text-green-400">
              ₹{totalPayout.toLocaleString()}
            </div>
          </div>
          <div className="glass rounded-xl p-5 text-center">
            <div className="text-[10px] text-white/40 uppercase tracking-wider font-semibold mb-2">
              Avg Response Time
            </div>
            <div className="font-[var(--font-heading)] text-3xl font-bold text-teal">
              &lt; 8s
            </div>
            <div className="text-[10px] text-white/20 mt-1">
              vs weeks for traditional insurance
            </div>
          </div>
        </motion.div>

        {/* Differentiator callout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass rounded-xl p-4 mb-8 flex items-center gap-4 border border-teal/10"
        >
          <div className="w-10 h-10 rounded-xl bg-teal/10 flex items-center justify-center flex-shrink-0">
            <span className="text-lg">⚡</span>
          </div>
          <div>
            <div className="text-sm text-white font-medium mb-0.5">
              Zero paperwork. Zero wait. Automatic.
            </div>
            <div className="text-[11px] text-white/30">
              Traditional insurance takes 2-4 weeks to process a claim. Gig-Insure does it in under 8 seconds with AI-powered parametric triggers and multi-source validation.
            </div>
          </div>
        </motion.div>

        {/* Claims List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-2xl p-6"
        >
          {claims.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-4xl mb-4">🛡️</div>
              <div className="font-[var(--font-heading)] text-lg text-white/50 font-semibold mb-2">
                No claims yet
              </div>
              <div className="text-sm text-white/25 max-w-sm mx-auto">
                You&apos;re protected against zone disruptions. When a parametric trigger fires, your claim will be processed automatically — no action needed from you.
              </div>
              <a
                href="/dashboard"
                className="inline-block mt-6 text-sm text-teal hover:text-teal/80 transition-colors font-medium"
              >
                ← Back to Dashboard
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              {claims.map((claim, i) => {
                const date = new Date(claim.timestamp);
                return (
                  <motion.div
                    key={claim.claimId}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 + i * 0.1 }}
                    className="rounded-xl bg-white/[0.03] border border-white/5 p-5 hover:bg-white/[0.05] transition-colors"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-green-500/10 flex items-center justify-center text-xl">
                          💰
                        </div>
                        <div>
                          <div className="text-sm text-white font-semibold">{claim.disruptionType}</div>
                          <div className="text-[10px] text-white/30 mt-0.5">{claim.claimId}</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                        PAID
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-[10px] text-white/30 mb-1">Date & Time</div>
                        <div className="text-white/70">
                          {date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          <br />
                          <span className="text-white/40">{date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-white/30 mb-1">Zone</div>
                        <div className="text-white/70">{claim.zone}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-white/30 mb-1">Hours Lost</div>
                        <div className="text-white/70">{claim.hoursLost} hours</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-white/30 mb-1">Payout</div>
                        <div className="font-[var(--font-heading)] text-xl font-bold text-green-400">
                          ₹{claim.payoutAmount}
                        </div>
                      </div>
                    </div>

                    {/* Trigger values */}
                    <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-3 flex-wrap">
                      <span className="text-[10px] text-white/25">Triggers:</span>
                      {Object.entries(claim.triggerValues).map(([key, val]) => {
                        const labels: Record<string, string> = {
                          rainfall: "🌧 Rainfall",
                          trafficSpeed: "🚦 Traffic",
                          aqi: "💨 AQI",
                          heatIndex: "🌡 Heat",
                        };
                        const units: Record<string, string> = {
                          rainfall: "mm/hr",
                          trafficSpeed: "km/h",
                          aqi: "",
                          heatIndex: "°C",
                        };
                        return (
                          <span
                            key={key}
                            className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/15 font-medium"
                          >
                            {labels[key] || key}: {val}{units[key] || ""}
                          </span>
                        );
                      })}
                      <span className="text-[10px] text-white/20 ml-auto">
                        Processed in {claim.processingTimeSeconds}s
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
