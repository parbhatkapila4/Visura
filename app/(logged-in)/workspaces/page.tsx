import { currentUser } from "@clerk/nextjs/server";
import { ensureUserExistsInDatabase } from "@/lib/auth-utils";
import WorkspacesClient from "@/components/workspaces/workspaces-client";

export default async function WorkspacesPage() {
  const user = await currentUser();

  if (user) {
    await ensureUserExistsInDatabase();
  }

  return <WorkspacesClient />;
}




