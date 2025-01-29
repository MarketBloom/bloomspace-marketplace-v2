import React from "react";
import { cn } from "@/lib/utils";

interface GooeyTextProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const GooeyText = ({ children, className, ...props }: GooeyTextProps) => {
  return (
    <div 
      className={cn(
        "relative transition-all duration-200 hover:scale-[1.02]",
        className
      )}
      {...props}
    >
      <div className="relative z-10">
        {children}
      </div>
      <div 
        className="absolute inset-0 blur-[32px] opacity-70 bg-gradient-to-r from-pink-200 via-pink-100 to-pink-200 animate-gooey"
      />
      <style>
        {`
          @keyframes gooey {
            0%, 100% {
              transform: translate(0, 0) scale(1);
              filter: blur(32px);
            }
            33% {
              transform: translate(5px, -5px) scale(1.1);
              filter: blur(24px);
            }
            66% {
              transform: translate(-5px, 5px) scale(0.95);
              filter: blur(40px);
            }
          }
          
          .animate-gooey {
            animation: gooey 8s ease-in-out infinite;
          }
        `}
      </style>
    </div>
  );
};