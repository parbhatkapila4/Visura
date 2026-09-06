import { Section, SectionHead, SectionWide } from "./section";
import { PlateCaption, WashPlate } from "./plate";
import { PaperCard } from "./paper-card";
import { Barcode } from "./barcode";
import { ConfidenceMeter } from "./primitives";
import { CHANGE_TYPES, CURRENT_VERSION, DOCUMENT_NAME, VERSIONS } from "./lineage-data";

const v4 = CURRENT_VERSION;
const v3 = VERSIONS[1];

interface ChangeEvent {
  type: (typeof CHANGE_TYPES)[number];
  summary: string;
  chunks: [number, number];
  confidence: number;
}

const EVENTS: readonly ChangeEvent[] = [
  {
    type: "clarification",
    summary: "Definition of confidential information expanded",
    chunks: [42, 44],
    confidence: 0.88,
  },
  {
    type: "risk_added",
    summary: "Non-compete extended to 24 months",
    chunks: [55, 58],
    confidence: 0.84,
  },
  {
    type: "scope_change",
    summary: "Duties expanded to include team management",
    chunks: [59, 60],
    confidence: 0.79,
  },
  {
    type: "modified",
    summary: "Termination notice extended from 30 to 60 days",
    chunks: [84, 86],
    confidence: 0.91,
  },
];

const SLIP_SEEDS = [61, 62, 63, 64] as const;
const SLIP_TILTS = [-2, 1.5, -1, 2.5] as const;

function Tethers() {
  const W = 1000;
  const H = 56;
  return (
    <svg
      className="vs-changes-tethers"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      {EVENTS.map((e, i) => {
        const [a, b] = e.chunks;
        const x0 = ((a + (b - a + 1) / 2) / v4.totalChunks) * W;
        const x1 = (W / EVENTS.length) * (i + 0.5);
        return (
          <path
            key={e.type}
            d={`M ${x0.toFixed(1)} 0 C ${x0.toFixed(1)} 30, ${x1} 26, ${x1} ${H}`}
            fill="none"
            stroke="var(--stem)"
            strokeWidth={1.2}
            strokeLinecap="round"
            strokeOpacity={0.85}
            vectorEffect="non-scaling-stroke"
          />
        );
      })}
    </svg>
  );
}

function ChangeSlips() {
  return (
    <ul className="vs-changes-cards">
      {EVENTS.map((e, i) => (
        <li key={e.type} className="min-w-0">
          <PaperCard
            seed={SLIP_SEEDS[i]}
            tone="white"
            torn={{ bottom: true }}
            tilt={SLIP_TILTS[i]}
            lift
            className="h-full"
            bodyClassName="flex h-full flex-col items-start gap-2 p-4"
          >
            <span className="vs-chip-soft vs-mono">{e.type}</span>
            <p className="vs-name" style={{ fontSize: 15, textWrap: "pretty" }}>
              {e.summary}
            </p>
            <span className="vs-mono" style={{ color: "var(--ink-3)" }}>
              chunks {e.chunks[0]}–{e.chunks[1]}
            </span>
            <ConfidenceMeter value={e.confidence} />
          </PaperCard>
        </li>
      ))}
    </ul>
  );
}

export default function ChangesSection() {
  return (
    <Section
      id="changes"
      foliage={{
        r: [{ top: "-14%", scale: 0.95, tilt: -3, far: true, clock: 1 }],
        l: [{ top: "42%", scale: 0.58, tilt: -7, clock: 3 }],
      }}
    >
      <SectionWide>
        <SectionHead
          roman="Every change,"
          italic="on the record"
          sub="When a version finishes, each change is recorded with a type, a summary, the sections it touched, and a confidence score; the app shows them on a document timeline and a delta view."
        />
      </SectionWide>

      <SectionWide>
        <WashPlate tone="moss" id="changes">
          <div className="vs-changes-head">
            <p className="vs-key">
              {EVENTS.length} changes · {v3.id} → {v4.id}
            </p>
            <span className="vs-mono" style={{ color: "var(--ink-2)" }}>
              {v4.totalChunks} chunks
            </span>
          </div>

          <Barcode
            className="vs-barcode--tall mt-3"
            version={v4}
            label="Version 4 chunk map: new sections at 41–60 and 83–88"
          />
          <div className="vs-changes-index vs-mono" aria-hidden="true">
            <span>00</span>
            <span>{String(v4.totalChunks - 1).padStart(2, "0")}</span>
          </div>

          <Tethers />
          <ChangeSlips />

          <p className="vs-key mt-6" style={{ fontWeight: 400 }}>
            {DOCUMENT_NAME} · {v3.id} → {v4.id} · sample
          </p>

          <div className="vs-changes-kinds">
            <p className="vs-key">Ten kinds of change</p>
            <div className="vs-changes-types">
              {CHANGE_TYPES.map((t) => (
                <span key={t} className="vs-chip-soft vs-mono">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </WashPlate>
        <PlateCaption>
          Four changes recorded between version 3 and version 4 of the sample document, pinned to
          the sections that changed.
        </PlateCaption>
      </SectionWide>
    </Section>
  );
}
