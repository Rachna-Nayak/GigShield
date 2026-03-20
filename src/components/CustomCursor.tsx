"use client";

import { useEffect, useState } from "react";

export default function CustomCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)");
    setIsDesktop(mq.matches);

    if (!mq.matches) return;

    const move = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", move, { passive: true });
    return () => window.removeEventListener("mousemove", move);
  }, []);

  if (!isDesktop) return null;

  return (
    <div
      className="pointer-events-none fixed z-[9997] rounded-full"
      style={{
        left: pos.x - 16,
        top: pos.y - 16,
        width: 32,
        height: 32,
        background:
          "radial-gradient(circle, rgba(0,212,170,0.15) 0%, transparent 70%)",
        filter: "blur(2px)",
        transition: "left 0.08s ease-out, top 0.08s ease-out",
      }}
    />
  );
}
