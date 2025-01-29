"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface GooeyTextProps {
  texts: (string | string[])[];
  morphTime?: number;
  cooldownTime?: number;
  className?: string;
  textClassName?: string;
}

export function GooeyText({
  texts,
  morphTime = 1,
  cooldownTime = 3,
  className,
  textClassName
}: GooeyTextProps) {
  const text1Ref = React.useRef<HTMLSpanElement>(null);
  const text2Ref = React.useRef<HTMLSpanElement>(null);
  const animationFrameRef = React.useRef<number>();
  const textIndexRef = React.useRef(0);

  React.useEffect(() => {
    let morph = 0;
    let cooldown = cooldownTime;
    let lastTime = Date.now();

    const setMorph = (fraction: number) => {
      if (text1Ref.current && text2Ref.current) {
        text2Ref.current.style.filter = `blur(${Math.min(8 / fraction - 8, 100)}px)`;
        text2Ref.current.style.opacity = `${Math.pow(fraction, 0.4) * 100}%`;

        fraction = 1 - fraction;
        text1Ref.current.style.filter = `blur(${Math.min(8 / fraction - 8, 100)}px)`;
        text1Ref.current.style.opacity = `${Math.pow(fraction, 0.4) * 100}%`;
      }
    };

    const doCooldown = () => {
      morph = 0;
      if (text1Ref.current && text2Ref.current) {
        text2Ref.current.style.filter = "";
        text2Ref.current.style.opacity = "100%";
        text1Ref.current.style.filter = "";
        text1Ref.current.style.opacity = "0%";
      }
    };

    const doMorph = () => {
      morph -= cooldown;
      cooldown = 0;
      let fraction = morph / morphTime;

      if (fraction > 1) {
        cooldown = cooldownTime;
        fraction = 1;
      }

      setMorph(fraction);
    };

    const animate = () => {
      const now = Date.now();
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      let shouldIncrementIndex = cooldown > 0;
      cooldown -= dt;

      if (cooldown <= 0) {
        if (shouldIncrementIndex) {
          textIndexRef.current = (textIndexRef.current + 1) % texts.length;
          if (text1Ref.current && text2Ref.current) {
            const currentText = texts[textIndexRef.current];
            const nextText = texts[(textIndexRef.current + 1) % texts.length];
            text1Ref.current.innerHTML = Array.isArray(currentText) ? currentText.join('<br/>') : currentText;
            text2Ref.current.innerHTML = Array.isArray(nextText) ? nextText.join('<br/>') : nextText;
          }
        }
        doMorph();
      } else {
        doCooldown();
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    // Initialize text content
    if (text1Ref.current && text2Ref.current) {
      const currentText = texts[textIndexRef.current];
      const nextText = texts[(textIndexRef.current + 1) % texts.length];
      text1Ref.current.innerHTML = Array.isArray(currentText) ? currentText.join('<br/>') : currentText;
      text2Ref.current.innerHTML = Array.isArray(nextText) ? nextText.join('<br/>') : nextText;
    }

    // Start animation
    animationFrameRef.current = requestAnimationFrame(animate);

    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [texts, morphTime, cooldownTime]);

  return (
    <div className={cn("relative", className)}>
      <svg className="absolute h-0 w-0" aria-hidden="true" focusable="false">
        <defs>
          <filter id="threshold">
            <feColorMatrix
              in="SourceGraphic"
              type="matrix"
              values="1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      0 0 0 255 -140"
            />
          </filter>
        </defs>
      </svg>

      <div
        className="flex items-center justify-center"
        style={{ filter: "url(#threshold)" }}
      >
        <span
          ref={text1Ref}
          className={cn(
            "absolute inline-block select-none text-center",
            "text-foreground",
            textClassName
          )}
        />
        <span
          ref={text2Ref}
          className={cn(
            "absolute inline-block select-none text-center",
            "text-foreground",
            textClassName
          )}
        />
      </div>
    </div>
  );
}