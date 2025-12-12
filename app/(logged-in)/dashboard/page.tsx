import DashboardClient from "@/components/dashboard/dashboard-client";
import { getUserSummaries } from "@/lib/summaries";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ensureUserExistsInDatabase } from "@/lib/auth-utils";
import { getUserByEmail, hasReachedUploadLimit } from "@/lib/user";

interface Summary {
  id: string;
  title: string | null;
  summary_text: string;
  original_file_url: string | null;
  created_at: string;
  status?: string;
}

export default async function DashboardPage() {
  const user = await currentUser();
  const userId = user?.id;

  if (!userId) {
    return redirect("/sign-in");
  }

  await ensureUserExistsInDatabase();

  const email = user.emailAddresses[0]?.emailAddress;
  const userData = email ? await getUserByEmail(email) : null;

  const userPlan = userData?.price_id ? "pro" : "basic";

  const { hasReachedLimit, uploadLimit } = await hasReachedUploadLimit(
    userId,
    email!
  );
  const summaries = (await getUserSummaries(userId, userPlan)) as Summary[];
  
  return (
    <main className="relative min-h-screen bg-black">
      {/* Subtle gradient background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(249,115,22,0.12),transparent)]" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      <DashboardClient
        summaries={summaries}
        uploadLimit={uploadLimit}
        userPlan={userPlan}
        hasReachedLimit={hasReachedLimit}
      />
    </main>
  );
}
