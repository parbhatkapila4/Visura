"use client";
import NavLink from "./nav-link";
import { UserButton } from "@clerk/nextjs";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import PlanBadge from "./plan-badge";
import { HoverBorderGradient } from "../ui/hover-border-gradient";

export default function Header() {
  return (
    <nav className="w-full  px-4  z-50">
      <div className="max-w-6xl mx-auto">
        <div className="bg-black rounded-lg px-6 py-3 font-bold">
          <div className="flex items-center">
            {/* Left Section */}
            <div className="flex items-center">
              <NavLink
                href="/"
                className="flex items-center gap-2  rounded-full px-4 py-2 "
              >
                <HoverBorderGradient
                  containerClassName="rounded-full"
                  as="button"
                  className=" bg-black text-white flex items-center space-x-2 py-1 px-4"
                >
                  <span className="font-light text-white text-lg w-full flex items-center justify-center">
                    Visura
                  </span>
                </HoverBorderGradient>
              </NavLink>
            </div>

            {/* Center Navigation Links - Absolutely centered */}
            <div className="hidden md:flex items-center gap-8 absolute left-1/2 transform -translate-x-1/2">
              <NavLink href="/#pricing" className="text-white/70">
                Pricing
              </NavLink>
              <SignedIn>
                <NavLink href="/dashboard" className="text-white/70">
                  Dashboard
                </NavLink>
              </SignedIn>
              <SignedIn>
                <NavLink href="/upload" className="text-white/70">
                  Upload
                </NavLink>
              </SignedIn>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-4 ml-auto">
              <SignedIn>
                <PlanBadge />
                <UserButton />
              </SignedIn>
              <SignedOut>
                <NavLink href="/sign-in" className="text-gray-700">
                  Sign In
                </NavLink>
              </SignedOut>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
