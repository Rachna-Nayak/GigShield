"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function LoadingScreen() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-navy"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          <div className="flex flex-col items-center gap-4">
            <svg
              width="64"
              height="72"
              viewBox="0 0 64 72"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                className="shield-path"
                d="M32 4L6 16V36C6 52 18 64 32 68C46 64 58 52 58 36V16L32 4Z"
                stroke="#00d4aa"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <path
                className="shield-path"
                d="M24 36L30 42L42 30"
                stroke="#00d4aa"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                style={{ animationDelay: "0.4s" }}
              />
            </svg>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-sm tracking-[0.3em] uppercase text-teal/50"
            >
              GigShield
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
