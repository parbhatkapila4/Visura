import BgGradient from "@/components/common/bg-gradient";
import NoScroll from "@/components/common/no-scroll";
import SupabaseUploadForm from "@/components/upload/supabase-upload-form";
import UploadHeader from "@/components/upload/upload-header";
import { BackgroundLines } from "@/components/ui/background-lines";
import { currentUser } from "@clerk/nextjs/server";
import { hasReachedUploadLimit } from "@/lib/user";
import { redirect } from "next/navigation";

export default async function UploadPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const { hasReachedLimit, uploadLimit } = await hasReachedUploadLimit(
    user.id,
    user.emailAddresses[0]?.emailAddress || ""
  );

  return (
    <section className="bg-black min-h-screen overflow-x-hidden">
      <BackgroundLines className="min-h-screen flex items-center justify-center w-full flex-col px-3 sm:px-4 bg-black overflow-x-hidden">
        <BgGradient />
        <div className="mx-auto max-w-7xl px-3 sm:px-6 py-12 md:py-20 lg:py-24">
          <div className="flex flex-col items-center justify-center gap-4 sm:gap-6 text-center">
            <UploadHeader />
            <SupabaseUploadForm
              hasReachedLimit={hasReachedLimit}
              uploadLimit={uploadLimit}
            />
          </div>
        </div>
      </BackgroundLines>
    </section>
  );
}
