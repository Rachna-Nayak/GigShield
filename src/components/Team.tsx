"use client";

import { motion } from "framer-motion";

const members = [
  { initials: "R", name: "Rachna", gradient: "from-teal-400 to-blue-500", glow: "rgba(45, 212, 191, 0.5)" },
  { initials: "C", name: "Chetan", gradient: "from-purple-500 to-pink-500", glow: "rgba(168, 85, 247, 0.5)" },
  { initials: "CH", name: "Chaitanya", gradient: "from-orange-400 to-yellow-400", glow: "rgba(251, 146, 60, 0.5)" },
  { initials: "T", name: "Tharun", gradient: "from-green-400 to-teal-500", glow: "rgba(74, 222, 128, 0.5)" },
];

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const memberVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.8 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

export default function Team() {
  return (
    <section
      id="team"
      className="relative py-32 px-4"
      style={{
        background: "linear-gradient(180deg, #0a0f1a 0%, #0d1320 50%, #0a0f1a 100%)",
      }}
    >
      <div className="max-w-4xl mx-auto text-center">
        {/* Heading with underline animation */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-8"
        >
          <h2 className="font-[var(--font-heading)] text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 inline-block relative">
            Team Overclocked Minds
            <motion.span
              className="absolute -bottom-2 left-0 h-0.5 bg-gradient-to-r from-teal to-cyan"
              initial={{ width: 0 }}
              whileInView={{ width: "100%" }}
              transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
              viewport={{ once: true }}
            />
          </h2>
        </motion.div>

        {/* Mission statement */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.6 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          viewport={{ once: true }}
          className="text-lg sm:text-xl text-white/60 mb-16 max-w-xl mx-auto font-light"
        >
          4 builders. 6 weeks. 1 mission: make gig workers&apos; income
          unbreakable.
        </motion.p>

        {/* Team avatars */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-8 sm:gap-12 mb-16"
        >
          {members.map((member, i) => (
            <motion.div
              key={i}
              variants={memberVariants}
              className="flex flex-col items-center gap-3 relative group"
            >
              <motion.div
                className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br ${member.gradient} flex items-center justify-center text-white font-semibold text-sm sm:text-base cursor-pointer shadow-lg relative z-10`}
                initial={{ boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }}
                whileHover={{
                  scale: 1.1,
                  boxShadow: `0 0 25px ${member.glow}`,
                }}
                transition={{ duration: 0.3 }}
              >
                {member.initials}
              </motion.div>
              <span className="text-xs sm:text-sm text-white/40 group-hover:text-white/80 transition-colors duration-300">
                {member.name}
              </span>
            </motion.div>
          ))}
        </motion.div>

        {/* DEVTrails branding */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          viewport={{ once: true }}
          className="glass rounded-2xl inline-block px-8 py-4"
        >
          <p className="text-sm text-white/40">
            Built for{" "}
            <span className="text-teal/70 font-medium">
              Guidewire DEVTrails University Hackathon 2026
            </span>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
