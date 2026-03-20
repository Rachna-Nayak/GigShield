"use client";

import { motion } from "framer-motion";

const cards = [
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00d4aa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z" />
        <path d="M12 8v4M12 16h.01" />
      </svg>
    ),
    title: "Detect",
    description: "Real-time zone-level disruption monitoring",
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00d4aa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z" />
        <line x1="9" y1="21" x2="15" y2="21" />
        <line x1="10" y1="24" x2="14" y2="24" />
        <path d="M12 2v2M4.22 4.22l1.42 1.42M1 12h2M4.22 19.78l1.42-1.42M20.78 4.22l-1.42 1.42M23 12h-2" />
      </svg>
    ),
    title: "Assess",
    description: "Multi-source data fusion with AI confidence scoring",
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00d4aa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
    title: "Trigger",
    description: "Automated parametric claim generation",
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00d4aa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="3" />
        <path d="M2 10h20M6 16h4" />
      </svg>
    ),
    title: "Pay",
    description: "Instant payout — zero paperwork",
  },
];

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 60 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

export default function HowItWorks() {
  return (
    <section
      id="approach"
      className="relative py-32 px-4"
      style={{
        background: "linear-gradient(180deg, #0a0f1a 0%, #0f1623 50%, #0a0f1a 100%)",
      }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-[var(--font-heading)] text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            How It Works
          </h2>
          <div className="w-16 h-px bg-teal mx-auto" />
        </motion.div>

        {/* Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {cards.map((card, i) => (
            <motion.div
              key={i}
              variants={cardVariants}
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="glass rounded-2xl p-8 text-center cursor-default group"
            >
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-teal/10 flex items-center justify-center group-hover:bg-teal/20 transition-colors duration-300">
                  {card.icon}
                </div>
              </div>
              <h3 className="font-[var(--font-heading)] text-xl font-semibold text-white mb-3">
                {card.title}
              </h3>
              <p className="text-sm text-white/50 leading-relaxed">
                {card.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Intrigue tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-16 text-base text-white/30 italic"
        >
          The full architecture runs deeper. Much deeper.
        </motion.p>
      </div>
    </section>
  );
}
