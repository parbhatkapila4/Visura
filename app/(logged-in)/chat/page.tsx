import ChatPageClient from "@/components/chat/chat-page-client";
import { getUserSummaries } from "@/lib/summaries";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ensureUserExistsInDatabase } from "@/lib/auth-utils";
import { documentLimitFor, getPlanForEmail } from "@/lib/billing";
export const dynamic = "force-dynamic";

interface Summary {
  id: string;
  title: string | null;
  summary_text: string;
  original_file_url: string | null;
  created_at: string;
  status?: string;
}

export default async function ChatPage() {
  const user = await currentUser();
  const userId = user?.id;

  if (!userId) {
    return redirect("/sign-in");
  }

  await ensureUserExistsInDatabase();

  const email = user.emailAddresses[0]?.emailAddress;
  const plan = await getPlanForEmail(email!);

  const summaries = (await getUserSummaries(userId, documentLimitFor(plan))) as Summary[];

  return (
    <main className="min-h-screen bg-[#0a0a0a] w-full">
      <ChatPageClient summaries={summaries} />
    </main>
  );
}
