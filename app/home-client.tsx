"use client";

import dynamic from "next/dynamic";

const AnimatedHomePage = dynamic(() => import("./animated-home-page"), {
  ssr: false,
  loading: () => (
    <div
      className="relative w-full min-h-screen bg-black flex items-center justify-center overflow-x-hidden"
      style={{
        transform: "translateZ(0)",
        willChange: "scroll-position",
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
      }}
    >
      <span className="text-white/60 text-sm">Loading...</span>
    </div>
  ),
});

interface HomeClientProps {
  showSuccessMessage: boolean;
  showCancelMessage: boolean;
}

export default function HomeClient({
  showSuccessMessage,
  showCancelMessage,
}: HomeClientProps) {
  return (
    <AnimatedHomePage
      showSuccessMessage={showSuccessMessage}
      showCancelMessage={showCancelMessage}
    />
  );
}
