import BgGradient from "@/components/common/bg-gradient";
import SupabaseUploadForm from "@/components/upload/supabase-upload-form";
import UploadHeader from "@/components/upload/upload-header";

export default function UploadPage() {
  return (
    <section className="min-h-screen bg-black mt-20">
      <BgGradient />
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:py-8">
        <div className = "flex flex-col items-center justify-center gap-6 text-center">
          <UploadHeader />
          <SupabaseUploadForm />
        </div>
      </div>
    </section>
  );
}