import BgGradient from "@/components/common/bg-gradient";
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

  // Check if user has reached upload limit
  const { hasReachedLimit, uploadLimit } = await hasReachedUploadLimit(
    user.id,
    user.emailAddresses[0]?.emailAddress || ""
  );

  return (
    <section className="min-h-screen bg-black mt-20">
      <BackgroundLines className="flex items-center justify-center w-full flex-col px-4 bg-black -mt-40">
      <BgGradient />
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className = "flex flex-col items-center justify-center gap-2 text-center">
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