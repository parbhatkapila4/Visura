import { Section, SectionCol, SectionHead } from "./section";
import { PlateCaption, WashPlate } from "./plate";
import { PaperCard } from "./paper-card";
import { Barcode } from "./barcode";
import { CURRENT_VERSION, DOCUMENT_NAME, chunkHash } from "./lineage-data";

const v4 = CURRENT_VERSION;
const QUESTION = "What is the termination notice period?";
const ANSWER =
  "Either party may terminate with 60 days' written notice, per the revised termination clause.";
const SNIPPET = "either party may give 60 days' written notice";
const CITED_CHUNK = 84;

function Sources() {
  return (
    <div className="vs-chat-sources">
      <p className="vs-key">Sources</p>
      <span className="vs-mono mt-1.5">p. 45</span>
      <span className="vs-quote">&ldquo;{SNIPPET}&rdquo;</span>
      <span className="vs-mono vs-chat-ref">
        chunk {CITED_CHUNK} · {chunkHash(v4.number, CITED_CHUNK)}
      </span>
    </div>
  );
}

function CitationMap() {
  return (
    <div className="mt-5">
      <p className="vs-key">the answer&rsquo;s section, on the version map</p>
      <div className="vs-chat-map">
        <span className="vs-chat-tick" aria-hidden="true" />
        <Barcode
          version={v4}
          label="Version 4 chunk map; the cited section 84 sits in the new band 83–88"
        />
      </div>
    </div>
  );
}

export default function ChatSection() {
  return (
    <Section
      id="chat"
      foliage={{
        l: [{ top: "-16%", scale: 0.98, flipY: true, tilt: 2, clock: 3 }],
        r: [{ top: "30%", scale: 0.64, tilt: -3, far: true, clock: 1 }],
      }}
    >
      <SectionCol>
        <div className="vs-split">
          <div className="vs-split-prose">
            <SectionHead
              roman="Ask it anything;"
              italic="it cites the page"
              sub="Every answer comes back with the page number, the snippet, and the section it was drawn from, so you can check it against the document."
            />
            <p className="vs-prose mt-6">
              Chat with a document in sessions. For long documents (over 5,000 characters) context
              is retrieved by embedding similarity over the document&rsquo;s own sections.
              Embeddings are cached by content hash.
            </p>
          </div>

          <div>
            <WashPlate tone="sky" id="chat" size="half">
              <div className="relative px-1 py-3 sm:px-3 md:py-5">
                <PaperCard
                  seed={71}
                  tone="cream"
                  torn={{ right: true, bottom: true }}
                  tilt={-2}
                  tapes={[{ kind: 1, width: 74, angle: -9, style: { left: -20, top: -11 } }]}
                  className="w-[85%] max-w-[330px]"
                  bodyClassName="px-5 pb-10 pt-4"
                >
                  <p className="vs-key">You</p>
                  <p className="vs-name mt-1.5" style={{ fontSize: 15 }}>
                    {QUESTION}
                  </p>
                </PaperCard>

                <PaperCard
                  seed={72}
                  tone="white"
                  torn={{ bottom: true }}
                  tilt={1}
                  lift
                  className="relative z-[1] -mt-6 ml-auto w-[94%] max-w-[400px] md:-mt-8"
                  bodyClassName="px-6 pb-9 pt-6"
                >
                  <p className="vs-key">Visura</p>
                  <p className="vs-prose mt-1.5">{ANSWER}</p>
                  <Sources />
                  <CitationMap />
                  <p
                    className="vs-key mt-5 pt-3"
                    style={{ fontWeight: 400, borderTop: "1px solid #ecebe6" }}
                  >
                    {DOCUMENT_NAME} · {v4.id} · sample
                  </p>
                </PaperCard>
              </div>
            </WashPlate>
            <PlateCaption>One stored answer and its source.</PlateCaption>
          </div>
        </div>
      </SectionCol>
    </Section>
  );
}
