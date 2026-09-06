import { cn } from "@/lib/utils";
import Foliage, { type FoliageMass } from "./foliage";

export function Section({
  id,
  className,
  foliage,
  children,
}: {
  id: string;
  className?: string;
  foliage?: {
    l?: FoliageMass[];
    r?: FoliageMass[];
    frontL?: FoliageMass[];
    frontR?: FoliageMass[];
  };
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={cn("vs-sec", className)}>
      {foliage?.l ? <Foliage side="l" lower masses={foliage.l} /> : null}
      {foliage?.r ? <Foliage side="r" lower masses={foliage.r} /> : null}
      {children}
      {foliage?.frontL ? <Foliage side="l" lower layer="front" masses={foliage.frontL} /> : null}
      {foliage?.frontR ? <Foliage side="r" lower layer="front" masses={foliage.frontR} /> : null}
    </section>
  );
}

export function SectionCol({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn("vs-sec-col", className)}>{children}</div>;
}

export function SectionWide({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn("vs-sec-wide", className)}>{children}</div>;
}

export function SectionHead({
  roman,
  italic,
  sub,
  className,
}: {
  roman: string;
  italic: string;
  sub: string;
  className?: string;
}) {
  return (
    <div className={cn("vs-sec-head", className)}>
      <h2 className="vs-sec-title">
        {roman} <em>{italic}</em>
      </h2>
      <p className="vs-sec-sub">{sub}</p>
    </div>
  );
}
