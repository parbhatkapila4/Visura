"use client";

import { cn } from "@/lib/utils";
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
    const { left, top, width, height } = event.currentTarget.getBoundingClientRect();
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
    <div className={cn("relative w-full", containerClassName)} onClick={onClick}>
      <div className={cn("relative w-full h-full", className)}>
        <div className="relative z-10 h-full w-full">{children}</div>
      </div>
    </div>
  );
};
