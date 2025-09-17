import BgGradient from "@/components/common/bg-gradient";
import CTASection from "@/components/home/cta-section";
import DemoSection from "@/components/home/demo-section";
import HeroSection from "@/components/home/hero-section";
import HowItWorksSection from "@/components/home/how-it-works-section";
import PricingSection from "@/components/home/pricing-section";
import { currentUser } from "@clerk/nextjs/server";
import { ensureUserExistsInDatabase } from "@/lib/auth-utils";

type HomeProps = {
  searchParams: { [key: string]: string | string[] | undefined };
};

export default async function Home({ searchParams }: HomeProps) {
  const user = await currentUser();

  if (user) {
    await ensureUserExistsInDatabase();
  }

  const paymentStatus = searchParams.payment;
  const showSuccessMessage = paymentStatus === "success";
  const showCancelMessage = paymentStatus === "cancelled";

  return (
    <div className="relative w-full min-h-screen bg-black">
      <BgGradient />

      <div className="flex flex-col">
        <HeroSection />
        <DemoSection />
        <HowItWorksSection />
        <PricingSection />
        <CTASection />
      </div>
    </div>
  );
}
