"use client";

import React from "react";
import { motion } from "motion/react";
import { cn } from "@/core/config/utils";

interface SwitchAnimatedProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'yellow' | 'success' | 'warning' | 'error';
}

const SwitchAnimated = ({ 
  checked = false, 
  onCheckedChange,
  disabled = false,
  className,
  size = 'md',
  variant = 'yellow'
}: SwitchAnimatedProps) => {
  const handleToggle = () => {
    if (disabled) return;
    onCheckedChange?.(!checked);
  };

  // Size configurations
  const sizeConfig = {
    sm: {
      container: "h-4 w-7",
      thumb: "h-3 w-3",
      translateX: checked ? 12 : 2
    },
    md: {
      container: "h-6 w-11", 
      thumb: "h-5 w-5",
      translateX: checked ? 20 : 4
    },
    lg: {
      container: "h-8 w-14",
      thumb: "h-7 w-7", 
      translateX: checked ? 24 : 4
    }
  };

  // Variant configurations (Adega Wine Cellar theme)
  const variantConfig = {
    default: {
      background: checked ? "bg-gray-800" : "bg-gray-200",
      thumb: checked ? "bg-gray-100" : "bg-gray-900",
      glow: "bg-gray-500"
    },
    yellow: {
      background: checked ? "bg-primary-black" : "bg-gray-200", 
      thumb: checked ? "bg-primary-yellow" : "bg-gray-900",
      glow: "bg-primary-yellow"
    },
    success: {
      background: checked ? "bg-green-800" : "bg-gray-200",
      thumb: checked ? "bg-green-300" : "bg-gray-900", 
      glow: "bg-green-400"
    },
    warning: {
      background: checked ? "bg-yellow-800" : "bg-gray-200",
      thumb: checked ? "bg-yellow-300" : "bg-gray-900",
      glow: "bg-yellow-400"
    },
    error: {
      background: checked ? "bg-red-800" : "bg-gray-200",
      thumb: checked ? "bg-red-300" : "bg-gray-900",
      glow: "bg-red-400"
    }
  };

  const currentSize = sizeConfig[size];
  const currentVariant = variantConfig[variant];

  return (
    <motion.button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={handleToggle}
      disabled={disabled}
      className={cn(
        "relative inline-flex items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-yellow focus-visible:ring-offset-2 focus-visible:ring-offset-black-100",
        currentSize.container,
        currentVariant.background,
        disabled && "opacity-50 cursor-not-allowed",
        !disabled && "cursor-pointer",
        className
      )}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      transition={{
        type: "spring",
        stiffness: 700,
        damping: 30,
      }}
    >
      <motion.span
        className={cn(
          "inline-block rounded-full shadow-lg relative",
          currentSize.thumb,
          currentVariant.thumb
        )}
        animate={{
          x: currentSize.translateX,
        }}
        transition={{
          type: "spring",
          stiffness: 700,
          damping: 30,
          bounce: 0,
        }}
      >
        {checked && (
          <motion.div
            className={cn(
              "absolute inset-0 rounded-full blur-md opacity-60",
              currentVariant.glow
            )}
            initial={{
              scale: 0,
            }}
            animate={{
              scale: 1.2,
            }}
            transition={{
              type: "spring",
              duration: 0.3,
            }}
          />
        )}
      </motion.span>
    </motion.button>
  );
};

export { SwitchAnimated };