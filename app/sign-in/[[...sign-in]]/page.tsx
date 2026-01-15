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

          <div className="flex-1 lg:w-[50%] flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-gradient-to-br from-[#2C2638] via-[#322942] to-[#2C2638]" />

              <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                  backgroundImage:
                    "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
                }}
              />
            </div>

            <div className="w-full max-w-md relative z-10">
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
