"use client";

import dynamic from "next/dynamic";
import { SplineErrorBoundary } from "@/components/spline-error-boundary";

const SCENE_VIA_PROXY = "/api/spline-scene";

const Spline = dynamic(() => import("@splinetool/react-spline"), {
  ssr: false,
  loading: () => <SplineFallback />,
});

type SplineHeroCanvasProps = {
  scene?: string;
};

function SplineFallback() {
  return (
    <div
      className="absolute inset-0 z-0 min-h-[100svh] w-full bg-gradient-to-b from-zinc-950 via-black to-black"
      style={{
        position: "absolute",
        inset: 0,
        minHeight: "100%",
        width: "100%",
        background: "linear-gradient(to bottom, #09090b, #000 40%, #000)",
      }}
      aria-hidden
    />
  );
}

export function SplineHeroCanvas({ scene = SCENE_VIA_PROXY }: SplineHeroCanvasProps) {
  return (
    <SplineErrorBoundary fallback={<SplineFallback />}>
      <div
        className="pointer-events-none absolute inset-0 isolate z-0 min-h-[100svh] w-full overflow-hidden"
        style={{
          position: "absolute",
          inset: 0,
          minHeight: "100%",
          width: "100%",
          overflow: "hidden",
          zIndex: 0,
          pointerEvents: "none",
        }}
      >
        <Spline
          scene={scene}
          className="h-full min-h-[100svh] w-full"
          style={{ minHeight: "100svh" }}
        />
      </div>
    </SplineErrorBoundary>
  );
}
