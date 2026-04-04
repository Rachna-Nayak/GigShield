"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface RiderData {
  name: string;
  zone: string;
  platform: string;
}

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [rider, setRider] = useState<RiderData | null>(null);

  // Check localStorage for rider
  useEffect(() => {
    const check = () => {
      const riderStr = localStorage.getItem("giginsure_rider");
      if (riderStr) {
        setRider(JSON.parse(riderStr));
      } else {
        setRider(null);
      }
    };
    check();
    // Re-check when storage changes (for cross-tab or same-tab updates)
    window.addEventListener("storage", check);
    // Also poll every 2s for same-tab localStorage updates
    const interval = setInterval(check, 2000);
    return () => {
      window.removeEventListener("storage", check);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isLanding = pathname === "/";
  const isApp = ["/dashboard", "/claims", "/register", "/policy-confirmation"].includes(pathname);

  // Navigation links change based on context
  const landingLinks = [
    { label: "Problem", href: "#problem" },
    { label: "Live Map", href: "#map" },
    { label: "Approach", href: "#approach" },
    { label: "Team", href: "#team" },
  ];

  const appLinks = rider
    ? [
        { label: "Dashboard", href: "/dashboard" },
        { label: "Claims", href: "/claims" },
      ]
    : [];

  const navLinks = isLanding ? landingLinks : appLinks;

  const platformColor = rider?.platform === "Blinkit" ? "#ff6b35" : rider?.platform === "Zepto" ? "#00d4aa" : "#0ea5e9";

  return (
    <motion.nav
      initial={isLanding ? { y: -80, opacity: 0 } : { y: 0, opacity: 1 }}
      animate={{ y: 0, opacity: 1 }}
      transition={isLanding ? { delay: 1.5, duration: 0.6, ease: "easeOut" } : { duration: 0.3 }}
      className={`fixed top-0 left-0 right-0 z-[9998] transition-all duration-500 ${
        scrolled || isApp
          ? "glass-strong shadow-lg shadow-black/20"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link
          href={rider ? "/dashboard" : "/"}
          className="flex items-center gap-2 text-white font-[var(--font-heading)] text-lg font-bold tracking-tight"
        >
          <svg
            width="24"
            height="28"
            viewBox="0 0 64 72"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M32 4L6 16V36C6 52 18 64 32 68C46 64 58 52 58 36V16L32 4Z"
              stroke="#00d4aa"
              strokeWidth="3"
              fill="rgba(0,212,170,0.1)"
            />
            <path
              d="M24 36L30 42L42 30"
              stroke="#00d4aa"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>
            Gig-<span className="text-teal">Insure</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => {
            const isActive = !link.href.startsWith("#") && pathname === link.href;
            return link.href.startsWith("#") ? (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-white/60 hover:text-teal transition-colors duration-300 tracking-wide"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm transition-colors duration-300 tracking-wide ${
                  isActive ? "text-teal font-medium" : "text-white/60 hover:text-teal"
                }`}
              >
                {link.label}
              </Link>
            );
          })}

          {/* Auth section */}
          {rider ? (
            <div className="flex items-center gap-3 ml-2">
              {/* Policy indicator */}
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-[10px] text-green-400/70 font-medium">Policy Active</span>
              </div>

              {/* Rider badge */}
              <div className="flex items-center gap-2 glass rounded-full px-3 py-1.5">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                  style={{ background: `${platformColor}30`, border: `1px solid ${platformColor}40` }}
                >
                  {rider.name.charAt(0)}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-white font-medium leading-tight">{rider.name.split(" ")[0]}</span>
                  <span className="text-[9px] text-white/30 leading-tight">{rider.zone}</span>
                </div>
              </div>
            </div>
          ) : (
            <Link
              href="/register"
              className="ml-2 px-4 py-2 rounded-xl text-sm font-semibold bg-teal text-navy hover:shadow-lg hover:shadow-teal/20 transition-all"
            >
              Get Protected
            </Link>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden flex flex-col gap-1.5 p-2"
          aria-label="Menu"
        >
          <span
            className={`block h-0.5 w-5 bg-white/70 transition-all duration-300 ${
              mobileOpen ? "rotate-45 translate-y-2" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-5 bg-white/70 transition-all duration-300 ${
              mobileOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-5 bg-white/70 transition-all duration-300 ${
              mobileOpen ? "-rotate-45 -translate-y-2" : ""
            }`}
          />
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="glass-strong md:hidden border-t border-white/5"
        >
          <div className="flex flex-col px-6 py-4 gap-4">
            {navLinks.map((link) =>
              link.href.startsWith("#") ? (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-sm text-white/60 hover:text-teal transition-colors"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-sm text-white/60 hover:text-teal transition-colors"
                >
                  {link.label}
                </Link>
              )
            )}
            {!rider ? (
              <Link
                href="/register"
                onClick={() => setMobileOpen(false)}
                className="text-sm text-teal font-semibold"
              >
                Get Protected →
              </Link>
            ) : (
              <div className="text-xs text-white/30 pt-2 border-t border-white/5">
                Signed in as {rider.name} · {rider.zone}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}
