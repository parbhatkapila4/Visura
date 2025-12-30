"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import PlanBadge from "./plan-badge";
import UserMenu from "./user-menu";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { usePathname } from "next/navigation";
import { Menu, X, Sparkles, ArrowRight } from "lucide-react";

const AnimatedNavLink = ({
  href,
  children,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
}) => {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== "/" && pathname?.startsWith(href));

  return (
    <Link href={href} onClick={onClick}>
      <motion.span
        className="relative px-4 py-2 text-sm font-medium text-white/70 hover:text-white transition-colors cursor-pointer group"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {children}
        <motion.span
          className={`absolute bottom-0 left-1/2 h-[2px] bg-gradient-to-r from-[#ff6b00] to-[#ff00ff] rounded-full ${
            isActive ? "w-1/2" : "w-0"
          }`}
          style={{ x: "-50%" }}
          whileHover={{ width: "50%" }}
          transition={{ duration: 0.2 }}
        />
        <motion.span className="absolute inset-0 rounded-lg bg-white/0 group-hover:bg-white/5 transition-colors" />
      </motion.span>
    </Link>
  );
};

const AnimatedLogo = () => {
  return (
    <Link href="/">
      <motion.div
        className="flex items-center gap-3 cursor-pointer"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div className="relative">
          <motion.div
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ff6b00] via-[#ff00ff] to-[#ff6b00] p-[2px]"
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            style={{ backgroundSize: "200% 200%" }}
          >
            <div className="w-full h-full rounded-[10px] bg-black flex items-center justify-center">
              <motion.span
                className="text-lg font-black bg-gradient-to-r from-[#ff6b00] to-[#ff00ff] bg-clip-text text-transparent"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                V
              </motion.span>
            </div>
          </motion.div>

          <motion.div
            className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#ff6b00] to-[#ff00ff] opacity-0 blur-lg"
            animate={{ opacity: [0, 0.4, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>

        <motion.span
          className="text-xl font-bold text-white hidden sm:block"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
        >
          Visura
        </motion.span>
      </motion.div>
    </Link>
  );
};

const MobileMenu = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="fixed top-0 right-0 h-full w-[300px] bg-black/90 backdrop-blur-xl border-l border-white/10 z-50 p-6"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
          >
            <motion.button
              onClick={onClose}
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white"
              whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.2)" }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-5 h-5" />
            </motion.button>

            <nav className="mt-16 space-y-2">
              {[
                { href: "/features", label: "Features" },
                { href: "/about", label: "About" },
                { href: "/changelog", label: "Changelog" },
              ].map((item, i) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link href={item.href} onClick={onClose}>
                    <motion.div
                      className="flex items-center justify-between px-4 py-3 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                      whileHover={{ x: 5 }}
                    >
                      <span className="text-lg font-medium">{item.label}</span>
                      <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100" />
                    </motion.div>
                  </Link>
                </motion.div>
              ))}
            </nav>

            <div className="mt-8 space-y-3">
              <SignedOut>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Link href="/sign-in" onClick={onClose}>
                    <motion.button
                      className="w-full py-3 rounded-xl border border-white/20 text-white font-medium"
                      whileHover={{ backgroundColor: "rgba(255,255,255,0.1)" }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Log in
                    </motion.button>
                  </Link>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Link href="/sign-up" onClick={onClose}>
                    <motion.button
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-[#ff6b00] to-[#ff00ff] text-white font-medium"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Sign up free
                    </motion.button>
                  </Link>
                </motion.div>
              </SignedOut>
              <SignedIn>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Link href="/workspaces" onClick={onClose}>
                    <motion.button
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-[#ff6b00] to-[#ff00ff] text-white font-medium"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Workspace
                    </motion.button>
                  </Link>
                </motion.div>
              </SignedIn>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { scrollY } = useScroll();

  const isChatbotPage = pathname?.includes("/chatbot");
  const isHomePage = pathname === "/";

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);

    if (latest < lastScrollY && latest > 100) {
      setIsVisible(false);
    } else if (latest > lastScrollY) {
      setIsVisible(true);
    } else if (latest <= 100) {
      setIsVisible(true);
    }

    setLastScrollY(latest);

    if (isMobileMenuOpen && Math.abs(latest - lastScrollY) > 10) {
      setIsMobileMenuOpen(false);
    }
  });

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  if (!isHomePage || isChatbotPage) {
    return null;
  }

  return (
    <>
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-50 px-4 transition-all duration-300 bg-black ${
          isScrolled ? "py-2" : "py-4"
        }`}
        initial={{ y: -100 }}
        animate={{
          y: isVisible ? 0 : -100,
          opacity: isVisible ? 1 : 0,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <motion.div
          className={`max-w-6xl mx-auto rounded-2xl transition-all duration-300 ${
            isScrolled
              ? "bg-[#0a0a0a] backdrop-blur-xl border-t border-l border-r border-white/10 shadow-2xl shadow-black/50"
              : isHomePage
              ? "bg-[#0a0a0a] backdrop-blur-md border-t border-l border-r border-white/5"
              : "bg-[#0a0a0a] backdrop-blur-xl border-t border-l border-r border-white/10"
          }`}
          layout
        >
          <div className="px-4 sm:px-6 py-3 grid grid-cols-3 items-center">
            <div className="flex justify-start">
              <AnimatedLogo />
            </div>

            <div className="hidden md:flex items-center justify-center gap-1">
              <AnimatedNavLink href="/features">Features</AnimatedNavLink>
              <AnimatedNavLink href="/about">About</AnimatedNavLink>
              <AnimatedNavLink href="/changelog">Changelog</AnimatedNavLink>
            </div>

            <div className="hidden md:flex items-center justify-end gap-3">
              <SignedOut>
                <Link href="/sign-in">
                  <motion.button
                    className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Log in
                  </motion.button>
                </Link>
                <Link href="/sign-up">
                  <motion.button
                    className="relative px-5 py-2 text-sm font-semibold text-white rounded-full overflow-hidden group"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-[#ff6b00] to-[#ff00ff]"
                      whileHover={{
                        backgroundPosition: ["0% 50%", "100% 50%"],
                      }}
                      transition={{ duration: 0.5 }}
                    />
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: "100%" }}
                      transition={{ duration: 0.5 }}
                    />
                    <span className="relative z-10">Sign up</span>
                  </motion.button>
                </Link>
              </SignedOut>

              <SignedIn>
                <Link href="/workspaces">
                  <motion.button
                    className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Workspace
                  </motion.button>
                </Link>
                <PlanBadge />
                <UserMenu />
              </SignedIn>
            </div>

            <div className="md:hidden flex justify-end col-start-3">
              <motion.button
                className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white"
                onClick={() => setIsMobileMenuOpen(true)}
                whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.15)" }}
                whileTap={{ scale: 0.9 }}
              >
                <Menu className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.nav>

      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      <div className={`${isScrolled ? "h-16" : "h-20"} transition-all duration-300`} />
    </>
  );
}
