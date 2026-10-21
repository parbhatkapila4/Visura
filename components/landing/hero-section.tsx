import LineagePlate from "./lineage-plate";
import HeroTitle from "./hero-title";
import Foliage from "./foliage";
import Origami from "./origami";
import { PrimaryCta, SecondaryBtn } from "./primitives";
function SkyPaint() {
  return (
    <svg
      className="vs-sky-paint"
      viewBox="0 0 1200 800"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <filter
          id="vs-wash"
          x="-25%"
          y="-25%"
          width="150%"
          height="150%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.006 0.01"
            numOctaves="3"
            seed="5"
            result="n"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="n"
            scale="55"
            xChannelSelector="R"
            yChannelSelector="G"
          />
          <feGaussianBlur stdDeviation="10" />
        </filter>
      </defs>
      <rect width="1200" height="800" fill="#c2d6e6" />
      <g filter="url(#vs-wash)">
        <ellipse cx="130" cy="380" rx="300" ry="260" fill="#a6c2da" fillOpacity="0.75" />
        <ellipse cx="760" cy="60" rx="260" ry="120" fill="#b0c9de" fillOpacity="0.6" />
        <ellipse cx="340" cy="120" rx="330" ry="120" fill="#ffffff" fillOpacity="0.85" />
        <ellipse cx="1010" cy="120" rx="240" ry="110" fill="#ffffff" fillOpacity="0.8" />
        <ellipse cx="560" cy="290" rx="220" ry="90" fill="#eef4f7" fillOpacity="0.7" />
        <ellipse cx="300" cy="640" rx="300" ry="110" fill="#ffffff" fillOpacity="0.72" />
        <ellipse cx="900" cy="700" rx="360" ry="120" fill="#f6f8f7" fillOpacity="0.7" />
        <ellipse cx="1110" cy="430" rx="220" ry="240" fill="#e3dcc6" fillOpacity="0.85" />
        <ellipse cx="1060" cy="760" rx="300" ry="110" fill="#e9e2cf" fillOpacity="0.8" />
        <ellipse cx="60" cy="780" rx="220" ry="90" fill="#e6e0cf" fillOpacity="0.55" />
      </g>
    </svg>
  );
}

export default function HeroSection() {
  return (
    <section id="hero" className="vs-hero">
      <Foliage
        side="l"
        masses={[
          { top: "2%", scale: 1, tilt: 2, clock: 1, eager: true },
          { top: "54%", scale: 0.6, flipY: true, tilt: -6, far: true, clock: 3 },
        ]}
      />
      <Foliage
        side="r"
        masses={[
          { top: "-6%", scale: 1.04, tilt: -2, clock: 2, eager: true },
          { top: "58%", scale: 0.68, flipY: true, tilt: 4, far: true, clock: 1 },
        ]}
      />
      <Origami
        kind="crane-stand-cream"
        id="hv1"
        motion="perch"
        tilt={-4}
        width={132}
        className="vs-origami--xl"
        style={{ right: 62, top: 500 }}
      />

      <div className="vs-container vs-hero-stack">
        <div className="vs-enter-pill flex justify-center">
          <span className="vs-pill">
            <span className="vs-pill-k">No account</span>
            and neither file is uploaded
          </span>
        </div>

        <div className="mt-5 md:mt-6">
          <HeroTitle roman="Nothing else" italic="was touched" />
        </div>

        <p className="vs-enter-sub vs-hero-sub mx-auto mt-5 max-w-[31rem] text-balance text-center md:mt-6">
          They send the agreement back and say they only changed the payment terms. Visura lines up
          the two texts passage by passage and lists what else changed — in this browser, without
          either file leaving your machine.
        </p>

        <div className="vs-enter-cta mt-7 flex justify-center">
          <PrimaryCta href="/compare" label="Compare two versions" variant="accent" size="lg" />
        </div>

        <div className="vs-sky mt-12 md:mt-14">
          <SkyPaint />
          <div className="vs-flock" aria-hidden="true">
            <Origami
              kind="crane-fly-cream"
              id="fk1"
              width={94}
              style={{ left: "5.5%", top: -30 }}
            />
            <Origami
              kind="crane-fly-teal"
              id="fk2"
              width={62}
              far
              className="vs-origami--c1"
              style={{ left: "21%", top: -8 }}
            />
            <Origami
              kind="crane-fly-cream"
              id="fk3"
              width={46}
              far
              className="vs-origami--c2"
              style={{ left: "38%", top: -20 }}
            />
            <Origami
              kind="crane-fly-cream"
              id="fk4"
              width={58}
              flip
              className="vs-origami--c3"
              style={{ right: "7%", top: -16 }}
            />
          </div>

          <div className="vs-window">
            <div className="vs-window-bar">
              <span className="vs-window-dot" />
              <span className="vs-window-dot" />
              <span className="vs-window-dot" />
              <span className="vs-window-url">sample data</span>
            </div>
            <div className="vs-window-body">
              <LineagePlate />
            </div>
          </div>

          <div className="vs-hero-rail">
            <div className="max-w-[26rem]">
              <p className="vs-hero-rail-title">Want to keep the versions too?</p>
              <p className="vs-hero-note mt-1">
                With an account, upload each revision under the same file name: a section whose
                normalized text matches one Visura already summarized in an earlier version keeps
                that summary, and only the rest are summarized.
              </p>
            </div>
            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
              <PrimaryCta variant="accent" className="w-full sm:w-auto" />
              <SecondaryBtn href="/compare" tone="cream" className="w-full sm:w-auto">
                Compare without an account
              </SecondaryBtn>
            </div>
          </div>
        </div>

        <p className="vs-caption mx-auto mt-4 max-w-[44rem] text-balance text-center">
          <em>
            Fig. 1 — Illustration with sample data: a 94-section document going from version 3 to
            version 4. 68 of the 94 sections still match once spacing, line breaks, character
            variants such as curly quotes, dashes and ligatures, running headers and footers,
            repeated short labels, page numbers and other lines of bare digits are set aside; the 26
            that changed are the ones marked. Visura does not draw this map on any page; a
            version&apos;s processing insights page lists how many sections were reused and how many
            were new, and leaves them out of its overview when the file was a scan or was only
            partly read.
          </em>
        </p>
      </div>
    </section>
  );
}
