import DashboardClient from "@/components/dashboard/dashboard-client";
import { getUserSummaries } from "@/lib/summaries";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ensureUserExistsInDatabase } from "@/lib/auth-utils";
import { hasReachedUploadLimit } from "@/lib/user";

export const dynamic = "force-dynamic";

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
  const { hasReachedLimit, uploadLimit, plan } = await hasReachedUploadLimit(userId, email!);
  const userPlan = plan === "free" ? "basic" : plan;

  const summaries = (await getUserSummaries(userId, uploadLimit)) as Summary[];

  return (
    <main className="min-h-screen bg-[#0a0a0a] w-full flex flex-col items-center">
      <DashboardClient
        summaries={summaries}
        uploadLimit={uploadLimit}
        userPlan={userPlan}
        hasReachedLimit={hasReachedLimit}
      />
    </main>
  );
}
