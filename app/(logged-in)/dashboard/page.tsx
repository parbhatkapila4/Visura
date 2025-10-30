import BgGradient from "@/components/common/bg-gradient";
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
    <main className="relative isolate min-h-screen bg-black overflow-hidden">
      <BgGradient className="bg-black" />
      {/* Full-width on mobile, comfortable gutters on larger screens */}
      <div className="w-full px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mx-auto w-full max-w-screen-xl">
          <DashboardClient
            summaries={summaries}
            uploadLimit={uploadLimit}
            userPlan={userPlan}
            hasReachedLimit={hasReachedLimit}
          />
        </div>
      </div>
    </main>
  );
}
