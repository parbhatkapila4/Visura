import { Section, SectionWide, SectionHead } from "./section";
import { PaperCard, type PaperTone, type TapeSpec } from "./paper-card";
import { PlateCaption } from "./plate";
import { CellStrip } from "./primitives";
import {
  DOCUMENT_NAME,
  GUARDRAIL_MESSAGE,
  REPLAY_EXHIBIT,
  VERSIONS,
  type ChunkState,
} from "./lineage-data";

interface StateSpecimen {
  name: string;
  state: ChunkState | "blocked";
  hex: string;
  means: string;
  when: string;
}

const STATES: StateSpecimen[] = [
  {
    name: "reused",
    state: "reused",
    hex: "#0D786C / #37D2BE",
    means: "cached from a previous version",
    when: "the hash matched and the summary was kept",
  },
  {
    name: "new",
    state: "new",
    hex: "#A65808 / #F2A93B",
    means: "processed this version",
    when: "only these chunks were sent to the model",
  },
  {
    name: "in flight",
    state: "inflight",
    hex: "#5B7690 / #7E9BBB",
    means: "queued or processing right now",
    when: "drawn hollow, never a fake spinner",
  },
  {
    name: "replayed",
    state: "replayed",
    hex: "#C13B72 / #F07CB8",
    means: "any incomplete version can be replayed",
    when: "finished chunks are never reprocessed",
  },
  {
    name: "blocked",
    state: "blocked",
    hex: "#BF3B2F",
    means: "the daily processing budget was exceeded",
    when: "the run stopped before anything was written",
  },
];

const SWATCH_PINS: Array<{
  tone: PaperTone;
  seed: number;
  tilt: number;
  torn: { top?: boolean; right?: boolean; bottom?: boolean; left?: boolean };
  offset: string;
  tapes?: TapeSpec[];
}> = [
    {
      tone: "white",
      seed: 51,
      tilt: -3,
      torn: { bottom: true },
      offset: "mt-2",
      tapes: [{ kind: 1, width: 62, angle: -7, style: { left: -14, top: -11 } }],
    },
    {
      tone: "cream",
      seed: 52,
      tilt: 2,
      torn: { top: true, right: true },
      offset: "-mt-1 md:-mt-2",
    },
    {
      tone: "mist",
      seed: 53,
      tilt: -1.5,
      torn: { left: true, bottom: true },
      offset: "mt-3 md:mt-4",
      tapes: [{ kind: 2, width: 62, angle: 9, style: { right: -14, top: -11 } }],
    },
    {
      tone: "cream",
      seed: 54,
      tilt: 3,
      torn: { top: true },
      offset: "-mt-1 md:-mt-2",
    },
    {
      tone: "white",
      seed: 55,
      tilt: -2,
      torn: { right: true, bottom: true },
      offset: "mt-2",
      tapes: [{ kind: 1, width: 62, angle: 6, style: { left: -12, top: -10 } }],
    },
  ];

function StateMark({ state }: { state: ChunkState | "blocked" }) {
  if (state === "blocked") {
    return (
      <div className="flex h-7 items-end" aria-hidden="true">
        <div style={{ width: 28, height: 3, backgroundColor: "var(--blocked)" }} />
      </div>
    );
  }
  return (
    <span className="vs-cellset-paper inline-flex h-7" aria-hidden="true">
      <span className={`vs-cell vs-cell--${state}`} style={{ width: 28, height: 28 }} />
    </span>
  );
}

export default function StatesSection() {
  const v2 = VERSIONS[2];
  return (
    <Section
      id="states"
      foliage={{
        l: [{ top: "-8%", scale: 1, tilt: 3, clock: 2 }],
        r: [{ top: "48%", scale: 0.62, flipY: true, tilt: -6, far: true, clock: 3 }],
      }}
    >
      <SectionWide>
        <SectionHead
          roman="Five states,"
          italic="nothing hidden"
          sub="Each section says what happened to it: kept, processed, still running, recovered after a failure, or stopped by the daily limit."
        />
      </SectionWide>

      <SectionWide>
        <div className="flex flex-wrap items-start justify-center gap-7">
          {STATES.map((s, i) => {
            const pin = SWATCH_PINS[i];
            return (
              <PaperCard
                key={s.name}
                seed={pin.seed}
                tone={pin.tone}
                torn={pin.torn}
                tilt={pin.tilt}
                tapes={pin.tapes}
                className={`w-[176px] ${pin.offset}`}
                bodyClassName="p-5"
              >
                <StateMark state={s.state} />
                <p className="vs-specimen-name mt-3">{s.name}</p>
                <p className="vs-mono mt-1" style={{ fontSize: 10.5, color: "var(--ink-3)" }}>
                  {s.hex}
                </p>
                <p className="vs-prose mt-2.5" style={{ fontSize: 13 }}>
                  {s.means}
                </p>
                <p className="vs-key mt-1" style={{ fontWeight: 400, fontSize: 11 }}>
                  {s.when}
                </p>
              </PaperCard>
            );
          })}
        </div>

        <div className="mt-14 grid grid-cols-1 gap-10 min-[900px]:grid-cols-2">
          <PaperCard
            seed={57}
            tone="cream"
            torn={{ left: true, right: true }}
            tilt={1.2}
            bodyClassName="px-8 pb-8 pt-7"
          >
            <p className="vs-name">A replay, mid-run</p>
            <CellStrip
              className="vs-states-replay mt-3"
              states={REPLAY_EXHIBIT.states}
              size={16}
              gap={3}
              surface="paper"
              label="Chunks 35 to 54 of version 2 mid-replay: five reused, three replayed, six in flight, six reused"
            />
            <p className="vs-prose mt-4" style={{ fontSize: 14 }}>
              A moment during version 2&rsquo;s replay. The failed run left nine sections
              unsummarized; the replay recovered three, has six in flight, and never touched the
              finished ones. Any incomplete version can be replayed.
            </p>
            <p className="vs-key mt-4" style={{ fontWeight: 400 }}>
              {DOCUMENT_NAME} · {v2.id} · replay · sample
            </p>
          </PaperCard>

          <PaperCard
            seed={58}
            tone="white"
            torn={{ top: true }}
            tilt={-2}
            lift
            tapes={[{ kind: 1, width: 72, angle: -40, style: { right: -20, top: -14 } }]}
            bodyClassName="px-8 pb-8 pt-7"
          >
            <div style={{ borderTop: "3px solid var(--blocked)", paddingTop: 18 }}>
              <p className="vs-quote" style={{ fontSize: 19, lineHeight: 1.45 }}>
                &ldquo;{GUARDRAIL_MESSAGE}&rdquo;
              </p>
              <p className="vs-key mt-3.5">Checked before anything is written. No partial state.</p>
            </div>
          </PaperCard>
        </div>

        <PlateCaption>
          The legend, and the two states the readout above never shows: a replay in progress, and a
          run the daily limit stopped.
        </PlateCaption>
      </SectionWide>
    </Section>
  );
}
