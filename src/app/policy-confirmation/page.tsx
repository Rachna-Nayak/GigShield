"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

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

interface RiderData {
  name: string;
  phone: string;
  platform: string;
  zone: string;
}

const coverageItems = [
  { icon: "🌧", title: "Flood & Heavy Rain", desc: "Auto-triggered when rainfall exceeds 60mm/hr in your zone" },
  { icon: "🏪", title: "Dark Store Shutdown", desc: "Coverage when your assigned store goes offline >60 min" },
  { icon: "💨", title: "Severe Pollution", desc: "Protected when AQI exceeds 350 in your delivery area" },
];

export default function PolicyConfirmationPage() {
  const router = useRouter();
  const [rider, setRider] = useState<RiderData | null>(null);
  const [policy, setPolicy] = useState<PolicyData | null>(null);
  const [showCheck, setShowCheck] = useState(false);

  useEffect(() => {
    const riderStr = localStorage.getItem("giginsure_rider");
    const policyStr = localStorage.getItem("giginsure_policy");
    if (!riderStr || !policyStr) {
      router.replace("/register");
      return;
    }
    setRider(JSON.parse(riderStr));
    setPolicy(JSON.parse(policyStr));
    setTimeout(() => setShowCheck(true), 300);
  }, [router]);

  if (!rider || !policy) return null;

  const startDate = new Date(policy.startDate);
  const endDate = new Date(policy.endDate);
  const platformColor = rider.platform === "Blinkit" ? "#ff6b35" : rider.platform === "Zepto" ? "#00d4aa" : "#0ea5e9";

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-lg"
      >
        {/* Animated shield checkmark */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4"
            style={{ background: "rgba(0,212,170,0.1)", border: "2px solid rgba(0,212,170,0.3)" }}
          >
            <AnimatedCheckmark show={showCheck} />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="font-[var(--font-heading)] text-3xl sm:text-4xl font-bold text-white mb-2"
          >
            You&apos;re Protected, {rider.name.split(" ")[0]}!
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{ delay: 0.7 }}
            className="text-sm text-white/40"
          >
            Your parametric insurance policy is now active
          </motion.p>
        </div>

        {/* Policy Card */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="glass-strong rounded-2xl p-6 sm:p-8 mb-6 relative overflow-hidden"
        >
          {/* Top accent line */}
          <div className="absolute top-0 left-0 right-0 h-1" style={{ background: "linear-gradient(90deg, #00d4aa, #0ea5e9)" }} />

          {/* Policy header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-[10px] text-white/30 uppercase tracking-widest font-semibold mb-1">Policy ID</div>
              <div className="font-[var(--font-heading)] text-lg font-bold text-white tracking-wide">{policy.policyId}</div>
            </div>
            <span className="text-[11px] font-bold px-3 py-1.5 rounded-full bg-green-500/15 text-green-400 border border-green-500/25">
              ● ACTIVE
            </span>
          </div>

          {/* Rider info */}
          <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-white/5">
            <div>
              <div className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Rider</div>
              <div className="text-sm text-white font-medium">{rider.name}</div>
            </div>
            <div>
              <div className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Platform</div>
              <span
                className="text-[11px] font-semibold px-2.5 py-1 rounded-full inline-block"
                style={{ background: `${platformColor}15`, color: platformColor, border: `1px solid ${platformColor}25` }}
              >
                {rider.platform}
              </span>
            </div>
            <div>
              <div className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Zone</div>
              <div className="text-sm text-white font-medium">{policy.zone}</div>
            </div>
            <div>
              <div className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Coverage Period</div>
              <div className="text-sm text-white/70">
                {startDate.toLocaleDateString("en-IN", { day: "numeric", month: "short" })} — {endDate.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </div>
            </div>
          </div>

          {/* Premium + Coverage */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Weekly Premium</div>
              {/* PREMIUM FORMULA PENDING — HARDCODED FOR DEMO */}
              <div className="font-[var(--font-heading)] text-3xl font-bold text-teal">
                ₹{policy.weeklyPremium}<span className="text-sm text-white/30 font-normal">/wk</span>
              </div>
            </div>
            <div>
              <div className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Coverage Amount</div>
              <div className="font-[var(--font-heading)] text-3xl font-bold text-white">
                ₹{policy.coverageAmount.toLocaleString()}
              </div>
            </div>
          </div>

          {/* AI badge */}
          <div className="flex items-center gap-2 pt-4 border-t border-white/5">
            <div className="w-1.5 h-1.5 rounded-full bg-teal animate-pulse" />
            <span className="text-[10px] text-white/30 tracking-wider">Powered by AI Risk Engine · Multi-source validation</span>
          </div>
        </motion.div>

        {/* Coverage highlights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.5 }}
          className="grid grid-cols-3 gap-3 mb-8"
        >
          {coverageItems.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 + i * 0.15 }}
              className="glass rounded-xl p-4 text-center cursor-default group hover:bg-white/[0.06] transition-colors"
            >
              <div className="text-2xl mb-2">{item.icon}</div>
              <div className="text-xs font-semibold text-white mb-1">{item.title}</div>
              <div className="text-[10px] text-white/30 leading-relaxed">{item.desc}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3 }}
          className="text-center"
        >
          <motion.button
            onClick={() => router.push("/dashboard")}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3.5 bg-teal text-navy rounded-xl text-sm font-semibold tracking-wide hover:shadow-lg hover:shadow-teal/20 transition-all cursor-pointer"
          >
            View My Dashboard →
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
}

function AnimatedCheckmark({ show }: { show: boolean }) {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <motion.path
        d="M10 18L16 24L28 12"
        stroke="#00d4aa"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={show ? { pathLength: 1 } : {}}
        transition={{ delay: 0.4, duration: 0.5, ease: "easeOut" }}
      />
    </svg>
  );
}
