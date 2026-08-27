"use client";

import React from "react";
import { DotGlobeHero } from "@/components/ui/globe-hero";
export function HeroSection() {
  return (
    <DotGlobeHero rotationSpeed={0.004} className="bg-black relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40" />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(ellipse 80% 50% at 50% 50%, #fff, transparent 70%)`,
        }}
      />
    </DotGlobeHero>
  );
}
