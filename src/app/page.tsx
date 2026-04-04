"use client";

import dynamic from "next/dynamic";
import LoadingScreen from "@/components/LoadingScreen";
import CustomCursor from "@/components/CustomCursor";
import Hero from "@/components/Hero";
import Problem from "@/components/Problem";
import HowItWorks from "@/components/HowItWorks";
import Team from "@/components/Team";
import Footer from "@/components/Footer";

// Dynamic import for the DarkStoreMap component (Leaflet needs window)
const DarkStoreMap = dynamic(() => import("@/components/DarkStoreMap"), {
  ssr: false,
  loading: () => (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-teal/30 border-t-teal rounded-full animate-spin" />
        <div className="text-white/20 text-sm">Loading live map...</div>
      </div>
    </div>
  ),
});

export default function Home() {
  return (
    <>
      <LoadingScreen />
      <CustomCursor />
      <main>
        <Hero />
        <Problem />
        <DarkStoreMap />
        <HowItWorks />
        <Team />
      </main>
      <Footer />
    </>
  );
}
