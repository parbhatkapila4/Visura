export function mulberry(seed: number): () => number {
  let a = seed | 0;
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type TornSides = {
  top?: boolean;
  right?: boolean;
  bottom?: boolean;
  left?: boolean;
};

export function tornPolygon(
  seed: number,
  sides: TornSides,
  opts?: { ampX?: number; ampY?: number; steps?: number }
): string {
  const rng = mulberry(seed);
  const ampX = opts?.ampX ?? 1.6;
  const ampY = opts?.ampY ?? 1.6;
  const steps = opts?.steps ?? 26;
  const pts: string[] = [];

  const edge = (
    torn: boolean | undefined,
    from: [number, number],
    to: [number, number],
    inward: [number, number],
    amp: number
  ) => {
    if (!torn) {
      pts.push(`${to[0]}% ${to[1]}%`);
      return;
    }
    const bites: Array<{ c: number; w: number; d: number }> = [];
    const nB = 1 + Math.floor(rng() * 2);
    for (let b = 0; b < nB; b++)
      bites.push({ c: 0.15 + rng() * 0.7, w: 0.06 + rng() * 0.09, d: (1.5 + rng() * 2.5) * amp });
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      let d = (0.25 + rng() * 0.75) * amp;
      for (const b of bites) {
        const q = (t - b.c) / b.w;
        if (Math.abs(q) < 1) d += b.d * (Math.cos(q * Math.PI) * 0.5 + 0.5);
      }
      if (i === steps) d = 0;
      const x = from[0] + (to[0] - from[0]) * t + inward[0] * d;
      const y = from[1] + (to[1] - from[1]) * t + inward[1] * d;
      pts.push(`${x.toFixed(2)}% ${y.toFixed(2)}%`);
    }
  };

  pts.push("0% 0%");
  edge(sides.top, [0, 0], [100, 0], [0, 1], ampY);
  edge(sides.right, [100, 0], [100, 100], [-1, 0], ampX);
  edge(sides.bottom, [100, 100], [0, 100], [0, -1], ampY);
  edge(sides.left, [0, 100], [0, 0], [1, 0], ampX);
  return `polygon(${pts.join(", ")})`;
}
