import { cn } from "@/core/config/utils"
import * as React from "react"

interface GradientTextProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Array of colors for the gradient
   * @default ["#ffaa40", "#9c40ff", "#ffaa40"]
   */
  colors?: string[]
  /**
   * Animation duration in seconds
   * @default 8
   */
  animationSpeed?: number
  /**
   * Show animated border
   * @default false
   */
  showBorder?: boolean
}

export function GradientText({
  children,
  className,
  colors = ["#ffaa40", "#9c40ff", "#ffaa40"],
  animationSpeed = 8,
  showBorder = false,
  ...props
}: GradientTextProps) {
  return (
    <div
      className={cn(
        "relative inline-block",
        className
      )}
      {...props}
    >
      <span
        className="text-transparent bg-clip-text bg-gradient-to-r animate-gradient relative z-20"
        style={{
          backgroundImage: `linear-gradient(to right, ${colors.join(", ")})`,
          backgroundSize: "300% 100%",
          animationDuration: `${animationSpeed}s`,
        }}
      >
        {children}
      </span>
    </div>
  )
}
