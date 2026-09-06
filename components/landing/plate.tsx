import { cn } from "@/lib/utils";

export type PlateTone = "sky" | "linen" | "moss";

type Wash = { cx: number; cy: number; rx: number; ry: number; fill: string; o: number };

const GROUNDS: Record<PlateTone, { base: string; washes: Wash[] }> = {
  sky: {
    base: "#c2d6e6",
    washes: [
      { cx: 130, cy: 380, rx: 300, ry: 260, fill: "#a6c2da", o: 0.75 },
      { cx: 760, cy: 60, rx: 260, ry: 120, fill: "#b0c9de", o: 0.6 },
      { cx: 340, cy: 120, rx: 330, ry: 120, fill: "#ffffff", o: 0.85 },
      { cx: 1010, cy: 120, rx: 240, ry: 110, fill: "#ffffff", o: 0.8 },
      { cx: 560, cy: 290, rx: 220, ry: 90, fill: "#eef4f7", o: 0.7 },
      { cx: 300, cy: 640, rx: 300, ry: 110, fill: "#ffffff", o: 0.72 },
      { cx: 900, cy: 700, rx: 360, ry: 120, fill: "#f6f8f7", o: 0.7 },
      { cx: 1110, cy: 430, rx: 220, ry: 240, fill: "#e3dcc6", o: 0.85 },
      { cx: 1060, cy: 760, rx: 300, ry: 110, fill: "#e9e2cf", o: 0.8 },
      { cx: 60, cy: 780, rx: 220, ry: 90, fill: "#e6e0cf", o: 0.55 },
    ],
  },
  linen: {
    base: "#e6dfcf",
    washes: [
      { cx: 120, cy: 420, rx: 320, ry: 250, fill: "#d6cbb2", o: 0.7 },
      { cx: 1080, cy: 120, rx: 260, ry: 140, fill: "#d3c8ad", o: 0.55 },
      { cx: 420, cy: 110, rx: 340, ry: 120, fill: "#f8f4eb", o: 0.85 },
      { cx: 900, cy: 320, rx: 260, ry: 110, fill: "#faf7f0", o: 0.75 },
      { cx: 560, cy: 520, rx: 240, ry: 90, fill: "#f3eee2", o: 0.6 },
      { cx: 260, cy: 700, rx: 320, ry: 110, fill: "#f8f4eb", o: 0.7 },
      { cx: 1000, cy: 720, rx: 340, ry: 120, fill: "#dfe3d6", o: 0.65 },
      { cx: 1140, cy: 500, rx: 200, ry: 200, fill: "#d9dfd3", o: 0.5 },
      { cx: 40, cy: 60, rx: 220, ry: 100, fill: "#e0d6be", o: 0.5 },
    ],
  },
  moss: {
    base: "#cbd3b8",
    washes: [
      { cx: 150, cy: 360, rx: 320, ry: 250, fill: "#aab894", o: 0.7 },
      { cx: 800, cy: 80, rx: 280, ry: 130, fill: "#b4c19d", o: 0.6 },
      { cx: 380, cy: 120, rx: 330, ry: 120, fill: "#f2f3e8", o: 0.8 },
      { cx: 1000, cy: 150, rx: 240, ry: 110, fill: "#f5f5ec", o: 0.75 },
      { cx: 600, cy: 300, rx: 220, ry: 90, fill: "#e6eadb", o: 0.6 },
      { cx: 320, cy: 660, rx: 300, ry: 110, fill: "#f2f3e8", o: 0.7 },
      { cx: 920, cy: 700, rx: 360, ry: 120, fill: "#e9e4d0", o: 0.7 },
      { cx: 1120, cy: 440, rx: 210, ry: 230, fill: "#e6e0cc", o: 0.75 },
      { cx: 60, cy: 780, rx: 220, ry: 90, fill: "#c9d8e0", o: 0.5 },
    ],
  },
};

export function WashPaint({ tone, id }: { tone: PlateTone; id: string }) {
  const g = GROUNDS[tone];
  const fid = `vs-wash-${id}`;
  return (
    <svg
      className="vs-wash-paint"
      viewBox="0 0 1200 800"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <filter
          id={fid}
          x="-25%"
          y="-25%"
          width="150%"
          height="150%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.006 0.01"
            numOctaves="3"
            seed={5 + (id.length % 7)}
            result="n"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="n"
            scale="55"
            xChannelSelector="R"
            yChannelSelector="G"
          />
          <feGaussianBlur stdDeviation="10" />
        </filter>
      </defs>
      <rect width="1200" height="800" fill={g.base} />
      <g filter={`url(#${fid})`}>
        {g.washes.map((w, i) => (
          <ellipse
            key={i}
            cx={w.cx}
            cy={w.cy}
            rx={w.rx}
            ry={w.ry}
            fill={w.fill}
            fillOpacity={w.o}
          />
        ))}
      </g>
    </svg>
  );
}

export function WashPlate({
  tone,
  id,
  size = "full",
  className,
  children,
}: {
  tone: PlateTone;
  id: string;
  size?: "full" | "half";
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn("vs-wash", `vs-wash--${tone}`, size === "full" && "vs-wash--full", className)}
    >
      <WashPaint tone={tone} id={id} />
      {children}
    </div>
  );
}

export function Window({
  url,
  narrow,
  flush,
  className,
  bodyClassName,
  children,
}: {
  url?: string;
  narrow?: boolean;
  flush?: boolean;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("vs-win", narrow && "vs-win--narrow", className)}>
      <div className="vs-win-bar">
        <span className="vs-window-dot" />
        <span className="vs-window-dot" />
        <span className="vs-window-dot" />
        {url ? <span className="vs-window-url">{url}</span> : null}
      </div>
      <div className={cn("vs-win-body", flush && "vs-win-body--flush", bodyClassName)}>
        {children}
      </div>
    </div>
  );
}

export function PlateRail({
  title,
  note,
  children,
}: {
  title: string;
  note: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="vs-plate-rail">
      <div className="max-w-[26rem]">
        <p className="vs-hero-rail-title">{title}</p>
        <p className="vs-hero-note mt-1">{note}</p>
      </div>
      {children ? (
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">{children}</div>
      ) : null}
    </div>
  );
}

export function PlateCaption({ children }: { children: React.ReactNode }) {
  return (
    <p className="vs-caption vs-plate-caption">
      <em>{children}</em>
    </p>
  );
}
