import BgGradient from "@/components/common/bg-gradient";
import SupabaseUploadForm from "@/components/upload/supabase-upload-form";
import UploadHeader from "@/components/upload/upload-header";
import { BackgroundLines } from "@/components/ui/background-lines";
import { currentUser } from "@clerk/nextjs/server";
import { hasReachedUploadLimit } from "@/lib/user";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

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
    <section className="bg-black min-h-screen overflow-x-hidden relative">
      <BackgroundLines className="min-h-screen flex items-center justify-center w-full flex-col px-3 sm:px-4 bg-black overflow-x-hidden">
        <BgGradient />
        {/* Back to Dashboard Button - Top Left Corner */}
        <Link
          href="/dashboard"
          className="absolute top-4 left-3 sm:top-6 sm:left-6 z-50 flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-white/70 hover:text-white transition-colors rounded-lg hover:bg-white/10 border border-white/10 hover:border-white/20"
        >
          <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Back to Dashboard</span>
          <span className="sm:hidden">Back</span>
        </Link>
        <div className="mx-auto max-w-7xl px-3 sm:px-6 pt-28 sm:pt-12 md:py-12 md:py-20 lg:py-24">
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
