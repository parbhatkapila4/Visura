import { Section, SectionCol, SectionHead } from "./section";
import Origami from "./origami";
import { PaperCard } from "./paper-card";
import { PlateCaption, WashPlate } from "./plate";
import { Barcode } from "./barcode";
import { Ledger } from "./ledger";
import { CellStrip } from "./primitives";
import { CURRENT_VERSION, MINI_STRIP, VERSIONS } from "./lineage-data";

const v4 = CURRENT_VERSION;
const v3 = VERSIONS[1];

function BandLabels() {
  return (
    <div className="vs-bands" aria-hidden="true">
      {v4.newBands.map(([a, b]) => (
        <span
          key={a}
          className="vs-mono vs-band"
          style={{
            left: `${((a + (b - a + 1) / 2) / v4.totalChunks) * 100}%`,
          }}
        >
          {a}–{b}
        </span>
      ))}
    </div>
  );
}

export default function ReuseSection() {
  return (
    <Section
      id="reuse"
      foliage={{
        r: [{ top: "-4%", scale: 0.92, flipY: true, tilt: -4, far: true, clock: 3 }],
        l: [{ top: "36%", scale: 0.66, tilt: 3, clock: 1 }],
      }}
    >
      <SectionCol>
        <div className="vs-split">
          <div className="vs-split-prose">
            <SectionHead
              roman="Only what changed"
              italic="gets summarized again"
              sub="The text is normalized, grouped into sections of sentences, and each section is hashed with SHA-256. Upload a revision under the same file name and sections whose hash matches an earlier version keep their summaries; only the new ones are summarized. Upload it again under the same name with text that matches the latest version exactly and no new version is made."
            />
            <Ledger
              className="mt-8"
              rows={[
                {
                  k: "Section size",
                  v: "a run of sentences, ended by a sentence's own hash or once it reaches about 1,200 characters",
                  prose: true,
                },
                { k: "Hash", v: "SHA-256 · 64 hex" },
                {
                  k: "Carried forward",
                  v: "sections whose text matches an earlier version after normalizing (spacing, quote marks, dashes, hyphenation) and dropping page numbers and repeated short lines such as headers",
                  prose: true,
                },
              ]}
            />
          </div>

          <div className="relative">
            <WashPlate tone="moss" id="reuse" size="half">
              <PaperCard
                seed={31}
                tone="white"
                torn={{ bottom: true }}
                tilt={-1}
                tapes={[{ kind: 1, width: 64, angle: -38, style: { left: -22, top: -10 } }]}
                bodyClassName="px-6 pt-6 pb-7 md:px-7"
              >
                <p className="vs-key">Version lineage · {v4.totalChunks} chunks</p>

                <div className="mt-4 space-y-4">
                  <div>
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="vs-mono" style={{ color: "var(--ink)" }}>
                        {v3.id} <span style={{ color: "var(--ink-3)" }}>{v3.hash}</span>
                      </span>
                      <span className="vs-mono" style={{ color: "var(--ink-3)" }}>
                        {v3.reusedChunks} reused · {v3.newChunks} new
                      </span>
                    </div>
                    <Barcode
                      className="mt-2"
                      version={v3}
                      label={`Version 3: ${v3.totalChunks} chunks, ${v3.reusedChunks} reused, ${v3.newChunks} new`}
                    />
                  </div>
                  <div>
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="vs-mono" style={{ color: "var(--ink)" }}>
                        {v4.id} <span style={{ color: "var(--ink-3)" }}>{v4.hash}</span>
                      </span>
                      <span className="vs-mono" style={{ color: "var(--ink-3)" }}>
                        {v4.reusedChunks} reused · {v4.newChunks} new
                      </span>
                    </div>
                    <Barcode
                      className="vs-barcode--tall mt-2"
                      version={v4}
                      label={`Version 4: ${v4.totalChunks} chunks, ${v4.reusedChunks} reused, ${v4.newChunks} new`}
                    />
                    <BandLabels />
                  </div>
                </div>

                <div className="vs-sum mt-6">
                  <div className="vs-sum-line vs-sum-top--paper">
                    <span className="vs-numeral" style={{ color: "var(--reused)" }}>
                      {v4.reusedChunks}
                    </span>
                    <span className="vs-key">reused</span>
                    <span className="vs-numeral" style={{ color: "var(--new)" }}>
                      + {v4.newChunks}
                    </span>
                    <span className="vs-key">new</span>
                  </div>
                  <div className="vs-sum-line vs-sum-close--paper">
                    <span className="vs-numeral" style={{ color: "var(--ink)" }}>
                      = {v4.totalChunks}
                    </span>
                    <span className="vs-key">chunks</span>
                  </div>
                  <p className="vs-key mt-3">
                    carried forward{" "}
                    <span className="vs-mono-em" style={{ color: "var(--ink)" }}>
                      {Math.round((v4.reusedChunks / v4.totalChunks) * 100)}%
                    </span>
                  </p>
                </div>

                <div className="vs-win-foot">
                  <CellStrip
                    states={MINI_STRIP.states}
                    size={12}
                    gap={2}
                    surface="paper"
                    label="Chunks 54 to 73 of the sample document: seven new, thirteen reused"
                  />
                  <p className="vs-key mt-2" style={{ fontWeight: 400 }}>
                    sections 54–73 · sample
                  </p>
                </div>
              </PaperCard>
            </WashPlate>
            <Origami
              kind="crane-stand-cream"
              id="rp1"
              motion="perch"
              width={60}
              className="vs-origami--xl"
              style={{ top: -32, right: 34 }}
            />
            <PlateCaption>
              Version 3 to version 4 of the sample document. Sections 41–60 and 83–88 changed; the
              other 68 kept their summaries.
            </PlateCaption>
          </div>
        </div>
      </SectionCol>
    </Section>
  );
}
