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
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    shortcut: "/favicon-32x32.png",
    apple: "/visura-logo.png",
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
              className={`${fontSans.variable} font-sans antialiased bg-black text-white overflow-x-hidden`}
            >
          {/* Fixed black background to prevent light gradient showing on long scrolls */}
          <div className="fixed inset-0 bg-black -z-10" />
          <div className="relative w-full flex flex-col min-h-screen bg-black antialiased overflow-hidden">
            <Spotlight />
            <Header />
            <main className="flex-1 w-full relative z-10"> {children}</main>
            <ConditionalFooter />
          </div>
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
