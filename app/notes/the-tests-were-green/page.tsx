import type { Metadata } from "next";
import Link from "next/link";
import Foliage, { FoliageDefs } from "@/components/landing/foliage";
import LandingHeader from "@/components/landing/landing-header";
import FooterSection from "@/components/landing/footer-section";
import "../../reading.css";

export const metadata: Metadata = {
  title: "The tests were green and the feature was dead — Visura",
  description:
    "A green test suite and a golden corpus of 13 export variants, yet two PDFs of the same contract still compared as changed. What the fixtures could not see, and why.",
};
export default function TestsWereGreenNote() {
  return (
    <div data-vs-landing className="min-h-dvh">
      <FoliageDefs />
      <LandingHeader />
      <main id="vs-main" tabIndex={-1}>
        <article className="vs-note">
          <Foliage
            side="l"
            lower
            masses={[{ top: "3%", scale: 0.82, tilt: 3, far: true, clock: 2 }]}
          />
          <Foliage
            side="r"
            lower
            masses={[{ top: "36%", scale: 0.7, flipY: true, tilt: -5, far: true, clock: 3 }]}
          />

          <div className="vs-note-col">
            <p className="vs-note-eyebrow">Engineering note</p>
            <h1 className="vs-note-title">
              The tests were green and the feature was <em>dead</em>
            </h1>
            <p className="vs-note-standfirst">
              Visura tells you how much of a document did not change, once its text is normalised. I
              measured that claim, found it was worth nothing, fixed it, tested it hard, and
              shipped. Then I compared two real PDFs of the same contract, and it reported the
              contract as changed.
            </p>
            <p className="vs-note-meta">Parbhat Kapila · September 2026</p>

            <div className="vs-note-body">
              <p>
                Visura&rsquo;s job is a negative claim. Not <em>here are the differences</em> —
                every tool since the 1990s does that — but{" "}
                <em>nothing else moved, and here is the count</em>. That claim is the entire
                product, and it has a property most claims don&rsquo;t: being confidently wrong
                about it is worse than not making it. A tool that shows you a false difference
                wastes a minute. A tool that says a clause is unchanged when it isn&rsquo;t makes
                you skip reading the clause that moved.
              </p>
              <p>
                So the interesting question was never whether the feature existed. It was whether it
                was true.
              </p>

              <h2>The number I had not looked at</h2>
              <p>
                The claim rested on chunk reuse: split the document into sections, hash each one,
                and anything whose hash matches the previous version is carried forward untouched.
                This had been in the codebase for months. It had a schema, metrics columns, a
                dashboard readout. What it did not have was a measurement.
              </p>
              <p>
                I wrote one. Take a 90-clause agreement, insert a single sentence into clause 8, and
                ask how much of the new version is carried forward from the old. The answer should
                be &ldquo;almost all of it.&rdquo;
              </p>
              <div className="vs-note-fig">
                <table>
                  <thead>
                    <tr>
                      <th>Edit lands at</th>
                      <th>Carried forward</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>clause 8 of 90 (front)</td>
                      <td className="vs-note-bad">6.9%</td>
                    </tr>
                  </tbody>
                </table>
                <p className="vs-note-figcap">
                  The original chunker, measured against itself. One inserted sentence.
                </p>
              </div>
              <p>
                That number is a confession. Reuse depended on <em>where</em> the edit landed, which
                means it was not really working anywhere — it just failed invisibly when the edit
                happened to be near the end. The cause was one line: chunk boundaries were decided
                by a running character count. Every boundary therefore depended on everything before
                it, so inserting a sentence at the front shifted every subsequent boundary by a few
                characters and changed every subsequent hash. Nothing matched. The feature the whole
                product rested on worked properly only for edits near the end of a file.
              </p>
              <p>
                The fix is an old idea: let the content decide. A boundary opens when a hash of{" "}
                <em>that unit&rsquo;s own text</em> passes a gate, not when a counter fills up; a
                size ceiling only cuts a chunk that no gate has closed. Because the size accumulator
                resets at every boundary, an edit can only disturb the chunk it lands in and any
                that follow before the next boundary the content decides, and alignment re-syncs
                from there.
              </p>
              <div className="vs-note-fig">
                <table>
                  <thead>
                    <tr>
                      <th>Edit lands at</th>
                      <th>Carried forward</th>
                      <th>Passages touched</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>front</td>
                      <td className="vs-note-good">99.3%</td>
                      <td>1 of 135</td>
                    </tr>
                    <tr>
                      <td>middle</td>
                      <td className="vs-note-good">99.3%</td>
                      <td>1 of 135</td>
                    </tr>
                    <tr>
                      <td>end</td>
                      <td className="vs-note-good">99.3%</td>
                      <td>1 of 134</td>
                    </tr>
                  </tbody>
                </table>
                <p className="vs-note-figcap">
                  Content-defined boundaries, same fixture, one sentence inserted at each point. One
                  passage moves, wherever you put the edit.
                </p>
              </div>
              <p>
                One detail is worth keeping, because it is the one I got wrong twice. There is
                deliberately <strong>no minimum chunk size</strong>. A minimum feels obviously
                sensible — nobody wants a 40-character chunk — but &ldquo;close the boundary if the
                chunk is already long enough&rdquo; puts accumulated length back into the decision,
                and a perturbation carries into the chunks after it before it re-syncs. Dropping the
                minimum is what bought the perfect re-sync in that last column.
              </p>

              <h2>Then I made it hard to be wrong</h2>
              <p>
                Knowing how bad the first measurement was, I went at the tests properly. The danger
                is not a missed difference; it is a fabricated one. Two exports of the same contract
                from two different word processors differ in line wrapping, hyphenation, quote
                glyphs, ligatures, running headers and page numbers, without a single word having
                changed. If any of that surfaces as a change, the coverage number is noise. That is
                why the text is normalised before anything is hashed. The normaliser also drops any
                line that reads like a page number, including a line of nothing but digits, so a
                change inside such a line can go unreported.
              </p>
              <p>
                So: a golden corpus. One agreement in 13 export variants — the file unchanged, curly
                quotes and em dashes, ligatures, different column widths, hyphenation at a line end,
                hyphenation landing on a page break, different running headers and page numbers,
                non-breaking spaces, doubled blank lines, CRLF, and finally several of them at once.
                Every variant must report zero changes, in both directions. Then tests that a real
                edit is still found buried in the noisiest variant, that a renumbered list is
                cosmetic, that <code>net 30 → net 45</code> is <em>not</em>.
              </p>
              <p>Every test was green. I believed the feature worked, and I had receipts.</p>

              <h2>The PDFs</h2>
              <p>
                The last thing left was end-to-end validation with real documents, which I had been
                treating as a formality. I generated two PDFs with a real PDF writer: the same
                agreement, once at A4 and once at US Letter. Different page size means different
                line breaks, different pagination, running headers in different places — and not one
                word different. Then I drove the actual page in a real browser and dropped them in.
              </p>
              <p className="vs-note-pull">
                SAME contract, A4 vs Letter — reported as changed, ranked material.
              </p>
              <p>
                That is the precise failure the product exists to prevent, printed by the product,
                on the easiest case there is.
              </p>
              <p>
                The cause took a while to find because it was nowhere near the code I had been
                testing. The PDF extractor built each page&rsquo;s text by taking the text items
                pdf.js returns and joining them with a space. Not a newline — a space. Every PDF
                therefore arrived downstream as a single unbroken run of characters with no line
                structure and no page boundaries in it.
              </p>
              <p>
                And the pass that removes running headers and page numbers works on lines. With no
                lines, it matched nothing and removed nothing. It had been dead code on every real
                PDF since the day it was written. The A4 file and the Letter file each carried{" "}
                <code>Acme Corp / Confidential</code> at the top of both pages, at different
                character offsets, and the comparison correctly reported that some text had moved.
              </p>
              <p>
                The tests passed because every fixture in them was a string I had typed, and I had
                typed newlines in it. The furniture pass worked beautifully on my hand-written
                documents. It had simply never once been given a document the program itself had
                produced.
              </p>
              <p className="vs-note-pull">
                A test that supplies its own input can never catch the input being wrong.
              </p>
              <p>
                That is the whole lesson and it generalises past this bug. A fixture encodes an
                assumption about the shape of the data, and if that assumption is the thing that is
                broken, the test agrees with the bug. Every one of mine agreed with it and told me I
                was fine.
              </p>

              <h2>What fixing it uncovered</h2>
              <p>
                The repair was to keep the structure: rebuild lines from the flag pdf.js already
                sets at the end of each rendered line, separate pages with a form feed, and make the
                furniture pass page-aware — a short line that reads like a label, not a sentence, is
                a running header if its digit-folded template appears at the <em>same</em> page edge
                on two or more pages. That catches <code>Acme Corp / Confidential 2</code>, which is
                never byte-identical twice. I also lost time to a detail I would not have guessed:{" "}
                <code>trim()</code> counts a form feed as whitespace, so the page markers were being
                quietly erased one step before the pass that needed them.
              </p>
              <p>
                With repagination no longer drowning everything, two more real bugs surfaced
                immediately — both of them the under-reporting kind, which is the kind that matters.
              </p>
              <p>
                Two edits in adjacent passages were being merged into a single card. That merge
                exists for a good reason: an edit that crosses a passage boundary should not be
                reported three times. But two unrelated edits that happen to land next to each other
                are two changes, and a reviewer counting cards was being told there was one. The
                split now happens at long runs of untouched text, and a single edit crossing a
                boundary still arrives as one card.
              </p>
              <p>
                And <code>thirty days → ninety days</code> was ranked merely substantive, because
                the materiality classifier looked for digits. A notice period tripling is material
                whether the contract writes it as <code>30</code> or as <code>thirty</code>. It had
                been hidden until now because the money edit sitting next to it had been dragging
                the merged card up to material.
              </p>

              <h2>Where it ended up</h2>
              <p>Three pairs, through the production build, in a real browser:</p>
              <div className="vs-note-fig">
                <table>
                  <thead>
                    <tr>
                      <th>Pair</th>
                      <th>Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>A4 vs Letter, same contract</td>
                      <td className="vs-note-good">Nothing changed</td>
                    </tr>
                    <tr>
                      <td>A4 vs A4, two edits</td>
                      <td>Both edits found, both material</td>
                    </tr>
                    <tr>
                      <td>Letter vs A4 + edits</td>
                      <td>Both edits found, both material</td>
                    </tr>
                  </tbody>
                </table>
                <p className="vs-note-figcap">
                  The third pair is the hard one: real edits and a re-export at a different page
                  size at the same time. The repagination contributes nothing.
                </p>
              </div>
              <p>
                A new set of tests holds the fix down, and every fixture in them carries the page
                markers the extractor actually emits. Several of them assert the pass does{" "}
                <em>not</em> fire: a repeated complete sentence survives, a heading that appears at
                the edge of only one page survives, a short phrase that appears twice mid-body
                survives. Those are the tests that matter, because deleting real text is how you
                manufacture a false &ldquo;unchanged.&rdquo;
              </p>
              <p>
                The engine that produces the claim still contains no model of any kind. It is
                hashing, alignment and a diff — deterministic and checkable by hand. That was a
                deliberate choice and this episode is the argument for it: when the answer came out
                wrong, there was something to measure and a specific line to blame. You cannot
                bisect a vibe.
              </p>
            </div>

            <p className="vs-note-foot">
              The comparison this note is about runs in your browser with no account, and neither
              file is uploaded —{" "}
              <Link href="/compare">try it on two versions of something you have</Link>, or on the
              sample pair on that page, which is the Letter vs A4 + edits pair above.
            </p>
          </div>
        </article>
      </main>
      <FooterSection closing={false} />
    </div>
  );
}
