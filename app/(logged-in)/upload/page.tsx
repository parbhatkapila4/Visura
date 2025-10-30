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
    <section className="fixed inset-0 overflow-hidden bg-black flex items-center justify-center">
      <NoScroll />
      <BackgroundLines className="h-full flex items-center justify-center w-full flex-col px-4 bg-black">
        <BgGradient />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8">
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
