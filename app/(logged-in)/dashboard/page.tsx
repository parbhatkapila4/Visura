import BgGradient from "@/components/common/bg-gradient";
import DashboardClient from "@/components/dashboard/dashboard-client";
import { getSummaries } from "@/lib/summaries";
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
  
  // Determine user plan based on price_id
  // If user has a price_id, they are on a paid plan (pro)
  // If no price_id, they are on basic plan
  const userPlan = userData?.price_id ? 'pro' : 'basic';
  
  // Check upload limit and get dynamic limit based on plan
  const { hasReachedLimit, uploadLimit } = await hasReachedUploadLimit(userId, email!);
  const summaries = await getSummaries(userId, userPlan) as Summary[];
  return (
    <main className="min-h-screen bg-gray-900">
      <BgGradient />
      <div className="container mx-auto flex flex-col gap-4">
        <div className="px-2 py-12 sm:py-12">
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
