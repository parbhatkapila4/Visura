"use client";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { WavyBackground } from "../ui/wavy-background";
import Link from "next/link";

export default function HeroSection() {
  return (
    <WavyBackground 
      className="max-w-7xl mx-auto px-4 lg:px-12"
      colors={["#04724D", "#059669", "#10b981", "#04724D", "#059669"]}
     
    >
      <section className="relative mx-auto flex flex-col z-10 items-center justify-center py-16 sm:py-20 lg:pb-28 transition-all animate-in">
        <div className="relative p-[1px] overflow-hidden rounded-full bg-gradient-to-r from-[#04724D] via-[#059669] to-[#10b981] animate-gradient-x group hover:scale-105 transition-transform duration-200">
          <Badge
            variant={"secondary"}
            className="relative px-6 py-2 text-base font-medium bg-gray-800 rounded-full group-hover:bg-gray-700 transition-colors duration-200 flex items-center border border-gray-600"
          >
            <Sparkles className="h-6 w-6 mr-2 text-[#04724D] animate-pulse" />
            <p className="text-base text-white">Powered by AI</p>
          </Badge>
        </div>
        <h1 className="font-bold py-6 text-center text-white">
          Transform PDFs to{" "}
          <span className="relative inline-block">
            <span className="relative z-10 px-2 ">insights</span>
            <span
              className="absolute inset-0 bg-[#04724D]/30 -rotate-2 rounded-lg transform -skew-y-1"
              aria-hidden="true"
            ></span>
          </span>{" "}
          in seconds
        </h1>
        <h2 className="text-lg sm:text-xl lg:text-2xl text-center px-4 lg:px-0 lg:max-w-4xl text-gray-300">
          Get a sleek summary reel of your document instantly
        </h2>
        <div>
          <Button
            variant={"link"}
            className="text-white mt-6 text-base sm:text-lg lg:text-xl rounded-full px-8 sm:px-10 lg:px-12 py-6 sm:py-7 lg:py-8 lg:mt-16 no-underline hover:no-underline bg-gradient-to-r from-[#04724D] to-[#059669] hover:from-[#059669] hover:to-[#04724D] font-bold shadow-lg transition-all duration-300"
          >
            <Link href="/#pricing" className="flex gap-2 items-center">
              <span>Try Visura</span>
              <ArrowRight className="animate-pulse" />
            </Link>
          </Button>
        </div>
      </section>
    </WavyBackground>
  );
}
