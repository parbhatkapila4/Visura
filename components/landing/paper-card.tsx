import type { CSSProperties } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { tornPolygon, type TornSides } from "./torn";
import grain from "../../public/scraps/grain.webp";
import tape1 from "../../public/scraps/tape-1.webp";
import tape2 from "../../public/scraps/tape-2.webp";

const TONES = {
  cream: "#f8f5eb",
  linen: "#efe9d9",
  mist: "#f0f2e7",
  white: "#fcfaf4",
} as const;

export type PaperTone = keyof typeof TONES;

export type TapeSpec = {
  kind?: 1 | 2;
  width?: number;
  angle?: number;
  style?: CSSProperties;
};

export function PaperCard({
  tone = "cream",
  seed = 1,
  torn,
  tilt = 0,
  lift = false,
  tapes,
  className,
  bodyClassName,
  style,
  children,
}: {
  tone?: PaperTone;
  seed?: number;
  torn?: TornSides;
  tilt?: number;
  lift?: boolean;
  tapes?: TapeSpec[];
  className?: string;
  bodyClassName?: string;
  style?: CSSProperties;
  children: React.ReactNode;
}) {
  const clip = torn ? tornPolygon(seed, torn) : undefined;
  return (
    <div
      className={cn("vs-card", lift && "vs-card--lift", className)}
      style={{ ...(tilt ? { transform: `rotate(${tilt}deg)` } : null), ...style }}
    >
      <div className="vs-card-motion">
        <div
          className={cn("vs-card-surface", bodyClassName)}
          style={{
            backgroundColor: TONES[tone],
            backgroundImage: `url(${grain.src})`,
            ...(clip ? { clipPath: clip } : null),
          }}
        >
          {children}
        </div>
      </div>
      {tapes?.map((t, i) => (
        <TapeStrip key={i} kind={t.kind} width={t.width} angle={t.angle} style={t.style} />
      ))}
    </div>
  );
}

export function TapeStrip({
  kind = 1,
  width = 72,
  angle = 0,
  className,
  style,
}: {
  kind?: 1 | 2;
  width?: number;
  angle?: number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span className={cn("vs-tape", className)} style={{ width, ...style }} aria-hidden="true">
      <Image
        src={kind === 1 ? tape1 : tape2}
        alt=""
        style={angle ? { transform: `rotate(${angle}deg)` } : undefined}
        sizes={`${width}px`}
        draggable={false}
      />
    </span>
  );
}
