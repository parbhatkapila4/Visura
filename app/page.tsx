import type { Metadata } from "next";
import { FoliageDefs } from "@/components/landing/foliage";
import LandingHeader from "@/components/landing/landing-header";
import HeroSection from "@/components/landing/hero-section";
import PipelineSection from "@/components/landing/pipeline-section";
import ReuseSection from "@/components/landing/reuse-section";
import StatesSection from "@/components/landing/states-section";
import ChangesSection from "@/components/landing/changes-section";
import FeaturesSection from "@/components/landing/features-section";
import FooterSection from "@/components/landing/footer-section";
import LandingToasts from "./landing-toasts";

export const metadata: Metadata = {
  title: "Visura — see what changed between two versions of a document",
  description:
    "Drop in the version you sent and the one that came back. Visura lists every change it finds and, when both files were read in full without OCR, how many passages still match once formatting, page numbers and short repeated lines such as running headers are set aside. No account, and neither file is uploaded.",
};

type HomeProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const payment = params.payment;

  return (
    <div data-vs-landing data-visura-home-ready="true" className="min-h-dvh">
      <FoliageDefs />
      <LandingHeader />
      <main id="vs-main" tabIndex={-1}>
        <HeroSection />
        <ChangesSection />
        <ReuseSection />
        <PipelineSection />
        <StatesSection />
        <FeaturesSection />
      </main>
      <FooterSection />
      <LandingToasts showSuccess={payment === "success"} showCancel={payment === "cancelled"} />
    </div>
  );
}
