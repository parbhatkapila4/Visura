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

  const { hasReachedLimit, uploadLimit } = await hasReachedUploadLimit(userId, email!);
  const summaries = (await getUserSummaries(userId, userPlan)) as Summary[];

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <DashboardClient
        summaries={summaries}
        uploadLimit={uploadLimit}
        userPlan={userPlan}
        hasReachedLimit={hasReachedLimit}
      />
    </main>
  );
}
