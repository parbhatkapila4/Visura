import Image from "next/image";
import { Section } from "./section";
import { PaperCard } from "./paper-card";
import { PrimaryCta } from "./primitives";
import { Ledger, type LedgerRow } from "./ledger";

const FREE_ROWS: LedgerRow[] = [
  { k: "Comparisons", v: "unlimited" },
  { k: "Documents kept", v: "5" },
  { k: "Payment", v: "—" },
];

const PRO_ROWS: LedgerRow[] = [
  { k: "INR", v: "₹1,770" },
  { k: "EUR", v: "€17" },
  { k: "USD", v: "$20" },
];

const LIMIT_ROWS: LedgerRow[] = [
  { k: "Formats", v: "PDF, DOCX, TXT, MD, XLSX, XLS, PPTX" },
  { k: "Max size", v: "32 MB per file · very long documents can fail to process", prose: true },
  { k: ".doc, .ppt", v: "can't be read; convert to .docx or .pptx", prose: true },
  {
    k: "PDF extraction",
    v: "your browser reads up to 50 pages of text · fully scanned PDFs are OCR'd in English, up to 10 pages",
    prose: true,
  },
];

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
        <h2 className="vs-feat-title">Read it, share it, search it</h2>
        <div className="vs-feat-cta">
          <PrimaryCta size="lg" className="w-full sm:w-auto" />
        </div>

        <div className="vs-feat-rows">
          <div className="vs-feat-row">
            <RowHead
              title="Five ways into one document"
              body="The summary, an outline of its sections, what the run reused, what the model found, and a graph of its topics and entities. The outline, the findings and the graph are drawn from the start of the document."
            />
          </div>
          <div className="vs-feat-row">
            <RowHead
              title="Search across a workspace"
              body="Search runs across the documents shared into the workspace and returns the passages closest to your query."
            />
          </div>
          <div className="vs-feat-row">
            <RowHead
              title="Comparing is free. Keeping more is what you pay for."
              body="Compare two versions as often as you like — it runs in your browser, so it costs nothing and neither file is uploaded. Free keeps 5 documents. Starter keeps 10 and Pro keeps 1,000; each is a one-time payment. Each new version of a document counts as one of them. Every account can download 2 summaries, on any plan."
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
                  <p className="vs-feat-plan-name">Compare and keep 5</p>
                  <Ledger className="mt-4" rows={FREE_ROWS} />
                </div>
                <div className="vs-perf-h md:hidden" aria-hidden="true" />
                <div className="vs-perf-v hidden self-stretch md:block" aria-hidden="true" />
                <div className="vs-feat-plan">
                  <p className="vs-key">Pro</p>
                  <p className="vs-feat-plan-name">Keep up to 1,000</p>
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
