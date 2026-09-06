import type { Metadata } from "next";
import { FoliageDefs } from "@/components/landing/foliage";
import LandingHeader from "@/components/landing/landing-header";
import HeroSection from "@/components/landing/hero-section";
import PipelineSection from "@/components/landing/pipeline-section";
import ReuseSection from "@/components/landing/reuse-section";
import StatesSection from "@/components/landing/states-section";
import ChangesSection from "@/components/landing/changes-section";
import ChatSection from "@/components/landing/chat-section";
import FeaturesSection from "@/components/landing/features-section";
import FooterSection from "@/components/landing/footer-section";
import LandingToasts from "./landing-toasts";

export const metadata: Metadata = {
  title: "Visura — update the document, keep the summaries",
  description:
    "Visura summarizes, indexes, and lets you chat with your documents. Upload a revision and unchanged sections keep their summaries — only new material is processed, and every version shows its work.",
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
        <PipelineSection />
        <ReuseSection />
        <StatesSection />
        <ChangesSection />
        <ChatSection />
        <FeaturesSection />
      </main>
      <FooterSection />
      <LandingToasts showSuccess={payment === "success"} showCancel={payment === "cancelled"} />
    </div>
  );
}
