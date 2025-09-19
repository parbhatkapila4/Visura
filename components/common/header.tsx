"use client";
import NavLink from "./nav-link";
import { UserButton } from "@clerk/nextjs";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import PlanBadge from "./plan-badge";
import { HoverBorderGradient } from "../ui/hover-border-gradient";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="w-full px-4 z-50">
      <div className="max-w-6xl mx-auto">
        <div className="bg-black rounded-lg px-4 sm:px-6 py-3 font-bold">
          <div className="flex items-center justify-between">
            {/* Left Section - Logo */}
            <div className="flex items-center">
              <NavLink
                href="/"
                className="flex items-center gap-2 rounded-full px-2 sm:px-4 py-2"
              >
                <HoverBorderGradient
                  containerClassName="rounded-full"
                  as="button"
                  className="bg-black text-white flex items-center space-x-2 py-1 px-2 sm:px-4"
                >
                  <span className="font-light text-white text-base sm:text-lg w-full flex items-center justify-center">
                    Visura
                  </span>
                </HoverBorderGradient>
              </NavLink>
            </div>

            <div className="hidden md:flex items-center gap-8 absolute left-1/2 transform -translate-x-1/2">
              <NavLink
                href="/#pricing"
                className="text-white/70 hover:text-white transition-colors"
              >
                Pricing
              </NavLink>
              <SignedIn>
                <NavLink
                  href="/dashboard"
                  className="text-white/70 hover:text-white transition-colors"
                >
                  Dashboard
                </NavLink>
              </SignedIn>
              <SignedIn>
                <NavLink
                  href="/upload"
                  className="text-white/70 hover:text-white transition-colors"
                >
                  Upload
                </NavLink>
              </SignedIn>
            </div>

            <div className="hidden md:flex items-center gap-4 ml-auto">
              <SignedIn>
                <PlanBadge />
                <UserButton />
              </SignedIn>
              <SignedOut>
                <NavLink
                  href="/sign-in"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Sign In
                </NavLink>
              </SignedOut>
            </div>

            <div className="md:hidden flex items-center gap-4">
              <SignedIn>
                <PlanBadge />
                <UserButton />
              </SignedIn>
              <SignedOut>
                <NavLink
                  href="/sign-in"
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  Sign In
                </NavLink>
              </SignedOut>
              <button
                onClick={toggleMobileMenu}
                className="text-white hover:text-gray-300 transition-colors p-2"
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {isMobileMenuOpen && (
            <div className="md:hidden mt-4 pt-4 border-t border-gray-800">
              <div className="flex flex-col space-y-4">
                <NavLink
                  href="/#pricing"
                  className="text-white/70 hover:text-white transition-colors py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Pricing
                </NavLink>
                <SignedIn>
                  <NavLink
                    href="/dashboard"
                    className="text-white/70 hover:text-white transition-colors py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Dashboard
                  </NavLink>
                </SignedIn>
                <SignedIn>
                  <NavLink
                    href="/upload"
                    className="text-white/70 hover:text-white transition-colors py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Upload
                  </NavLink>
                </SignedIn>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
