"use client";

import dynamic from "next/dynamic";
import LoadingScreen from "@/components/LoadingScreen";
import Navbar from "@/components/Navbar";
import CustomCursor from "@/components/CustomCursor";
import Hero from "@/components/Hero";
import Problem from "@/components/Problem";
import HowItWorks from "@/components/HowItWorks";
import Team from "@/components/Team";
import Footer from "@/components/Footer";

// Dynamic import for the Map component (Leaflet needs window)
const MapSection = dynamic(() => import("@/components/MapSection"), {
  ssr: false,
  loading: () => (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-white/20 text-sm">Loading map...</div>
    </div>
  ),
});

export default function Home() {
  return (
    <>
      <LoadingScreen />
      <CustomCursor />
      <Navbar />
      <main>
        <Hero />
        <Problem />
        <MapSection />
        <HowItWorks />
        <Team />
      </main>
      <Footer />
    </>
  );
}
