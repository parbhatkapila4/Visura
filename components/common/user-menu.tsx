"use client";

import { useState, useRef, useEffect } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { LogOut, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export default function UserMenu() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [isOpen, setIsOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  if (!user) return null;

  const userImageUrl = user.imageUrl || "";
  const userEmail = user.emailAddresses?.[0]?.emailAddress || "";

  const handleLogout = async () => {
    await signOut();
    setIsOpen(false);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* User Profile Picture Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-gray-600 hover:border-orange-500 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-black"
        aria-label="User menu"
        type="button"
      >
        {userImageUrl && !imageError ? (
          <Image
            src={userImageUrl}
            alt={userEmail}
            width={40}
            height={40}
            className="w-full h-full object-cover"
            onError={handleImageError}
            unoptimized
          />
        ) : (
          <div className="w-full h-full bg-gray-700 flex items-center justify-center">
            <User className="w-5 h-5 text-gray-400" />
          </div>
        )}
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden"
          >
            {/* User Info */}
            <div className="px-4 py-3 border-b border-gray-700">
              <p className="text-sm font-medium text-white truncate">
                {userEmail}
              </p>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full px-4 py-3 flex items-center gap-3 text-left text-sm text-white hover:bg-gray-700 transition-colors"
              type="button"
            >
              <LogOut className="w-4 h-4 text-gray-400" />
              <span>Log out</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

