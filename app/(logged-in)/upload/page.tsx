import SupabaseUploadForm from "@/components/upload/supabase-upload-form";
import UploadHeader from "@/components/upload/upload-header";
import { BackgroundLines } from "@/components/ui/background-lines";
import { currentUser } from "@clerk/nextjs/server";
import { hasReachedUploadLimit } from "@/lib/user";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";

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
    <div className="bg-[#0a0a0a] relative">
      <header className="sticky top-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-[#1f1f1f]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-[#666] hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm hidden sm:block">Dashboard</span>
              </Link>
              <span className="text-[#333]">/</span>
              <h1 className="text-sm font-medium text-white">Upload</h1>
            </div>

            <Link
              href="/"
              className="flex items-center gap-2 text-[#666] hover:text-white transition-colors"
            >
              <Home className="w-4 h-4" />
              <span className="text-sm hidden sm:block">Home</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="relative w-full bg-[#0a0a0a]">
        <BackgroundLines className="fixed inset-0 top-14 w-full h-[calc(100vh-56px)] pointer-events-none bg-transparent">{null}</BackgroundLines>
        <div className="relative z-10 w-full px-4 py-12 pb-20" style={{ minHeight: 'calc(100vh - 56px)' }}>
          <div className="w-full max-w-xl mx-auto">
            <div className="mb-10">
              <UploadHeader />
            </div>
            <SupabaseUploadForm hasReachedLimit={hasReachedLimit} uploadLimit={uploadLimit} />
          </div>
        </div>
      </div>
    </div>
  );
}
