"use client";

import dynamic from "next/dynamic";

const AnimatedHomePage = dynamic(() => import("./animated-home-page"), {
  ssr: false,
  loading: () => (
    <div
      className="relative w-full min-h-screen bg-black flex items-center justify-center overflow-x-hidden"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "50vh",
        width: "100%",
        backgroundColor: "#000",
      }}
    >
      <span
        className="text-white/60 text-sm"
        style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.875rem" }}
      >
        Loading...
      </span>
    </div>
  ),
});

interface HomeClientProps {
  showSuccessMessage: boolean;
  showCancelMessage: boolean;
}

export default function HomeClient({ showSuccessMessage, showCancelMessage }: HomeClientProps) {
  return (
    <AnimatedHomePage
      showSuccessMessage={showSuccessMessage}
      showCancelMessage={showCancelMessage}
    />
  );
}
