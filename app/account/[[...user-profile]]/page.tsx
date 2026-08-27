import { UserProfile } from "@clerk/nextjs";
import { clerkAppearance } from "@/lib/clerk-appearance";
import { SidebarWithContent } from "@/components/sidebar-component";

export default function AccountPage() {
  return (
    <SidebarWithContent>
      <div className="min-h-screen w-full flex items-center justify-center bg-[#0a0a0a] p-4">
        <UserProfile appearance={clerkAppearance} routing="path" path="/account" />
      </div>
    </SidebarWithContent>
  );
}
