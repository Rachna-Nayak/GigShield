"use client";

import { useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";

// Particle canvas for the constellation background
function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = (canvas.width = window.innerWidth);
    const h = (canvas.height = window.innerHeight);

    const particles: {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
    }[] = [];

    for (let i = 0; i < 120; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.5 + 0.1,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(0, 212, 170, ${
              0.08 * (1 - dist / 150)
            })`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw particles
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 212, 170, ${p.alpha})`;
        ctx.fill();
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => cancelAnimationFrame(animationRef.current);
  }, []);

  useEffect(() => {
    const cleanup = animate();
    const handleResize = () => animate();
    window.addEventListener("resize", handleResize);
    return () => {
      cleanup?.();
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", handleResize);
    };
  }, [animate]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0"
      style={{ opacity: 0.6 }}
    />
  );
}

// Shield SVG that draws itself
function ShieldIcon() {
  return (
    <motion.svg
      width="60"
      height="68"
      viewBox="0 0 64 72"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.8, duration: 0.5 }}
      className="inline-block mr-3 align-middle"
    >
      <motion.path
        d="M32 4L6 16V36C6 52 18 64 32 68C46 64 58 52 58 36V16L32 4Z"
        stroke="#00d4aa"
        strokeWidth="2"
        fill="rgba(0,212,170,0.05)"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 2.0, duration: 1.2, ease: "easeInOut" }}
      />
      <motion.path
        d="M24 36L30 42L42 30"
        stroke="#00d4aa"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 2.8, duration: 0.6, ease: "easeOut" }}
      />
    </motion.svg>
  );
}

// Letter-by-letter text reveal
function LetterReveal({
  text,
  className,
  delay = 0,
}: {
  text: string;
  className?: string;
  delay?: number;
}) {
  return (
    <span className={className}>
      {text.split("").map((letter, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: delay + i * 0.05,
            duration: 0.4,
            ease: "easeOut",
          }}
          style={{ display: "inline-block" }}
        >
          {letter === " " ? "\u00A0" : letter}
        </motion.span>
      ))}
    </span>
  );
}

// Typing text effect
function TypingText({
  text,
  delay = 0,
  className,
}: {
  text: string;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.span className={className}>
      {text.split("").map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            delay: delay + i * 0.035,
            duration: 0.01,
          }}
          style={{ display: "inline" }}
        >
          {char}
        </motion.span>
      ))}
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{
          delay: delay + text.length * 0.035,
          duration: 0.8,
          repeat: Infinity,
        }}
        className="text-teal"
      >
        |
      </motion.span>
    </motion.span>
  );
}

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden"
    >
      <ParticleBackground />

      {/* Radial gradient overlay */}
      <div
        className="absolute inset-0 z-[1]"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 0%, #0a0f1a 70%)",
        }}
      />

      <div className="relative z-10 flex flex-col items-center text-center px-4">
        {/* GigShield title with shield icon */}
        <div className="flex items-center mb-6">
          <ShieldIcon />
          <h1 className="font-[var(--font-heading)] text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white text-glow">
            <LetterReveal text="GigShield" delay={1.8} />
          </h1>
        </div>

        {/* Tagline */}
        <p className="text-lg sm:text-xl md:text-2xl text-white/80 mb-4 font-light">
          <TypingText
            text="Your income, protected. Automatically."
            delay={2.8}
          />
        </p>

        {/* Team subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 0.5, y: 0 }}
          transition={{ delay: 4.5, duration: 0.8 }}
          className="text-sm tracking-[0.2em] uppercase text-white/40"
        >
          Team Overclocked Minds — Guidewire DEVTrails 2026
        </motion.p>
      </div>

      {/* Pulsing scroll arrow */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 5, duration: 0.5 }}
        className="absolute bottom-10 z-10"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#00d4aa"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-50"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </motion.div>
      </motion.div>
    </section>
  );
}
