"use client";
import NavLink from "./nav-link";
import { UserButton } from "@clerk/nextjs";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import PlanBadge from "./plan-badge";
import { motion } from "framer-motion";
import { useState } from 'react';

export default function Header() {
  return (
    <nav className="w-full px-4 py-2 sm:py-4 min-h-[60px] sm:min-h-[80px] relative z-20">
      <div className="max-w-6xl mx-auto">
        <div className="bg-black border-2 border-gray-700 rounded-2xl px-4 sm:px-6 py-2 sm:py-4 shadow-lg flex flex-col md:flex-row md:items-center md:justify-between gap-y-2 md:gap-y-0 min-h-[56px] sm:min-h-[72px]">
          <div className="flex flex-row items-center justify-between w-full min-w-0">
            {/* Logo */}
            <motion.div 
              className="flex flex-row items-center gap-3 min-w-0"
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 400, damping: 10 }}
            >
              <motion.div 
                className="w-8 h-8 border-2 border-white rounded-full flex items-center justify-center relative overflow-hidden"
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
                  className="w-4 h-4 border-2 border-white rounded-full"
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
                  className="text-white font-semibold text-lg relative break-all min-w-0"
                >
                  <motion.span
                    className="text-white"
                    whileHover={{
                      scale: 1.1,
                      textShadow: "0 0 20px rgba(255, 255, 255, 0.3)",
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
                </NavLink>
              </motion.div>
            </motion.div>

            {/* Mobile Dashboard button only (no hamburger) */}
            <NavLink
              href="/dashboard"
              className="block md:hidden ml-auto px-3 py-1.5 rounded-md font-semibold text-base text-white bg-gray-800 hover:bg-gray-700 transition-colors border border-gray-700 min-w-[96px] text-center"
            >
              Dashboard
            </NavLink>
            
            {/* Right Section (navbar) */}
            <div className="hidden md:flex flex-row flex-wrap items-center gap-3 gap-x-4 pl-0 sm:pl-6 min-w-0 w-full justify-end">
              <SignedIn>
                <NavLink href="/dashboard" className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white hover:text-orange-500 font-medium text-sm rounded-lg transition-colors duration-200 border border-gray-700 break-all min-w-[90px] text-center">Dashboard</NavLink>
                <PlanBadge />
                <UserButton />
              </SignedIn>
              <SignedOut>
                <NavLink href="/sign-in" className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-medium text-sm rounded-lg transition-colors duration-200 border border-gray-600 min-w-[70px] text-center">Log in</NavLink>
                <NavLink href="/sign-up" className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium text-sm rounded-lg transition-colors duration-200 shadow-sm min-w-[75px] text-center">Sign up</NavLink>
              </SignedOut>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
