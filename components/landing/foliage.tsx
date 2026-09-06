import type { CSSProperties } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import leaf from "../../public/hero-foliage.webp";

export type FoliageMass = {
  top: string;
  scale?: number;
  flipY?: boolean;
  tilt?: number;
  far?: boolean;
  clock?: 1 | 2 | 3;
  eager?: boolean;
};

export function FoliageDefs() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="0"
      height="0"
      style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
    >
      <defs>
        <filter
          id="vs-wind-l"
          x="-8%"
          y="-4%"
          width="116%"
          height="108%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.009 0.016"
            numOctaves="2"
            seed="11"
            result="wind"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="wind"
            scale="7"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
        <filter
          id="vs-wind-r"
          x="-8%"
          y="-4%"
          width="116%"
          height="108%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.011 0.014"
            numOctaves="2"
            seed="29"
            result="wind"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="wind"
            scale="6"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
    </svg>
  );
}

export default function Foliage({
  side,
  masses,
  layer = "back",
  lower = false,
}: {
  side: "l" | "r";
  masses: FoliageMass[];
  layer?: "back" | "front";
  lower?: boolean;
}) {
  return (
    <div
      className={cn(
        "vs-foliage",
        `vs-foliage--${side}`,
        layer === "front" && "vs-foliage--front",
        lower && "vs-foliage--lower"
      )}
      aria-hidden="true"
    >
      {masses.map((m, i) => {
        const scale = m.scale ?? 1;
        const transform = [
          side === "l" ? "scaleX(-1)" : null,
          m.flipY ? "scaleY(-1)" : null,
          m.tilt ? `rotate(${m.tilt}deg)` : null,
        ]
          .filter(Boolean)
          .join(" ");
        return (
          <span
            key={i}
            className={cn(
              "vs-foliage-leaf",
              m.far && "vs-foliage-leaf--far",
              m.clock && `vs-foliage-leaf--c${m.clock}`
            )}
            style={
              {
                top: m.top,
                "--mass": scale,
                "--amp": scale < 0.75 ? 1.7 : 1,
              } as CSSProperties
            }
          >
            <Image
              src={leaf}
              alt=""
              className="vs-foliage-img"
              style={transform ? { transform } : undefined}
              sizes="(min-width: 1900px) 380px, 20vw"
              priority={m.eager}
              draggable={false}
            />
          </span>
        );
      })}
    </div>
  );
}
