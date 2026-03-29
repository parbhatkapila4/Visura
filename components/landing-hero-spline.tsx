import { SplineHeroCanvas } from "@/components/spline-hero-canvas";

export default function LandingHeroSpline() {
  return (
    <section
      className="relative isolate z-0 min-h-[100svh] w-full overflow-hidden bg-black"
      style={{
        position: "relative",
        zIndex: 0,
        isolation: "isolate",
        minHeight: "100svh",
        width: "100%",
        overflow: "hidden",
        backgroundColor: "#000000",
      }}
    >
      <SplineHeroCanvas />
    </section>
  );
}
