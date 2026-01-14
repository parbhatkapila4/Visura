"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface AuthVisualPaneProps {
  tagline?: string;
  currentPage?: "sign-in" | "sign-up";
}

export default function AuthVisualPane({
  tagline = "Transforming documents into actionable insights",
  currentPage = "sign-up",
}: AuthVisualPaneProps) {
  return (
    <div className="relative hidden lg:flex lg:w-[50%] p-4">
      <div className="relative w-full h-full rounded-2xl overflow-hidden">
        <div className="absolute inset-0">
          <svg
            className="w-full h-full"
            viewBox="0 0 1000 700"
            preserveAspectRatio="xMidYMid slice"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#7B6BA0" />
                <stop offset="20%" stopColor="#6A5A8E" />
                <stop offset="40%" stopColor="#5A4A7A" />
                <stop offset="60%" stopColor="#4A3A65" />
                <stop offset="80%" stopColor="#3A2A50" />
                <stop offset="100%" stopColor="#2A1A3A" />
              </linearGradient>

              <linearGradient id="mainDuneGradient" x1="0%" y1="0%" x2="100%" y2="50%">
                <stop offset="0%" stopColor="#1A1020" />
                <stop offset="40%" stopColor="#251830" />
                <stop offset="70%" stopColor="#1A1020" />
                <stop offset="100%" stopColor="#0A0510" />
              </linearGradient>

              <linearGradient id="ridgeHighlight" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3A2A4A" />
                <stop offset="30%" stopColor="#5A4A70" />
                <stop offset="60%" stopColor="#4A3A60" />
                <stop offset="100%" stopColor="#2A1A3A" />
              </linearGradient>

              <linearGradient id="foregroundDune" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#0D0810" />
                <stop offset="100%" stopColor="#050308" />
              </linearGradient>

              <linearGradient id="distantDune" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#2A1A3A" />
                <stop offset="100%" stopColor="#1A1020" />
              </linearGradient>
            </defs>

            <rect width="1000" height="700" fill="url(#skyGradient)" />

            <path
              d="M 0,380 
                 C 200,360 400,370 600,365 
                 C 800,360 900,370 1000,365 
                 L 1000,700 L 0,700 Z"
              fill="url(#distantDune)"
              opacity="0.4"
            />

            <path
              d="M -100,700 
                 C 0,680 100,620 200,560 
                 C 350,470 500,380 650,300 
                 C 750,250 850,200 950,160
                 C 1000,140 1050,130 1100,125
                 L 1100,700 Z"
              fill="url(#mainDuneGradient)"
            />

            <path
              d="M 200,560 
                 C 350,470 500,380 650,300 
                 C 750,250 850,200 950,160
                 C 1000,140 1050,130 1100,125
                 L 1100,120
                 C 1050,125 1000,135 950,155
                 C 850,195 750,245 650,295 
                 C 500,375 350,465 200,555 Z"
              fill="url(#ridgeHighlight)"
              opacity="0.7"
            />

            <path
              d="M -100,700 
                 C 0,680 80,640 160,600 
                 C 280,530 400,470 520,420
                 C 600,390 680,370 750,360
                 L 750,700 Z"
              fill="#080510"
              opacity="0.6"
            />

            <path
              d="M -100,700 
                 C 50,650 200,620 350,640 
                 C 500,660 650,680 800,700
                 L 800,800 L -100,800 Z"
              fill="url(#foregroundDune)"
            />

            <path
              d="M 400,700 
                 C 550,670 700,660 850,680
                 C 950,695 1050,710 1100,720
                 L 1100,800 L 400,800 Z"
              fill="#050308"
              opacity="0.95"
            />
          </svg>

          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40" />
        </div>

        <div className="relative z-10 flex flex-col h-full w-full p-8">
          <div className="flex items-start justify-between mb-auto">
            <div className="text-2xl font-bold text-white tracking-tight">VISURA</div>

            <Link
              href="/"
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 text-white text-sm font-medium hover:bg-black/60 hover:border-white/20 transition-all"
            >
              Back to website
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="mt-auto space-y-6">
            <div className="text-white text-2xl md:text-3xl font-semibold leading-tight">
              {tagline}
            </div>

            <div className="flex gap-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentPage === "sign-up" ? "w-8 bg-white" : "w-2 bg-white/30"
                }`}
              />
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentPage === "sign-in" ? "w-8 bg-white" : "w-2 bg-white/30"
                }`}
              />
              <div className="h-2 w-2 rounded-full bg-white/30" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
