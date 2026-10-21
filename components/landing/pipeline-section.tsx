import { Section, SectionCol, SectionHead } from "./section";
import { PaperCard } from "./paper-card";
import { PlateCaption } from "./plate";
import { SecondaryBtn } from "./primitives";
import Origami from "./origami";
import { DOCUMENT_NAME, PROCESSING_EVENTS, VERSIONS } from "./lineage-data";

const PIPELINE_STAGES: readonly string[] = [
  "Reading text",
  "Uploading",
  "Checking for a repeat",
  "Splitting into sections",
  "Matching earlier sections",
  "Checking the daily limit",
  "Summarizing new sections",
  "Merging the summary",
];

const STAGE_NOTES: readonly string[] = [
  "In your browser, before the file uploads.",
  "The original file is stored.",
  "Same file name and the same text as the latest version: its summary comes back.",
  "Normalized, split mostly at sentence ends, each section hashed with SHA-256.",
  "A section that matches a summarized one from an earlier version keeps its summary.",
  "Only new sections count. Over the limit, the run stops before a version exists.",
  "Sections with no earlier summary are summarized in small batches.",
  "Once every section has one, they merge into the summary; the full text is kept for chat.",
];

export default function PipelineSection() {
  const v = VERSIONS[0];
  return (
    <Section
      id="pipeline"
      foliage={{
        r: [{ top: "-12%", scale: 1, tilt: -2, clock: 1 }],
        l: [{ top: "44%", scale: 0.6, flipY: true, tilt: 5, far: true, clock: 2 }],
      }}
    >
      <SectionCol>
        <div className="vs-split">
          <div className="vs-split-prose">
            <SectionHead
              roman="Upload it,"
              italic="and see what ran"
              sub="Upload a new version under the same file name and only sections without an earlier summary are summarized. Each run's events are recorded on its version."
            />
            <p className="vs-prose mt-8">
              Text is read in your browser first — up to 50 pages of text per PDF; fully scanned
              PDFs are OCR&#39;d in English (up to 10 pages). Word (.docx), Excel, and PowerPoint
              (.pptx) files are read directly.
            </p>
            <div className="mt-6">
              <SecondaryBtn href="#formats">See formats and limits</SecondaryBtn>
            </div>
          </div>

          <div className="relative pb-8 md:pb-16">
            <PaperCard
              seed={11}
              tone="cream"
              torn={{ top: true, bottom: true }}
              tilt={-1.4}
              className="mx-auto w-full max-w-[400px]"
              bodyClassName="px-7 pb-12 pt-8"
            >
              <p className="vs-mono" style={{ color: "var(--ink)" }}>
                {DOCUMENT_NAME}
              </p>
              <p className="vs-key mt-0.5" style={{ fontWeight: 400 }}>
                {v.id} · {v.totalChunks} sections · sample
              </p>
              <div className="vs-receipt-rule mt-3" />
              <ol className="m-0 list-none p-0">
                {PIPELINE_STAGES.map((stage, i) => (
                  <li key={stage} className="vs-receipt-row">
                    <div className="min-w-0 flex-1">
                      <p className="vs-name" style={{ fontSize: 14 }}>
                        {stage}
                      </p>
                      <p className="vs-key mt-0.5" style={{ fontWeight: 400, fontSize: 12 }}>
                        {STAGE_NOTES[i]}
                      </p>
                    </div>
                    <span className="vs-stage-done" aria-label="done" />
                  </li>
                ))}
              </ol>
              <div className="vs-receipt-rule vs-receipt-rule--double mt-4" />
              <p className="vs-key" style={{ fontWeight: 400 }}>
                run complete · totals recorded on the version
              </p>
            </PaperCard>

            <PaperCard
              seed={23}
              tone="mist"
              torn={{ top: true, left: true, bottom: true }}
              tilt={3.2}
              lift
              tapes={[{ kind: 2, width: 70, angle: -42, style: { left: -24, top: -12 } }]}
              className="mt-6 w-[248px] md:absolute md:-bottom-2 md:right-0 md:mt-0"
              bodyClassName="px-5 pb-7 pt-6"
            >
              <p className="vs-key">Events recorded for this version</p>
              <ul className="m-0 mt-2 list-none p-0">
                {PROCESSING_EVENTS.map((name) => {
                  const failed = name === "version_failed";
                  return (
                    <li
                      key={name}
                      className="vs-mono"
                      style={{
                        fontSize: 10.5,
                        lineHeight: "17px",
                        color: failed ? "var(--ink-3)" : "var(--ink-2)",
                      }}
                    >
                      {name}
                    </li>
                  );
                })}
              </ul>
              <p className="vs-key mt-2" style={{ fontWeight: 400, fontSize: 11 }}>
                version_failed exists; it did not happen in this run.
              </p>
            </PaperCard>

            <Origami
              kind="moth-flat-cream"
              id="pm1"
              motion="perch"
              width={44}
              tilt={-9}
              className="vs-origami--xl"
              style={{ top: -18, right: 46 }}
            />
          </div>
        </div>

        <PlateCaption>
          The steps of a finished run, and the events the version records along the way. Sections,
          insights, the graph and search embeddings are generated afterwards, in the background.
        </PlateCaption>
      </SectionCol>
    </Section>
  );
}
