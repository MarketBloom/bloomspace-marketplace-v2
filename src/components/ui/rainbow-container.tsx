import React from "react";
import { cn } from "@/lib/utils";

interface RainbowContainerProps extends React.HTMLAttributes<HTMLDivElement> {}

export function RainbowContainer({
  children,
  className,
  ...props
}: RainbowContainerProps) {
  return (
    <div
      className={cn(
        // Container with thin gradient border
        "relative p-[1.5px] rounded-[inherit]",
        "before:absolute before:inset-0 before:rounded-[inherit]",
        "before:p-[1.5px] before:bg-gradient-to-r",
        "before:from-white before:via-[#ff57f5] before:to-white",
        "before:animate-rainbow before:[--speed:4s]",
        
        // Subtle glow effect
        "after:absolute after:inset-0 after:rounded-[inherit] after:-z-10",
        "after:bg-gradient-to-r after:from-white after:via-[#ff57f5] after:to-white",
        "after:blur-lg after:opacity-20 after:animate-rainbow after:[--speed:4s]",
        
        className
      )}
      {...props}
    >
      <div className="relative bg-white/80 backdrop-blur-md rounded-[inherit] h-full">
        {children}
      </div>
    </div>
  );
} 