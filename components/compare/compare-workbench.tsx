"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  changesOnlyHeadline,
  compareDocuments,
  coverageHeadline,
  type ChangeCard,
} from "@/lib/document-compare";
import { memoFilename, memoHtml, memoText } from "@/lib/compare-memo";
import { changeTopics, claimVerdict } from "@/lib/change-claims";
import type { WordOp } from "@/lib/document-segmentation";
import "./compare.css";

const loadExtractor = () => import("@/lib/document-extractor");
const SAMPLES = {
  sent: "agreement-sent.pdf",
  returned: "agreement-returned.pdf",
} as const;

type Stage = "idle" | "reading" | "comparing" | "done" | "error";
type ReadOutcome = { ok: true; loaded: Loaded } | { ok: false; message: string };
async function readDocument(file: File): Promise<ReadOutcome> {
  const { extractDocumentWithMeta, isFileTypeSupported } = await loadExtractor();
  if (!isFileTypeSupported(file)) {
    return { ok: false, message: `${file.name} is not a format Visura can read.` };
  }
  const { text, ...meta } = await extractDocumentWithMeta(file);
  if (!text || text.trim().length < 20) {
    return {
      ok: false,
      message: `No text could be read from ${file.name}. If it is a scan, Visura reads up to 10 pages with OCR.`,
    };
  }
  return { ok: true, loaded: { name: file.name, text, ...meta } };
}

interface Loaded {
  name: string;
  text: string;
  ocrUsed: boolean;
  truncated: boolean;
  totalPages: number | null;
  pagesRead: number | null;
  pageStartOffsets: number[];
}

export default function CompareWorkbench() {
  const [before, setBefore] = useState<Loaded | null>(null);
  const [after, setAfter] = useState<Loaded | null>(null);
  const [stage, setStage] = useState<Stage>("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ReturnType<typeof compareDocuments> | null>(null);
  const [showCosmetic, setShowCosmetic] = useState(false);
  const [copied, setCopied] = useState(false);
  const [acknowledged, setAcknowledged] = useState<Set<string>>(new Set());

  const compare = useCallback((b: Loaded, a: Loaded) => {
    try {
      setAcknowledged(new Set());
      setResult(
        compareDocuments(b.text, a.text, {
          pageStartOffsets: a.pageStartOffsets,
          rawAfterLength: a.text.length,
        })
      );
      setStage("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "The comparison failed.");
      setStage("error");
    }
  }, []);

  const run = useCallback(async () => {
    if (!before || !after) return;
    setError(null);
    setStage("comparing");
    await new Promise((r) => setTimeout(r, 16));
    compare(before, after);
  }, [before, after, compare]);
  const runSamples = useCallback(async () => {
    setError(null);
    setStage("reading");
    try {
      const files = await Promise.all(
        [SAMPLES.sent, SAMPLES.returned].map(async (name) => {
          const res = await fetch(`/samples/${name}`);
          if (!res.ok) throw new Error(`Could not load the sample ${name}.`);
          return new File([await res.blob()], name, { type: "application/pdf" });
        })
      );
      const outcomes = await Promise.all(files.map(readDocument));
      const failed = outcomes.find((o) => !o.ok);
      if (failed && !failed.ok) {
        setError(failed.message);
        setStage("error");
        return;
      }
      const [b, a] = outcomes.map((o) => (o.ok ? o.loaded : null));
      if (!b || !a) return;
      setBefore(b);
      setAfter(a);
      setStage("comparing");
      await new Promise((r) => setTimeout(r, 16));
      compare(b, a);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load the sample pair.");
      setStage("error");
    }
  }, [compare]);

  const reset = () => {
    setBefore(null);
    setAfter(null);
    setResult(null);
    setStage("idle");
    setError(null);
    setShowCosmetic(false);
    setAcknowledged(new Set());
  };

  const material = useMemo(
    () => result?.changes.filter((c) => c.materiality === "material") ?? [],
    [result]
  );
  const substantive = useMemo(
    () => result?.changes.filter((c) => c.materiality === "substantive") ?? [],
    [result]
  );
  const cosmetic = useMemo(
    () => result?.changes.filter((c) => c.materiality === "cosmetic") ?? [],
    [result]
  );

  const caveats = useMemo(() => {
    const out: string[] = [];
    for (const f of [before, after]) {
      if (!f) continue;
      if (f.truncated) {
        out.push(
          `${f.name} has ${f.totalPages} pages and at most the first ${f.pagesRead} were read, so the rest was never compared.`
        );
      } else if (f.ocrUsed) {
        out.push(
          `${f.name} is a scan, read with OCR. Character recognition can misread text, so a passage can differ from the other file without the document having changed.`
        );
      }
    }
    return out;
  }, [before, after]);
  const coverageIsSound = Boolean(before && after) && caveats.length === 0;
  const topics = useMemo(() => (result ? changeTopics(result) : []), [result]);
  const verdict = useMemo(
    () => (result ? claimVerdict(result, acknowledged) : null),
    [result, acknowledged]
  );

  const toggleAcknowledged = useCallback((id: string) => {
    setAcknowledged((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const memoInput = useMemo(
    () =>
      result && before && after
        ? {
            result,
            beforeName: before.name,
            afterName: after.name,
            coverageIsSound,
            caveats,
            verdict: verdict ?? undefined,
          }
        : null,
    [result, before, after, coverageIsSound, caveats, verdict]
  );

  const copySummary = useCallback(async () => {
    if (!memoInput) return;
    try {
      await navigator.clipboard.writeText(memoText(memoInput));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2400);
    } catch {
      setError("Your browser would not let the page write to the clipboard.");
    }
  }, [memoInput]);
  const downloadMemo = useCallback(() => {
    if (!memoInput) return;
    const blob = new Blob([memoHtml(memoInput)], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = memoFilename(memoInput.afterName);
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, [memoInput]);

  if (result && stage === "done") {
    return (
      <div className="vs-cmp">
        <div className="vs-cmp-resulthead">
          <p className="vs-cmp-eyebrow">
            {before?.name} → {after?.name}
          </p>
          <h1 className="vs-cmp-headline">
            {coverageIsSound ? coverageHeadline(result) : changesOnlyHeadline(result)}
          </h1>
          <p className="vs-cmp-note">
            Compared in this browser. Neither file was uploaded.{" "}
            <button type="button" className="vs-cmp-link" onClick={reset}>
              Compare another pair
            </button>
          </p>
          <div className="vs-cmp-share">
            <button type="button" className="vs-cmp-share-btn" onClick={copySummary}>
              {copied ? "Copied" : "Copy summary"}
            </button>
            <button type="button" className="vs-cmp-share-btn" onClick={downloadMemo}>
              Download memo
            </button>
            <span className="vs-cmp-share-hint">
              A single file you can attach to an email. Built here, not on a server.
            </span>
          </div>
        </div>
        {result.changes.length > 0 && verdict && (
          <div className="vs-cmp-claim">
            <p className="vs-cmp-claim-q">What were you told changed?</p>
            <p className="vs-cmp-claim-sub">
              Tick the ones they mentioned. Visura names what is left over.
            </p>

            <ul className="vs-cmp-claim-list">
              {topics.map((topic) => {
                const ticked = acknowledged.has(topic.id);
                return (
                  <li key={topic.id}>
                    <label className="vs-cmp-claim-item">
                      <input
                        type="checkbox"
                        className="vs-cmp-claim-box"
                        checked={ticked}
                        onChange={() => toggleAcknowledged(topic.id)}
                      />
                      <span className="vs-cmp-claim-label">{topic.label}</span>
                      {topic.page !== null && (
                        <span className="vs-cmp-claim-page">p. {topic.page}</span>
                      )}
                    </label>
                  </li>
                );
              })}
            </ul>

            {verdict.answered && (
              <div
                className={
                  verdict.unmentioned.length > 0
                    ? "vs-cmp-verdict vs-cmp-verdict--flag"
                    : "vs-cmp-verdict"
                }
                role="status"
              >
                <p className="vs-cmp-verdict-line">{verdict.headline}</p>
                {verdict.unmentioned.length > 0 && (
                  <ul className="vs-cmp-verdict-list">
                    {verdict.unmentioned.map((c) => {
                      const topic = topics.find((t) => t.id === c.id);
                      return (
                        <li key={c.id}>
                          {topic?.label}
                          {c.page !== null ? ` · page ${c.page}` : ""}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            )}
          </div>
        )}
        {!coverageIsSound && (
          <div className="vs-cmp-warning" role="status">
            <p className="vs-cmp-warning-title">Coverage is not reported for this pair.</p>
            <ul className="vs-cmp-warning-list">
              {caveats.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
            <p className="vs-cmp-warning-foot">
              The changes below are still worth reading — they are simply not a complete account.
            </p>
          </div>
        )}

        {result.changes.length === 0 ? (
          <div className="vs-cmp-empty">
            <p className="vs-cmp-empty-title">Every passage that was read matches.</p>
            <p className="vs-cmp-empty-sub">
              Visura set aside line and paragraph breaks, spacing, hyphenation at line ends, quote
              and dash styles, ligatures and other character variants, short lines that recur at the
              top or bottom of pages (even when their numbers differ), short lines that repeat
              through the document, and any line that reads like a page number, including a line of
              nothing but digits.
            </p>
          </div>
        ) : (
          <div className="vs-cmp-changes">
            {material.length > 0 && (
              <Section
                title="Material"
                caption="Touches an amount, a date, a number, a time period, or a word like shall, liable or terminate. A passage that begins with a change is listed as cosmetic instead when every change in it is one to four letters or digits, even a number or a word like must."
                cards={material}
              />
            )}
            {substantive.length > 0 && (
              <Section
                title="Substantive"
                caption="Changes text that Visura did not match to an amount, date, number, time period or duty word."
                cards={substantive}
              />
            )}
            {cosmetic.length > 0 && (
              <div className="vs-cmp-group">
                <button
                  type="button"
                  className="vs-cmp-collapse"
                  onClick={() => setShowCosmetic((v) => !v)}
                  aria-expanded={showCosmetic}
                >
                  {cosmetic.length} cosmetic {cosmetic.length === 1 ? "change" : "changes"} — only
                  punctuation, or only short words and numbers in a passage that begins with a
                  change. {showCosmetic ? "Hide" : "Show"}
                </button>
                {showCosmetic && (
                  <div className="vs-cmp-cards">
                    {cosmetic.map((c) => (
                      <Card key={c.id} card={c} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <p className="vs-cmp-caveat">
          Coverage is measured over the text as extracted from these two files, after normalisation.
          It is a claim about characters, not about meaning: a clause that was reworded to say the
          same thing still counts as changed, and one moved elsewhere in the document counts as a
          deletion and an insertion, except in a very long document, where passages are matched
          regardless of order, so a passage that only moved may not be reported at all.
          Normalisation drops short lines that recur at the top or bottom of pages (even when their
          numbers differ), short lines that repeat through the document, and any line that reads
          like a page number, including a line of nothing but digits, so a change inside one of
          those lines can go unreported.{" "}
          <Link href="/notes/the-tests-were-green" className="vs-cmp-link">
            How this is measured, and how it was wrong
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="vs-cmp">
      <div className="vs-cmp-intro">
        <h1 className="vs-cmp-title">
          They said <em>minor changes only</em>
        </h1>
        <p className="vs-cmp-sub">
          Drop in the version you sent and the one that came back. Visura shows you every change it
          finds and, when both files were read in full without OCR, how many passages still match
          once formatting, page numbers and short repeated lines are set aside.
        </p>
        <p className="vs-cmp-promise">
          <strong>No account, and nothing is uploaded.</strong> Both files are read and compared by
          this page, on this machine. Open the network tab and check: while a comparison runs, no
          request leaves with a byte of either document in it.
        </p>
      </div>

      <div className="vs-cmp-drops">
        <Drop
          label="The version you sent"
          loaded={before}
          onLoad={setBefore}
          onStage={setStage}
          onError={setError}
        />
        <Drop
          label="The version that came back"
          loaded={after}
          onLoad={setAfter}
          onStage={setStage}
          onError={setError}
        />
      </div>

      {error && (
        <p className="vs-cmp-error" role="alert">
          {error}
        </p>
      )}

      <div className="vs-cmp-actions">
        <button
          type="button"
          className="vs-cmp-cta"
          onClick={run}
          disabled={!before || !after || stage === "reading" || stage === "comparing"}
        >
          {stage === "reading" ? "Reading…" : stage === "comparing" ? "Comparing…" : "Compare"}
        </button>
        <span className="vs-cmp-hint">
          PDF, DOCX, TXT or Markdown.{" "}
          <Link href="/" className="vs-cmp-link">
            What is Visura?
          </Link>
        </span>
      </div>
      <div className="vs-cmp-sample">
        <button
          type="button"
          className="vs-cmp-sample-btn"
          onClick={() => void runSamples()}
          disabled={stage === "reading" || stage === "comparing"}
        >
          Or try it on a sample pair
        </button>
        <p className="vs-cmp-sample-note">
          One agreement, returned by the other side as a fresh export at a different page size — so
          it wraps differently, paginates differently and moves its running header — with two
          clauses genuinely edited. Everything that only <em>looks</em> different has to disappear.
        </p>
      </div>
    </div>
  );
}
function Drop({
  label,
  loaded,
  onLoad,
  onStage,
  onError,
}: {
  label: string;
  loaded: Loaded | null;
  onLoad: (l: Loaded) => void;
  onStage: (s: Stage) => void;
  onError: (e: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);

  const take = useCallback(
    async (file: File | undefined) => {
      if (!file) return;
      onError(null);
      onStage("reading");
      try {
        const outcome = await readDocument(file);
        if (!outcome.ok) {
          onError(outcome.message);
          onStage("idle");
          return;
        }
        onLoad(outcome.loaded);
        onStage("idle");
      } catch (e) {
        onError(e instanceof Error ? e.message : `Could not read ${file.name}.`);
        onStage("error");
      }
    },
    [onError, onLoad, onStage]
  );

  return (
    <div
      className={over ? "vs-cmp-drop vs-cmp-drop--over" : "vs-cmp-drop"}
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        void take(e.dataTransfer.files?.[0]);
      }}
    >
      <input
        ref={inputRef}
        type="file"
        className="sr-only"
        accept=".pdf,.docx,.doc,.txt,.md"
        onChange={(e) => void take(e.target.files?.[0])}
      />
      <p className="vs-cmp-drop-label">{label}</p>
      {loaded ? (
        <p className="vs-cmp-drop-file">{loaded.name}</p>
      ) : (
        <p className="vs-cmp-drop-empty">Drop a file, or</p>
      )}
      <button type="button" className="vs-cmp-drop-btn" onClick={() => inputRef.current?.click()}>
        {loaded ? "Choose a different file" : "choose one"}
      </button>
    </div>
  );
}

function Section({
  title,
  caption,
  cards,
}: {
  title: string;
  caption: string;
  cards: ChangeCard[];
}) {
  return (
    <div className="vs-cmp-group">
      <div className="vs-cmp-grouphead">
        <h2 className="vs-cmp-grouptitle">
          {title} <span className="vs-cmp-count">{cards.length}</span>
        </h2>
        <p className="vs-cmp-groupcaption">{caption}</p>
      </div>
      <div className="vs-cmp-cards">
        {cards.map((c) => (
          <Card key={c.id} card={c} />
        ))}
      </div>
    </div>
  );
}

function Card({ card }: { card: ChangeCard }) {
  const kindLabel =
    card.kind === "inserted" ? "Added" : card.kind === "deleted" ? "Removed" : "Changed";
  return (
    <article className={`vs-cmp-card vs-cmp-card--${card.materiality}`}>
      <p className="vs-cmp-cardmeta">
        <span className="vs-cmp-kind">{kindLabel}</span>
        {card.page !== null && <span className="vs-cmp-page">page {card.page}</span>}
      </p>
      <p className="vs-cmp-diff">
        <Diff ops={card.diff} />
      </p>
    </article>
  );
}
function Diff({ ops }: { ops: WordOp[] }) {
  return (
    <>
      {ops.map((op, i) => {
        if (op.type === "equal") return <span key={i}>{op.text}</span>;
        if (op.type === "delete")
          return (
            <del key={i} className="vs-cmp-del">
              {op.text}
            </del>
          );
        return (
          <ins key={i} className="vs-cmp-ins">
            {op.text}
          </ins>
        );
      })}
    </>
  );
}
