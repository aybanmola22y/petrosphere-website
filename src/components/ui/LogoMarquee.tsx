"use client";

import React from "react";
import { motion } from "framer-motion";

interface LogoMarqueeProps {
  logos: { src: string; alt: string; multiply?: boolean }[];
  speed?: number;
  /** Smaller logos / less padding — for first-viewport strips */
  compact?: boolean;
}

export const LogoMarquee = ({ logos, speed = 30, compact = false }: LogoMarqueeProps) => {
  // Duplicate logos for seamless looping
  const duplicatedLogos = [...logos, ...logos, ...logos];

  return (
    <div
      className={`relative w-full select-none overflow-hidden ${
        compact ? "py-2 md:py-2.5" : "py-4 md:py-5"
      }`}
    >
      <div className="absolute bottom-0 left-0 top-0 z-10 w-20 pointer-events-none bg-gradient-to-r from-secondary to-transparent md:w-28" />
      <div className="absolute bottom-0 right-0 top-0 z-10 w-20 pointer-events-none bg-gradient-to-l from-secondary to-transparent md:w-28" />

      <motion.div
        className="flex w-max items-center"
        initial={{ x: 0 }}
        animate={{ x: "-33.33%" }}
        transition={{
          duration: speed,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        {duplicatedLogos.map((logo, index) => (
          <div
            key={index}
            className={`flex flex-shrink-0 items-center justify-center transition-all duration-500 hover:scale-110 ${
              compact
                ? "w-36 px-4 md:w-44 md:px-5"
                : "w-64 px-8 md:w-96"
            }`}
          >
            <img
              src={logo.src}
              alt={logo.alt}
              className={`w-auto object-contain ${
                compact ? "h-10 md:h-12" : "h-20 md:h-24"
              } ${logo.multiply ? "mix-blend-multiply" : ""}`}
            />
          </div>
        ))}
      </motion.div>
    </div>
  );
};
