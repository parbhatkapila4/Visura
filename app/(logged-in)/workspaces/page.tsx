import { currentUser } from "@clerk/nextjs/server";
import { ensureUserExistsInDatabase } from "@/lib/auth-utils";
import WorkspacesClient from "@/components/workspaces/workspaces-client";

export default async function WorkspacesPage() {
  const user = await currentUser();

  if (user) {
    await ensureUserExistsInDatabase();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <WorkspacesClient />
      </div>
    </div>
  );
}

