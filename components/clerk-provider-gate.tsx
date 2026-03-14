"use client";

import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";

const ClerkProviderDynamic = dynamic(
  () =>
    import("@clerk/nextjs").then((mod) => {
      const C = mod.ClerkProvider;
      return function ClerkProviderWrapper({
        children,
      }: {
        children: React.ReactNode;
      }) {
        return (
          <C
            signInUrl="/sign-in"
            signUpUrl="/sign-up"
            afterSignOutUrl="/"
          >
            {children}
          </C>
        );
      };
    }),
  { ssr: false }
);

export function ClerkProviderGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  if (pathname === "/") {
    return <>{children}</>;
  }

  return <ClerkProviderDynamic>{children}</ClerkProviderDynamic>;
}
