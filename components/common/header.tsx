"use client";
import NavLink from "./nav-link";
import { UserButton } from "@clerk/nextjs";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import PlanBadge from "./plan-badge";
import { motion } from "framer-motion";

export default function Header() {
  return (
    <nav className="w-full px-4 py-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white border-2 border-black rounded-2xl px-6 py-4 shadow-lg flex items-center justify-between">
          {/* Logo */}
          <motion.div 
            className="flex items-center gap-3"
            whileHover={{ scale: 1.05 }}
            transition={{ 
              type: "spring", 
              stiffness: 400, 
              damping: 10 
            }}
          >
            <motion.div 
              className="w-8 h-8 border-2 border-black rounded-full flex items-center justify-center relative overflow-hidden"
              animate={{ 
                rotate: [0, 360],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                rotate: { 
                  duration: 8, 
                  repeat: Infinity, 
                  ease: "linear" 
                },
                scale: { 
                  duration: 2, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }
              }}
              whileHover={{
                rotate: [0, 720],
                scale: 1.2,
                transition: { 
                  duration: 0.6,
                  type: "spring",
                  stiffness: 300
                }
              }}
            >
              <motion.div 
                className="w-4 h-4 border-2 border-black rounded-full"
                animate={{ 
                  rotate: [360, 0],
                  scale: [1, 0.8, 1]
                }}
                transition={{ 
                  rotate: { 
                    duration: 4, 
                    repeat: Infinity, 
                    ease: "linear" 
                  },
                  scale: { 
                    duration: 1.5, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }
                }}
              />
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full opacity-0"
                animate={{ 
                  opacity: [0, 0.3, 0],
                  scale: [0.8, 1.2, 0.8]
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <NavLink
                href="/"
                className="text-black font-semibold text-lg relative"
              >
                <motion.span
                  className="text-black"
                  whileHover={{
                    scale: 1.1,
                    textShadow: "0 0 20px rgba(0, 0, 0, 0.3)",
                    transition: { 
                      duration: 0.3,
                      type: "spring",
                      stiffness: 400
                    }
                  }}
                >
                  Visura
                </motion.span>
                <motion.div
                  className="absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600"
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
                <motion.div
                  className="absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"
                  animate={{ 
                    scale: [1, 1.5, 1],
                    opacity: [0.7, 1, 0.7]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                />
              </NavLink>
            </motion.div>
          </motion.div>

          {/* Navigation Links - Centered */}
          <div className="hidden md:flex items-center gap-8 absolute left-1/2 transform -translate-x-1/2">
            <NavLink
              href="/#features"
              className="text-black hover:text-gray-700 transition-colors duration-200 text-sm font-medium"
            >
              Features
            </NavLink>
            <NavLink
              href="/#pricing"
              className="text-black hover:text-gray-700 transition-colors duration-200 text-sm font-medium"
            >
              Pricing
            </NavLink>
            <NavLink
              href="/blog"
              className="text-black hover:text-gray-700 transition-colors duration-200 text-sm font-medium"
            >
              Blog
            </NavLink>
            <NavLink
              href="/changelog"
              className="text-black hover:text-gray-700 transition-colors duration-200 text-sm font-medium"
            >
              Changelog
            </NavLink>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            <SignedIn>
              <PlanBadge />
              <UserButton />
            </SignedIn>
            <SignedOut>
              <NavLink
                href="/sign-in"
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-black font-medium text-sm rounded-lg transition-colors duration-200 border border-gray-300"
              >
                Log in
              </NavLink>
              <NavLink
                href="/sign-up"
                className="px-4 py-2 bg-black hover:bg-gray-800 text-white font-medium text-sm rounded-lg transition-colors duration-200 shadow-sm"
              >
                Sign up
              </NavLink>
            </SignedOut>
          </div>
        </div>
      </div>
    </nav>
  );
}
