import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { ORIGAMI_ART } from "./origami-svgs";

export default function Origami({
  kind,
  id,
  width,
  flip = false,
  tilt = 0,
  far = false,
  motion = "fly",
  className,
  style,
}: {
  kind: string;
  id: string;
  width: number;
  flip?: boolean;
  tilt?: number;
  far?: boolean;
  motion?: "fly" | "perch";
  className?: string;
  style?: CSSProperties;
}) {
  const src = ORIGAMI_ART[kind];
  if (!src) return null;
  const html = src.split("__UID__").join(id);
  const pose =
    flip || tilt ? { transform: `${flip ? "scaleX(-1) " : ""}rotate(${tilt}deg)` } : undefined;
  return (
    <span
      className={cn("vs-origami", `vs-origami--${motion}`, far && "vs-origami--far", className)}
      style={{ width, ...style }}
      aria-hidden="true"
    >
      <span className="vs-origami-flyer">
        <span className="vs-origami-pose" style={pose}>
          <span className="vs-origami-inner" dangerouslySetInnerHTML={{ __html: html }} />
        </span>
      </span>
    </span>
  );
}
