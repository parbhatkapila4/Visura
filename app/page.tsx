import BgGradient from "@/components/common/bg-gradient";
import { currentUser } from "@clerk/nextjs/server";
import { ensureUserExistsInDatabase } from "@/lib/auth-utils";
import AnimatedHomePage from "./animated-home-page";

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
    <div className="relative w-screen min-h-screen bg-black">
      <BgGradient className="hidden md:block"/>
      <AnimatedHomePage 
        showSuccessMessage={showSuccessMessage}
        showCancelMessage={showCancelMessage}
      />
    </div>
  );
}
