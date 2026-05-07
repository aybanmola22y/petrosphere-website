"use client";

import React from "react";
import { motion } from "framer-motion";

interface LogoMarqueeProps {
  logos: { src: string; alt: string; multiply?: boolean }[];
  speed?: number;
}

export const LogoMarquee = ({ logos, speed = 30 }: LogoMarqueeProps) => {
  // Duplicate logos for seamless looping
  const duplicatedLogos = [...logos, ...logos, ...logos];

  return (
    <div className="relative w-full overflow-hidden py-10 select-none">
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-secondary/40 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-secondary/40 to-transparent z-10 pointer-events-none" />
      
      <motion.div
        className="flex items-center w-max"
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
            className="w-64 md:w-96 flex-shrink-0 flex items-center justify-center transition-all duration-500 hover:scale-110 px-8"
          >
            <img
              src={logo.src}
              alt={logo.alt}
              className={`h-20 md:h-24 w-auto object-contain ${
                logo.multiply ? "mix-blend-multiply" : ""
              }`}
            />
          </div>
        ))}
      </motion.div>
    </div>
  );
};
