import BgGradient from "@/components/common/bg-gradient";
import SupabaseUploadForm from "@/components/upload/supabase-upload-form";
import UploadHeader from "@/components/upload/upload-header";
import { BackgroundLines } from "@/components/ui/background-lines";

export default function UploadPage() {
  return (
    <section className="min-h-screen bg-black mt-20">
      <BackgroundLines className="flex items-center justify-center w-full flex-col px-4 bg-black -mt-40">
      <BgGradient />
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className = "flex flex-col items-center justify-center gap-2 text-center">
          <UploadHeader />
          <SupabaseUploadForm />
        </div>
      </div>
      </BackgroundLines>

    </section>
  );
}