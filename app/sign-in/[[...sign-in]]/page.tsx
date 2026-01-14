import { SignIn } from "@clerk/nextjs";
import BlackBackground from "./black-background";
import AuthVisualPane from "@/components/auth/auth-visual-pane";
import { clerkAppearance } from "@/lib/clerk-appearance";

export default function Page() {
  return (
    <>
      <BlackBackground />
      <div className="fixed inset-0 z-50 bg-[#2C2638]">
        <div className="flex min-h-screen w-full">
          <AuthVisualPane tagline="Welcome back to your workspace" currentPage="sign-in" />

          <div className="flex-1 lg:w-[50%] flex items-center justify-center">
            <div className="w-full max-w-md">
              <SignIn
                appearance={clerkAppearance}
                routing="path"
                path="/sign-in"
                signUpUrl="/sign-up"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
