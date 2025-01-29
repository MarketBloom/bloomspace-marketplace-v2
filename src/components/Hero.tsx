import { HomeFilterBar } from "./HomeFilterBar";
import { useState, useEffect } from "react";

// Keyframe animations
const gooeyAnimation = `
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
`;

const fadeAnimations = `
  @keyframes fade-in {
    0% { opacity: 0; }
    100% { opacity: 1; }
  }

  @keyframes fade-in-up {
    0% { 
      opacity: 0;
      transform: translateY(10px);
    }
    100% { 
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

export function Hero() {
  const [currentText, setCurrentText] = useState("first");

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentText((prev) => (prev === "first" ? "second" : "first"));
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <style>
        {gooeyAnimation}
        {fadeAnimations}
      </style>

      {/* Desktop Hero */}
      <section className="hidden md:flex h-[calc(50vh-80px)] min-h-[520px] items-center justify-center bg-[#FFFFFF] z-0 relative">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="/lovable-uploads/772494bc-3f97-4373-a19b-a65990d45123.png"
            alt="Beautiful pink and coral carnations arranged with dramatic shadows"
            className="h-full w-full object-cover object-[50%_30%]"
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/20 to-black/40" />
          {/* Noise Texture */}
          <div 
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)'/%3E%3C/svg%3E")`
            }}
          />
        </div>

        {/* Content Container */}
        <div className="relative z-10 px-8 flex flex-col items-center md:pt-20">
          {/* Fixed width container for morphing text */}
          <div className="w-[750px] mx-auto text-center mb-8 mt-5">
            <div className="h-[72px] text-7xl font-semibold tracking-tight text-white whitespace-nowrap"
                 style={{ 
                   animation: "fade-in-up 0.5s ease-out",
                   textShadow: "0 2px 4px rgba(0, 0, 0, 0.2)"
                 }}>
              {currentText === "first" ? (
                "Your City's Best Florists"
              ) : (
                "All in One Place"
              )}
            </div>
          </div>
          
          <div className="w-full max-w-4xl mt-0">
            <HomeFilterBar />
          </div>
        </div>
      </section>

      {/* Mobile Hero */}
      <section className="flex md:hidden h-[calc(80vh-5px)] items-center justify-center bg-[#FFFFFF] mt-[1px] relative">
        {/* Mobile Background */}
        <div className="absolute inset-0">
          <img
            src="/lovable-uploads/772494bc-3f97-4373-a19b-a65990d45123.png"
            alt="Beautiful pink and coral carnations arranged with dramatic shadows"
            className="h-full w-full object-cover object-[50%_18%]"
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/20 to-black/40" />
          {/* Noise Texture */}
          <div 
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)'/%3E%3C/svg%3E")`
            }}
          />
        </div>

        {/* Mobile Content */}
        <div className="relative z-10 px-8 flex flex-col items-center w-full">
          <div className="w-full max-w-[400px] mx-auto mb-8 mt-8 text-center">
            <div className="text-4xl font-semibold tracking-tight text-white space-y-2"
                 style={{ 
                   animation: "fade-in-up 0.5s ease-out",
                   textShadow: "0 2px 4px rgba(0, 0, 0, 0.2)"
                 }}>
              {currentText === "first" ? (
                <>
                  <div>Your Cities</div>
                  <div>Best Florists</div>
                </>
              ) : (
                <div>All in One Place</div>
              )}
            </div>
          </div>
          
          <div className="w-full max-w-4xl -mt-[50px]">
            <HomeFilterBar />
          </div>
        </div>
      </section>
    </>
  );
} 