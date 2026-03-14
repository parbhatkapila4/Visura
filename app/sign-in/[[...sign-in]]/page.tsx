import { Suspense } from "react";
import BlackBackground from "./black-background";
import AuthVisualPane from "@/components/auth/auth-visual-pane";
import { SignInOrAlreadySignedIn } from "@/components/auth/sign-in-or-already-signed-in";

function SignInFallback() {
  return (
    <div className="w-full flex flex-col items-center justify-center py-12">
      <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      <p className="mt-4 text-sm text-white/60">Loading…</p>
    </div>
  );
}

export default function Page() {
  return (
    <>
      <BlackBackground />
      <div className="fixed inset-0 z-50 bg-[#2C2638]" style={{ backgroundColor: "#2C2638" }}>
        <div className="flex min-h-screen w-full min-w-0">
          <AuthVisualPane tagline="Welcome back to your workspace" currentPage="sign-in" />

          <div className="flex-1 min-w-0 flex flex-col items-center justify-center relative overflow-auto shrink-0 basis-0 lg:basis-1/2 lg:min-w-[50%]">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-br from-[#2C2638] via-[#322942] to-[#2C2638]" />
              <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                  backgroundImage:
                    "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
                }}
              />
            </div>

            <div className="w-full max-w-md relative z-10 flex flex-col items-center px-4 py-8">
              <Suspense fallback={<SignInFallback />}>
                <SignInOrAlreadySignedIn />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
