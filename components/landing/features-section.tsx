import type { CSSProperties } from "react";
import Image from "next/image";
import { Section } from "./section";
import { PaperCard } from "./paper-card";
import { PrimaryCta } from "./primitives";
import { Ledger, type LedgerRow } from "./ledger";

const VIEWS = [
  "Summary",
  "Sections",
  "Processing insights",
  "AI insights",
  "Knowledge graph",
] as const;

const SCALE_ROWS: ReadonlyArray<{ length: string; sections: string; words: string; cap: number }> =
  [
    { length: "up to 15 pages", sections: "7", words: "3,500", cap: 3500 },
    { length: "up to 50", sections: "10", words: "6,000", cap: 6000 },
    { length: "up to 150", sections: "12", words: "8,500", cap: 8500 },
    { length: "up to 400", sections: "15", words: "10,000", cap: 10000 },
    { length: "larger", sections: "18", words: "12,000", cap: 12000 },
  ];

const CAP_MAX = SCALE_ROWS[SCALE_ROWS.length - 1].cap;

const FREE_ROWS: LedgerRow[] = [
  { k: "Documents", v: "5" },
  { k: "Payment", v: "—" },
];

const PRO_ROWS: LedgerRow[] = [
  { k: "India", v: "₹1,770" },
  { k: "EU", v: "€17" },
  { k: "Elsewhere", v: "$20" },
];

const LIMIT_ROWS: LedgerRow[] = [
  { k: "Formats", v: "PDF, DOCX, DOC, TXT, MD, XLSX, XLS, PPTX" },
  { k: "Max size", v: "32 MB" },
  { k: ".ppt", v: "rejected; convert to .pptx", prose: true },
  {
    k: "PDF extraction",
    v: "up to 50 pages of text · fully scanned PDFs are OCR'd, up to 10 pages",
    prose: true,
  },
];

type Shot = { src: string; alt: string; w: number; h: number };

const SIZES = "(max-width: 767px) 100vw, (max-width: 1199px) calc(100vw - 80px), 1120px";

/** A row's rule and its head pair. */
function RowHead({ title, body }: { title: string; body: string }) {
  return (
    <>
      <hr className="vs-feat-rule" />
      <div className="vs-feat-head">
        <h3 className="vs-feat-h">{title}</h3>
        <p className="vs-feat-body">{body}</p>
      </div>
    </>
  );
}

function Shots({ shots }: { shots: Shot[] }) {
  return (
    <div
      className="vs-feat-shots"
      style={{ "--cols": shots.map((s) => `${s.w / s.h}fr`).join(" ") } as CSSProperties}
    >
      {shots.map((s) => (
        <div key={s.src} className="vs-feat-frame" style={{ aspectRatio: `${s.w} / ${s.h}` }}>
          <Image src={s.src} alt={s.alt} fill className="vs-feat-img" sizes={SIZES} />
        </div>
      ))}
    </div>
  );
}

function LiveFrame({
  ground,
  className,
  children,
}: {
  ground: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className ? `vs-feat-live ${className}` : "vs-feat-live"}>
      <Image src={ground} alt="" fill className="vs-feat-img" sizes={SIZES} />
      <div className="vs-feat-live-body">{children}</div>
    </div>
  );
}

export default function FeaturesSection() {
  return (
    <Section
      id="features"
      foliage={{
        r: [
          { top: "-3%", scale: 1, tilt: 3, clock: 2 },
          { top: "34%", scale: 0.6, flipY: true, tilt: -5, far: true, clock: 1 },
          { top: "71%", scale: 0.92, tilt: -2, clock: 3 },
        ],
        l: [
          { top: "7%", scale: 0.58, flipY: true, tilt: -4, far: true, clock: 1 },
          { top: "40%", scale: 0.96, tilt: 4, clock: 3 },
          { top: "77%", scale: 0.56, tilt: 6, far: true, clock: 2 },
        ],
      }}
    >
      <div className="vs-feat">
        <p className="vs-feat-eyebrow">Features</p>
        <h2 className="vs-feat-title">Read it, share it, keep every version</h2>
        <div className="vs-feat-cta">
          <PrimaryCta size="lg" className="w-full sm:w-auto" />
        </div>

        <div className="vs-feat-rows">
          <div className="vs-feat-row">
            <RowHead
              title="Five ways into one document"
              body="The summary, the sections under it, what the run cost, what the model found, and a graph of how the pieces connect."
            />
            <Shots
              shots={[
                {
                  src: "/shots/views.webp",
                  alt: `A summary open on a desk with its five views tabbed across the top: ${VIEWS.join(", ")}`,
                  w: 2732,
                  h: 1124,
                },
              ]}
            />
          </div>
          <div className="vs-feat-row">
            <RowHead
              title="Sized to the document, not to a template"
              body="Fifteen pages gets up to 7 sections. Four hundred gets 15. Section count and word budget scale with what you upload."
            />
            <LiveFrame ground="/shots/ground-ladder.webp">
              <PaperCard
                tone="white"
                seed={71}
                tilt={-0.6}
                lift
                torn={{ right: true }}
                tapes={[{ kind: 1, width: 78, angle: -34, style: { left: -22, top: -14 } }]}
                className="vs-feat-sheet"
                bodyClassName="px-6 py-7 md:px-9 md:py-8"
              >
                <ol className="vs-feat-ladder" aria-label="Summary size by document length">
                  {SCALE_ROWS.map((row) => (
                    <li key={row.length} className="vs-feat-ladder-row">
                      <span className="vs-mono vs-feat-ladder-len">{row.length}</span>
                      <span className="vs-feat-ladder-track" aria-hidden="true">
                        <span
                          className="vs-feat-ladder-bar"
                          style={{ width: `${(row.cap / CAP_MAX) * 100}%` }}
                        />
                      </span>
                      <span className="vs-mono vs-feat-ladder-note">
                        {row.sections} sections · {row.words} words
                      </span>
                    </li>
                  ))}
                </ol>
              </PaperCard>
            </LiveFrame>
          </div>
          <div className="vs-feat-row">
            <RowHead
              title="Everyone reads the same version"
              body="Share a document into a workspace with four roles — owner, admin, member and viewer. Everyone opens the current version, so nobody is mailing revisions around."
            />
            <Shots
              shots={[
                {
                  src: "/shots/roles.webp",
                  alt: "Four paper name tags laid out on a desk, reading owner, admin, member and viewer",
                  w: 2732,
                  h: 1124,
                },
              ]}
            />
          </div>
          <div className="vs-feat-row">
            <RowHead
              title="Every change leaves a trail"
              body="Shares, comments, invitations and version changes are logged as they happen. Workspace chat and search run across every document in the space."
            />
            <Shots
              shots={[
                {
                  src: "/shots/trail-left.webp",
                  alt: "A slip of paper listing the last three things that happened in a workspace",
                  w: 939,
                  h: 1127,
                },
                {
                  src: "/shots/trail-right.webp",
                  alt: "A question asked of a workspace, answered with the section it was drawn from",
                  w: 1776,
                  h: 1124,
                },
              ]}
            />
          </div>
          <div className="vs-feat-row">
            <RowHead
              title="Five documents free, then one payment"
              body="Free covers your first 5 documents. Pro is a single payment for up to 1,000, billed in your region's currency through Razorpay."
            />
            <LiveFrame ground="/shots/ground-plans.webp">
              <PaperCard
                tone="white"
                seed={91}
                tilt={-0.8}
                lift
                torn={{ top: true, bottom: true }}
                tapes={[{ kind: 2, width: 84, angle: 38, style: { right: -24, top: -16 } }]}
                className="vs-feat-sheet"
                bodyClassName="vs-feat-plans"
              >
                <div className="vs-feat-plan">
                  <p className="vs-key">Free</p>
                  <p className="vs-feat-plan-name">5 documents</p>
                  <Ledger className="mt-4" rows={FREE_ROWS} />
                </div>
                <div className="vs-perf-h md:hidden" aria-hidden="true" />
                <div className="vs-perf-v hidden self-stretch md:block" aria-hidden="true" />
                <div className="vs-feat-plan">
                  <p className="vs-key">Pro</p>
                  <p className="vs-feat-plan-name">up to 1,000 documents</p>
                  <Ledger className="mt-4" rows={PRO_ROWS} />
                </div>
              </PaperCard>
            </LiveFrame>

            <div className="vs-feat-limits">
              <p id="formats" className="vs-key scroll-mt-24">
                Formats and limits
              </p>
              <Ledger className="mt-2" rows={LIMIT_ROWS} />
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
