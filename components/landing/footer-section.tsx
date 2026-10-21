import Link from "next/link";
import Foliage from "./foliage";
import Origami from "./origami";
import AskCard from "./ask-card";
import { BrandMark, PrimaryCta, TextLink } from "./primitives";

const LINK_GROUPS: Array<{
  heading: string;
  links: Array<{ href: string; label: string }>;
}> = [
  {
    heading: "Product",
    links: [
      { href: "/features", label: "Features" },
      { href: "/pricing", label: "Pricing" },
      { href: "/docs", label: "Docs" },
      { href: "/changelog", label: "Changelog" },
      { href: "/notes/the-tests-were-green", label: "Engineering note" },
    ],
  },
  {
    heading: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
      { href: "/support", label: "Support" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
      { href: "/cookies", label: "Cookies" },
      { href: "/cancellation-refund", label: "Cancellation and refunds" },
      { href: "/shipping", label: "Shipping" },
    ],
  },
  {
    heading: "Account",
    links: [
      { href: "/sign-in", label: "Sign in" },
      { href: "/sign-up", label: "Sign up" },
      { href: "/dashboard", label: "Dashboard" },
    ],
  },
];

const READS: readonly string[] = [
  "PDF",
  "fully scanned PDFs (first 10 pages, English OCR)",
  "Word .docx",
  "Excel .xlsx and .xls",
  "PowerPoint .pptx",
  "plain text",
  "Markdown",
];
export default function FooterSection({ closing = true }: { closing?: boolean } = {}) {
  return (
    <footer
      className="vs-section vs-footer vs-footer-garden relative overflow-hidden"
      style={{ paddingBottom: "var(--vs-footer-pb)" }}
    >
      <Foliage
        side="r"
        lower
        masses={[{ top: "calc(100% - 980px)", scale: 1, tilt: -4, clock: 2 }]}
      />
      <Foliage
        side="l"
        lower
        masses={[
          { top: "calc(100% - 880px)", scale: 0.66, flipY: true, tilt: 3, clock: 1 },
          { top: "calc(100% - 1180px)", scale: 0.5, tilt: -8, far: true, clock: 3 },
        ]}
      />
      {closing && (
        <Origami
          kind="crane-fly-cream"
          id="ft1"
          width={86}
          flip
          className="vs-origami--xl vs-origami--c1"
          style={{ right: "16%", top: 44 }}
        />
      )}
      {closing && (
        <div className="vs-closing">
          <div className="vs-closing-inner">
            <div>
              <p className="vs-closing-eyebrow">Visura Chat</p>
              <h2 className="vs-closing-title">
                Ask a
                <br />
                document
                <br />
                what it says
              </h2>
              <div className="vs-closing-cta">
                <PrimaryCta />
                <TextLink href="/pricing">See pricing</TextLink>
              </div>
            </div>
            <AskCard />
          </div>
        </div>
      )}

      <div className="vs-container vs-ftr">
        <BrandMark className="vs-ftr-mark" size={26} />

        <div className="vs-ftr-top">
          <p className="vs-ftr-about">
            <strong>Visura</strong> compares two versions of a document and shows what changed, word
            by word, and, when both were read in full without OCR, how much stayed the same once
            spacing, line wrapping, typographic styles, page numbers, running headers and footers,
            and short repeated lines are set aside. Keep documents here and each new version is
            split and hashed the same way, so unchanged sections keep their summaries.{" "}
            <TextLink href="/docs">Read more</TextLink>
          </p>
          <p className="vs-ftr-contact">
            For questions, billing or anything else,{" "}
            <TextLink href="/contact">get in touch</TextLink>.
          </p>
        </div>

        <div className="vs-ftr-rule">
          <p className="vs-ftr-label">Built to read</p>
          <span className="vs-ftr-perch" aria-hidden="true">
            <Origami kind="crane-perch-teal" id="ft2" motion="perch" width={138} />
          </span>
        </div>
      </div>
      <div className="vs-marquee">
        <div className="vs-marquee-track" aria-hidden="true">
          {[0, 1].map((pass) => (
            <div key={pass} className="vs-marquee-run">
              {READS.map((item) => (
                <span key={pass + item} className="vs-marquee-cell">
                  <span className="vs-marquee-item">{item}</span>
                  <span className="vs-marquee-item vs-marquee-dot">•</span>
                </span>
              ))}
            </div>
          ))}
        </div>
        <span className="sr-only">Visura reads {READS.join(", ")}.</span>
      </div>

      <div className="vs-container vs-ftr-foot">
        <p className="vs-ftr-rights">All rights reserved © Visura</p>
        <nav aria-label="Footer" className="vs-ftr-links">
          {LINK_GROUPS.flatMap((g) => g.links).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              prefetch={false}
              className="vs-small vs-quiet-link vs-t"
            >
              {link.label}
            </Link>
          ))}
          <a href="https://parbhat.dev" className="vs-small vs-quiet-link vs-t">
            Built by Parbhat Kapila
          </a>
        </nav>
      </div>
    </footer>
  );
}
