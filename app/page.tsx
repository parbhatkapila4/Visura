import { currentUser } from "@clerk/nextjs/server";
import { ensureUserExistsInDatabase } from "@/lib/auth-utils";
import AnimatedHomePage from "./animated-home-page";

type HomeProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const user = await currentUser();

  if (user) {
    await ensureUserExistsInDatabase();
  }

  const params = await searchParams;
  const paymentStatus = params.payment;
  const showSuccessMessage = paymentStatus === "success";
  const showCancelMessage = paymentStatus === "cancelled";

  return (
    <div
      className="relative w-full min-h-screen bg-black overflow-x-hidden"
      style={{
        transform: "translateZ(0)",
        willChange: "scroll-position",
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
      }}
    >
      <AnimatedHomePage
        showSuccessMessage={showSuccessMessage}
        showCancelMessage={showCancelMessage}
      />
    </div>
  );
}
