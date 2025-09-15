"use client";

import { motion } from "framer-motion";

import { cn } from "@/core/config/utils";
import { getSFProTextClasses } from "@/core/config/theme-utils";

interface BlurIntProps {
  word: string;
  className?: string;
  variant?: {
    hidden: { filter: string; opacity: number };
    visible: { filter: string; opacity: number };
  };
  duration?: number;
  useSFPro?: boolean;
  sfProHierarchy?: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'caption' | 'small' | 'value' | 'label' | 'action' | 'status';
  sfProVariant?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error' | 'purple' | 'neutral';
}
const BlurIn = ({ 
  word, 
  className, 
  variant, 
  duration = 1, 
  useSFPro = true,
  sfProHierarchy = 'h1',
  sfProVariant = 'primary'
}: BlurIntProps) => {
  const defaultVariants = {
    hidden: { filter: "blur(10px)", opacity: 0 },
    visible: { filter: "blur(0px)", opacity: 1 },
  };
  const combinedVariants = variant || defaultVariants;

  return (
    <motion.h1
      initial="hidden"
      animate="visible"
      transition={{ duration }}
      variants={combinedVariants}
      className={cn(
        useSFPro 
          ? getSFProTextClasses(sfProHierarchy, sfProVariant)
          : "font-display text-center text-4xl font-bold tracking-[-0.02em] drop-shadow-sm md:text-7xl md:leading-[5rem]",
        className,
      )}
    >
      {word}
    </motion.h1>
  );
};

export { BlurIn };
