"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";

function CountUp({
  end,
  prefix = "",
  suffix = "",
  duration = 2,
  decimals = 0,
}: {
  end: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  decimals?: number;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (!inView) return;
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(eased * end);
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [inView, end, duration]);

  const formatted =
    decimals > 0 ? count.toFixed(decimals) : Math.floor(count).toString();

  return (
    <span ref={ref}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}

interface StatItem {
  value: React.ReactNode;
  subtitle: string;
}

const stats: StatItem[] = [
  {
    value: (
      <>
        <CountUp end={12} /> – <CountUp end={13} suffix=" Million" />
      </>
    ),
    subtitle: "gig workers in India today (projected 23.5M by 2030)",
  },
  {
    value: (
      <>
        <CountUp end={4} /> – <CountUp end={5} suffix=" Million" />
      </>
    ),
    subtitle: "are delivery workers (the largest segment)",
  },
  {
    value: (
      <>
        ₹<CountUp end={12} suffix=",000" /> – ₹<CountUp end={25} suffix=",000" />
      </>
    ),
    subtitle: "typical monthly earnings, with high volatility",
  },
  {
    value: "Zero",
    subtitle: "reliable income protection mechanisms (despite limited social security)",
  },
];

export default function Problem() {
  const sectionRef = useRef<HTMLDivElement>(null);

  return (
    <section
      id="problem"
      ref={sectionRef}
      className="relative min-h-screen flex flex-col items-center justify-center py-32 px-4"
      style={{ background: "linear-gradient(180deg, #0a0f1a 0%, #0f1623 50%, #0a0f1a 100%)" }}
    >
      {/* Abstract wave/rain lines background */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-px bg-gradient-to-r from-transparent via-teal/30 to-transparent"
            style={{
              top: `${5 + i * 5}%`,
              left: "-10%",
              right: "-10%",
              transform: `rotate(${-2 + Math.random() * 4}deg)`,
            }}
            initial={{ opacity: 0, x: -100 }}
            whileInView={{ opacity: 0.3 + Math.random() * 0.3, x: 0 }}
            transition={{ delay: i * 0.05, duration: 1.5 }}
            viewport={{ once: true }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center gap-24 max-w-4xl">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 60, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true, margin: "-80px" }}
            className="text-center"
          >
            <div className="font-[var(--font-heading)] text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white text-glow-sm mb-4">
              {stat.value}
            </div>
            <p className="text-lg sm:text-xl text-white/50 font-light">
              {stat.subtitle}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
