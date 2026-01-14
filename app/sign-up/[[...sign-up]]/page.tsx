import { SignUp } from "@clerk/nextjs";
import BlackBackground from "./black-background";
import AuthVisualPane from "@/components/auth/auth-visual-pane";
import { clerkAppearance } from "@/lib/clerk-appearance";

export default function Page() {
  return (
    <>
      <BlackBackground />
      <div className="fixed inset-0 z-50 bg-[#2C2638]">
        <div className="flex min-h-screen w-full">
          <AuthVisualPane tagline="Capturing Moments, Creating Memories" currentPage="sign-up" />

          <div className="flex-1 lg:w-[50%] flex items-center justify-center">
            <div className="w-full max-w-md">
              <SignUp
                appearance={clerkAppearance}
                routing="path"
                path="/sign-up"
                signInUrl="/sign-in"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
