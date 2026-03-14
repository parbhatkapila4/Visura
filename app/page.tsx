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
    <div
      className="relative w-full min-h-screen bg-black overflow-x-hidden"
      style={{
        backgroundColor: "#000000",
        transform: "translateZ(0)",
        willChange: "scroll-position",
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
      }}
    >
      <HomeClient
        showSuccessMessage={showSuccessMessage}
        showCancelMessage={showCancelMessage}
      />
    </div>
  );
}
