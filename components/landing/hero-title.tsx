import type { CSSProperties } from "react";

function Word({ word, start }: { word: string; start: number }) {
  return (
    <span style={{ whiteSpace: "nowrap" }}>
      {Array.from(word).map((ch, k) => (
        <span key={k} className="vs-letter" style={{ "--i": start + k } as CSSProperties}>
          {ch}
        </span>
      ))}
    </span>
  );
}

export default function HeroTitle({ roman, italic }: { roman: string; italic: string }) {
  let cursor = 0;
  const run = (text: string) =>
    text.split(" ").map((word, wi) => {
      const start = cursor;
      cursor += word.length + 1;
      return (
        <span key={wi}>
          {wi > 0 ? " " : null}
          <Word word={word} start={start} />
        </span>
      );
    });

  const romanNodes = run(roman);
  const italicNodes = run(italic);

  return (
    <div className="vs-hero-line">
      <span className="vs-paren" aria-hidden="true">
        (
      </span>
      <h1 className="vs-hero-title" aria-label={`${roman} ${italic}`}>
        <span aria-hidden="true">
          {romanNodes} <em>{italicNodes}</em>
        </span>
      </h1>
      <span className="vs-paren" aria-hidden="true">
        )
      </span>
    </div>
  );
}
