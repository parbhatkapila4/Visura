"use client";

import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

export const WobbleCard = ({
  children,
  containerClassName,
  className,
  onClick,
}: {
  children: React.ReactNode;
  containerClassName?: string;
  className?: string;
  onClick?: () => void;
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } =
      event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - left - width / 2) / 25;
    const y = (event.clientY - top - height / 2) / 25;
    setMousePosition({ x, y });
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setMousePosition({ x: 0, y: 0 });
  };

  return (
    <motion.div
      className={cn(
        "group/card relative w-full",
        containerClassName
      )}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        transformStyle: "preserve-3d",
      }}
    >
      <motion.div
        className={cn(
          "relative w-full h-full",
          className
        )}
        animate={{
          rotateX: mousePosition.y,
          rotateY: mousePosition.x,
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
        }}
        style={{
          transformStyle: "preserve-3d",
        }}
      >
        <AnimatePresence>
          {isHovering && (
            <motion.div
              className="pointer-events-none absolute inset-0 z-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#04724D]/20 to-[#059669]/20 blur-xl" />
            </motion.div>
          )}
        </AnimatePresence>
        <div className="relative z-10 h-full w-full">
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
};