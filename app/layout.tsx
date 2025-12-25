import type { Metadata } from "next";
import { Source_Sans_3 as FontSans } from "next/font/google";
import "./globals.css";
import Header from "@/components/common/header";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import { Spotlight } from "@/components/ui/spotlight-new";
import ConditionalFooter from "@/components/common/conditional-footer";

const fontSans = FontSans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Visura - Smart PDF Analysis Platform",
  description:
    "Visura transforms complex PDF documents into clear, actionable insights that help you make better decisions faster",
  icons: {
    icon: [{ url: "/Logo.png", sizes: "any", type: "image/png" }],
    shortcut: "/Logo.png",
    apple: "/Logo.png",
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
    <ClerkProvider>
      <html lang="en">
            <body
          className={`${fontSans.variable} font-sans antialiased bg-[#0a0a0a] text-white overflow-x-hidden`}
          style={{
            backgroundColor: "#0a0a0a",
            margin: 0,
            padding: 0,
          }}
            >
          <div className="relative w-full min-h-screen flex flex-col bg-[#0a0a0a] antialiased" style={{ margin: 0, padding: 0 }}>
            <Spotlight />
            <Header />
            <main className="flex-1 w-full relative z-10 bg-[#0a0a0a] flex flex-col items-center">
              {children}
            </main>
            <ConditionalFooter />
          </div>
          <Toaster position="top-center" richColors closeButton duration={3000} />
        </body>
      </html>
    </ClerkProvider>
  );
}
