import LandingHeroSpline from "@/components/landing-hero-spline";
import HomeClient from "./home-client";

type HomeProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const paymentStatus = params.payment;
  const showSuccessMessage = paymentStatus === "success";
  const showCancelMessage = paymentStatus === "cancelled";

  return (
    <div className="relative w-full flex-1 bg-black overflow-x-hidden">
      <LandingHeroSpline />
      <div
        className="relative z-10 w-full bg-black"
        style={{ position: "relative", zIndex: 10, backgroundColor: "#000000" }}
      >
        <HomeClient showSuccessMessage={showSuccessMessage} showCancelMessage={showCancelMessage} />
      </div>
    </div>
  );
}
