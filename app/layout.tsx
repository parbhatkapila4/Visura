
import type { Metadata } from "next";
import { Source_Sans_3 as FontSans } from "next/font/google";
import "./globals.css";
import Header from "@/components/common/header";
import Footer from "@/components/common/footer";
import { ClerkProvider } from "@clerk/nextjs";

const fontSans = FontSans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Visura - AI-Driven PDF Insight Engine",
  description:
    "Visura is an AI-powered app that distills PDF documents into clear, concise insights you can grasp in seconds",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider    >  
      <html lang="en">
        <body className={`${fontSans.variable} font-sans antialiased`}>
          <div className="relative flex flex-col min-h-screen">
            <Header />
            <main className="flex-1"> {children}</main>
            <Footer />
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
