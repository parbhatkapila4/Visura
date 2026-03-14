import type { Metadata } from "next";
import { Source_Sans_3 as FontSans, Fraunces as FontDisplay } from "next/font/google";
import "./globals.css";
import Header from "@/components/common/header";
import RouteLoadingIndicator from "@/components/common/route-loading-indicator";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";

const fontSans = FontSans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
});

const fontDisplay = FontDisplay({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Visura - Smart PDF Analysis Platform",
  description:
    "Visura transforms complex PDF documents into clear, actionable insights that help you make better decisions faster",
  icons: {
    icon: [
      { url: "/Visura-favicon-New.png", sizes: "32x32", type: "image/png" },
      { url: "/Visura-favicon-New.png", sizes: "16x16", type: "image/png" },
    ],
    shortcut: "/Visura-favicon-New.png",
    apple: "/Visura-favicon-New.png",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${fontSans.variable} ${fontDisplay.variable} font-sans antialiased bg-black text-white overflow-x-hidden`}
        style={{
          backgroundColor: "#000000",
          margin: 0,
          padding: 0,
        }}
      >
        <ClerkProvider signInUrl="/sign-in" signUpUrl="/sign-up" afterSignOutUrl="/">
          <div className="relative w-full flex flex-col bg-black antialiased" style={{ margin: 0, padding: 0, backgroundColor: "#000000" }}>
            <Header />
            <main className="w-full relative z-10 bg-black flex flex-col items-center" style={{ backgroundColor: "#000000" }}>
              {children}
            </main>
          </div>
          <RouteLoadingIndicator />
          <Toaster position="top-center" richColors closeButton duration={3000} />
        </ClerkProvider>
      </body>
    </html>
  );
}
